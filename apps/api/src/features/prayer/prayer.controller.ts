import { addMinutes, differenceInSeconds } from "date-fns";
import { HTTPException } from "hono/http-exception";
import type {
	DailyPrayerSchedule,
	PrayerLog,
} from "../../generated/prisma/index.js";
import { prisma } from "../../utils/prisma.js";
import {
	getYMDInTimeZone,
	parseHHMM,
	zonedDateTimeToUtc,
} from "../../utils/timezone.js";
import type { CheckInResponse, PrayerTodayResponse } from "./prayer.schema.js";
import {
	fetchFromAlAdhan,
	fetchFromMyQuran,
	type PrayerName,
	type ProviderResult,
} from "./prayer.service.js";
import {
	calculateCheckInStatus,
	validateCheckInTime,
} from "./prayer-checkin.service.js";

const PRAYER_ORDER: PrayerName[] = [
	"subuh",
	"dzuhur",
	"ashar",
	"maghrib",
	"isya",
];

function toNumberDecimal(value: unknown) {
	if (value == null) return null;
	if (typeof value === "number") return value;
	if (typeof (value as any)?.toNumber === "function")
		return (value as any).toNumber();
	return Number(value);
}

function getPrayerStatus(options: {
	log: PrayerLog | null;
	now: Date;
	adzan: Date;
	nextAdzan?: Date;
}): string {
	const { log, now, adzan, nextAdzan } = options;

	// If already checked in, return the stored status
	if (log?.checkInTimestamp) {
		return log.status;
	}

	// If prayer time hasn't started yet
	if (now.getTime() < adzan.getTime()) {
		return "upcoming";
	}

	// If next prayer time has passed and user hasn't checked in → MISSED
	if (nextAdzan && now.getTime() >= nextAdzan.getTime()) {
		return "missed";
	}

	// Prayer time has started but not finished (still in current prayer window)
	return "pending";
}

export async function getTodaySchedule(options: {
	userId: number;
}): Promise<PrayerTodayResponse> {
	const { userId } = options;
	// Ensure FK constraints won't fail when caching schedules.
	// In real usage, the user is created via the auth/register flow.
	await prisma.user.upsert({
		where: { id: userId },
		create: {
			id: userId,
			fullName: `User ${userId}`,
			email: `user${userId}@local.dev`,
			passwordHash: "dev",
			username: `user${userId}`,
		},
		update: {},
	});

	const settings = await prisma.prayerSettings.findUnique({
		where: { userId },
	});

	// Defaults so the endpoint works before settings UI/seed exists.
	const timeZone = settings?.timezone || "Asia/Jakarta";
	const calculationMethod = settings?.calculationMethod || "mwl";
	const bufferMinutes = settings?.globalBufferMinutes ?? 20;
	const cityName = settings?.cityName || "KOTA JAKARTA";

	const latitude = toNumberDecimal(settings?.latitude) ?? -6.2;
	const longitude = toNumberDecimal(settings?.longitude) ?? 106.8;
	const now = new Date();
	const ymd = getYMDInTimeZone(now, timeZone);

	// date column is DATE without time; store as UTC midnight of that YMD for stable equality.
	const scheduleDate = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day));

	const cached = await prisma.dailyPrayerSchedule.findMany({
		where: {
			userId,
			date: scheduleDate,
		},
	});

	let schedules: DailyPrayerSchedule[] = cached;

	const hasAllPrayers = PRAYER_ORDER.every((p) =>
		schedules.some((s) => s.prayerName === p),
	);

	const isCacheCompatible = schedules.every((s) => {
		if (s.calculationMethod !== calculationMethod) return false;
		const lat = toNumberDecimal(s.latitude);
		const lon = toNumberDecimal(s.longitude);
		if (lat == null || lon == null) return false;
		// allow tiny float/decimal differences
		return Math.abs(lat - latitude) < 1e-6 && Math.abs(lon - longitude) < 1e-6;
	});

	if (!hasAllPrayers || !isCacheCompatible) {
		let provider: ProviderResult;
		try {
			provider = await fetchFromAlAdhan({
				date: ymd,
				latitude,
				longitude,
				method: calculationMethod,
			});
		} catch (_) {
			provider = await fetchFromMyQuran({
				date: ymd,
				cityName,
				method: calculationMethod,
			});
		}

		const upserts = PRAYER_ORDER.map(async (prayerName) => {
			const { hour, minute } = parseHHMM(provider.timings[prayerName]);
			const utc = zonedDateTimeToUtc({
				year: ymd.year,
				month: ymd.month,
				day: ymd.day,
				hour,
				minute,
				timeZone,
			});

			return prisma.dailyPrayerSchedule.upsert({
				where: {
					userId_date_prayerName: {
						userId,
						date: scheduleDate,
						prayerName,
					},
				},
				create: {
					userId,
					date: scheduleDate,
					prayerName,
					scheduledAdzanTime: utc,
					calculationMethod,
					latitude,
					longitude,
				},
				update: {
					scheduledAdzanTime: utc,
					calculationMethod,
					latitude,
					longitude,
					fetchedAt: new Date(),
				},
			});
		});

		schedules = await Promise.all(upserts);
	}

	const logs = await prisma.prayerLog.findMany({
		where: {
			userId,
			date: scheduleDate,
		},
	});

	// Build map of prayer schedules for easy lookup
	const scheduleMap = new Map(schedules.map((s) => [s.prayerName, s]));

	const normalized = PRAYER_ORDER.map((prayerName, index) => {
		const schedule = scheduleMap.get(prayerName);
		if (!schedule) {
			throw new Error(`Missing schedule for prayer ${prayerName}`);
		}

		// Get next prayer's adzan time (if exists)
		const nextPrayerName = PRAYER_ORDER[index + 1];
		const nextAdzan = nextPrayerName
			? scheduleMap.get(nextPrayerName)?.scheduledAdzanTime
			: undefined;

		const log = logs.find((l) => l.prayerName === prayerName) ?? null;
		const status = getPrayerStatus({
			log,
			now,
			adzan: schedule.scheduledAdzanTime,
			nextAdzan,
		});
		const bufferLimit = addMinutes(schedule.scheduledAdzanTime, bufferMinutes);

		return {
			prayerName,
			scheduledAdzanTime: schedule.scheduledAdzanTime.toISOString(),
			bufferLimit: bufferLimit.toISOString(),
			status,
			checkInAt: log?.checkInTimestamp?.toISOString() ?? null,
			responseTimeMinutes: log?.responseTimeMinutes ?? null,
			isChecked: log?.checkInTimestamp !== null,
		};
	});

	// Next prayer and countdown
	const next = normalized
		.map((s) => ({
			prayerName: s.prayerName,
			adzan: new Date(s.scheduledAdzanTime),
		}))
		.find((p) => p.adzan.getTime() > now.getTime());

	const nextPrayer = next
		? {
				prayerName: next.prayerName,
				countdownSeconds: Math.max(0, differenceInSeconds(next.adzan, now)),
			}
		: undefined;

	return {
		cityName,
		timezone: timeZone,
		schedules: normalized,
		nextPrayer,
	};
}

export async function checkInPrayer(options: {
	userId: number;
	prayerName: PrayerName;
}): Promise<CheckInResponse> {
	const { userId, prayerName } = options;
	const now = new Date();

	// Get user settings
	const settings = await prisma.prayerSettings.findUnique({
		where: { userId },
	});

	if (!settings) {
		throw new HTTPException(400, { message: "User settings not found" });
	}

	const timeZone = settings.timezone || "Asia/Jakarta";
	const bufferMinutes = settings.globalBufferMinutes ?? 20;

	// Get today's schedule date
	const ymd = getYMDInTimeZone(now, timeZone);
	const scheduleDate = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day));

	// Find the prayer schedule
	const schedule = await prisma.dailyPrayerSchedule.findUnique({
		where: {
			userId_date_prayerName: {
				userId,
				date: scheduleDate,
				prayerName,
			},
		},
	});

	if (!schedule) {
		throw new HTTPException(404, {
			message: "Prayer schedule not found for today",
		});
	}

	// Check if already checked in
	const existingLog = await prisma.prayerLog.findUnique({
		where: {
			userId_date_prayerName: {
				userId,
				date: scheduleDate,
				prayerName,
			},
		},
	});

	if (existingLog?.checkInTimestamp) {
		throw new HTTPException(409, {
			message: "DUPLICATE_CHECKIN",
		});
	}

	// Check if already missed
	if (existingLog?.status === "MISSED") {
		throw new HTTPException(422, {
			message: "PRAYER_ALREADY_MISSED",
		});
	}

	// Validate check-in time
	const timeValidation = validateCheckInTime({
		checkInAt: now,
		adzanTime: schedule.scheduledAdzanTime,
	});

	if (!timeValidation.valid) {
		throw new HTTPException(400, {
			message: timeValidation.error,
		});
	}

	// Get next prayer time for validation
	const prayerOrder: PrayerName[] = [
		"subuh",
		"dzuhur",
		"ashar",
		"maghrib",
		"isya",
	];
	const currentIndex = prayerOrder.indexOf(prayerName);
	const nextPrayerName =
		currentIndex < prayerOrder.length - 1
			? prayerOrder[currentIndex + 1]
			: null;

	let nextAdzanTime: Date | undefined;
	if (nextPrayerName) {
		const nextSchedule = await prisma.dailyPrayerSchedule.findUnique({
			where: {
				userId_date_prayerName: {
					userId,
					date: scheduleDate,
					prayerName: nextPrayerName,
				},
			},
		});
		nextAdzanTime = nextSchedule?.scheduledAdzanTime;
	}

	// Calculate status
	const checkInResult = calculateCheckInStatus({
		checkInAt: now,
		adzanTime: schedule.scheduledAdzanTime,
		bufferMinutes,
		nextAdzanTime,
	});

	// Create or update prayer log
	const prayerLog = await prisma.prayerLog.upsert({
		where: {
			userId_date_prayerName: {
				userId,
				date: scheduleDate,
				prayerName,
			},
		},
		create: {
			userId,
			prayerName,
			date: scheduleDate,
			checkInTimestamp: now,
			status: checkInResult.status,
			bufferSnapshotMinutes: bufferMinutes,
			adzanSnapshotTime: schedule.scheduledAdzanTime,
			responseTimeMinutes: checkInResult.responseTimeMinutes,
		},
		update: {
			checkInTimestamp: now,
			status: checkInResult.status,
			bufferSnapshotMinutes: bufferMinutes,
			adzanSnapshotTime: schedule.scheduledAdzanTime,
			responseTimeMinutes: checkInResult.responseTimeMinutes,
		},
	});

	return {
		prayerName,
		adzanTime: schedule.scheduledAdzanTime.toISOString(),
		bufferLimit: checkInResult.bufferLimit.toISOString(),
		checkInAt: now.toISOString(),
		status: prayerLog.status,
		responseTimeMinutes: prayerLog.responseTimeMinutes ?? 0,
	};
}
