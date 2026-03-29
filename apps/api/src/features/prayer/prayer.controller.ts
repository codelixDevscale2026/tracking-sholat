import { addDays, addMinutes, differenceInSeconds } from "date-fns";
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
import { getPrayerHistory } from "./history.service.js";
import type { CheckInResponse, PrayerTodayResponse } from "./prayer.schema.js";
import {
	fetchFromAlAdhan,
	fetchFromMyQuran,
	type PrayerName,
	type ProviderResult,
} from "./prayer.service.js";
import {
	calculateCheckInStatus,
	type PrayerStatus,
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

async function ensureDailySchedule(options: {
	userId: number;
	date: Date;
	ymd: { year: number; month: number; day: number };
	timeZone: string;
	calculationMethod: string;
	cityName: string;
	latitude: number;
	longitude: number;
}): Promise<DailyPrayerSchedule[]> {
	const {
		userId,
		date,
		ymd,
		timeZone,
		calculationMethod,
		cityName,
		latitude,
		longitude,
	} = options;

	const cached = await prisma.dailyPrayerSchedule.findMany({
		where: {
			userId,
			date,
		},
	});

	const hasAllPrayers = PRAYER_ORDER.every((p) =>
		cached.some((s) => s.prayerName === p),
	);

	const isCacheCompatible = cached.every((s) => {
		if (s.calculationMethod !== calculationMethod) return false;
		const lat = toNumberDecimal(s.latitude);
		const lon = toNumberDecimal(s.longitude);
		if (lat == null || lon == null) return false;
		return Math.abs(lat - latitude) < 1e-6 && Math.abs(lon - longitude) < 1e-6;
	});

	if (hasAllPrayers && isCacheCompatible) {
		return cached;
	}

	let provider: ProviderResult;
	try {
		// Prioritaskan API MyQuran (Data resmi Kemenag MABIMS)
		provider = await fetchFromMyQuran({
			date: ymd,
			cityName,
			method: calculationMethod === "mwl" ? "kemenag" : calculationMethod,
		});
	} catch (_) {
		// Fallback ke AlAdhan jika kota tidak dikenali atau berada di luar Indonesia
		provider = await fetchFromAlAdhan({
			date: ymd,
			latitude,
			longitude,
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
					date,
					prayerName,
				},
			},
			create: {
				userId,
				date,
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

	return Promise.all(upserts);
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
	const calculationMethod = settings?.calculationMethod || "kemenag";
	const bufferMinutes = settings?.globalBufferMinutes ?? 20;
	const cityName = settings?.cityName || "KOTA JAKARTA";

	const latitude = toNumberDecimal(settings?.latitude) ?? -6.2;
	const longitude = toNumberDecimal(settings?.longitude) ?? 106.8;
	const now = new Date();
	const ymd = getYMDInTimeZone(now, timeZone);

	// date column is DATE without time; store as UTC midnight of that YMD for stable equality.
	const scheduleDate = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day));

	const schedules = await ensureDailySchedule({
		userId,
		date: scheduleDate,
		ymd,
		timeZone,
		calculationMethod,
		cityName,
		latitude,
		longitude,
	});

	const logs = await prisma.prayerLog.findMany({
		where: {
			userId,
			date: scheduleDate,
		},
	});

	// Find today's next prayer
	const nextToday = schedules
		.map((s) => ({
			prayerName: s.prayerName,
			adzan: s.scheduledAdzanTime,
		}))
		.find((p) => p.adzan.getTime() > now.getTime());

	let finalNextPrayer: { prayerName: string; adzan: Date };

	if (nextToday) {
		finalNextPrayer = nextToday;
	} else {
		// All today's prayers finished, get tomorrow's Subuh
		const tomorrow = addDays(now, 1);
		const ymdTomorrow = getYMDInTimeZone(tomorrow, timeZone);
		const scheduleDateTomorrow = new Date(
			Date.UTC(ymdTomorrow.year, ymdTomorrow.month - 1, ymdTomorrow.day),
		);

		const tomorrowSchedules = await ensureDailySchedule({
			userId,
			date: scheduleDateTomorrow,
			ymd: ymdTomorrow,
			timeZone,
			calculationMethod,
			cityName,
			latitude,
			longitude,
		});

		const nextSubuh = tomorrowSchedules.find((s) => s.prayerName === "subuh");
		if (!nextSubuh) {
			throw new Error("Failed to fetch tomorrow's Subuh");
		}
		finalNextPrayer = {
			prayerName: "subuh",
			adzan: nextSubuh.scheduledAdzanTime,
		};
	}

	// Build map of prayer schedules for easy lookup
	const scheduleMap = new Map(schedules.map((s) => [s.prayerName, s]));

	const normalized = PRAYER_ORDER.map((prayerName, index) => {
		const schedule = scheduleMap.get(prayerName);
		if (!schedule) {
			throw new Error(`Missing schedule for prayer ${prayerName}`);
		}

		// Get next prayer's adzan time (today or tomorrow's Subuh)
		const nextInOrder = PRAYER_ORDER[index + 1];
		const nextAdzan = nextInOrder
			? scheduleMap.get(nextInOrder)?.scheduledAdzanTime
			: finalNextPrayer.adzan;

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
			isChecked: !!log?.checkInTimestamp,
		};
	});

	const nextPrayer = {
		prayerName: finalNextPrayer.prayerName,
		countdownSeconds: Math.max(
			0,
			differenceInSeconds(finalNextPrayer.adzan, now),
		),
	};

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
		status: prayerLog.status as PrayerStatus,
		responseTimeMinutes: prayerLog.responseTimeMinutes ?? 0,
	};
}

export async function getHistory(options: {
	userId: number;
	period: string;
	date?: string;
	page: number;
	perPage: number;
}) {
	return getPrayerHistory(options);
}
