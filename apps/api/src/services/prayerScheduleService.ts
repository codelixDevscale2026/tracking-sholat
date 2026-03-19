import { addMinutes, differenceInSeconds } from "date-fns";
import type {
	DailyPrayerSchedule,
	PrayerLog,
} from "../generated/prisma/index.js";
import { prisma } from "../utils/prisma.js";
import {
	getYMDInTimeZone,
	parseHHMM,
	zonedDateTimeToUtc,
} from "../utils/timezone.js";
import {
	fetchFromAlAdhan,
	fetchFromMyQuran,
	type PrayerName,
} from "./prayerProviders.js";

const PRAYER_ORDER: PrayerName[] = [
	"subuh",
	"dzuhur",
	"ashar",
	"maghrib",
	"isya",
];

function toNumberDecimal(value: any) {
	if (value == null) return null;
	if (typeof value === "number") return value;
	if (typeof value?.toNumber === "function") return value.toNumber();
	return Number(value);
}

function getPrayerStatus(options: {
	log: PrayerLog | null;
	now: Date;
	adzan: Date;
}) {
	const { log, now, adzan } = options;
	if (log?.status) return log.status;
	if (now.getTime() < adzan.getTime()) return "upcoming";
	return "pending";
}

export async function getTodaySchedule(options: { userId: number }) {
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
		let provider: PrayerSchedule;
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

	const normalized = PRAYER_ORDER.map((prayerName) => {
		const schedule = schedules.find((s) => s.prayerName === prayerName);
		if (!schedule) {
			throw new Error(`Missing schedule for prayer ${prayerName}`);
		}
		const log = logs.find((l) => l.prayerName === prayerName) ?? null;
		const status = getPrayerStatus({
			log,
			now,
			adzan: schedule.scheduledAdzanTime,
		});
		const bufferLimit = addMinutes(schedule.scheduledAdzanTime, bufferMinutes);

		return {
			prayerName,
			scheduledAdzanTime: schedule.scheduledAdzanTime.toISOString(),
			bufferLimit: bufferLimit.toISOString(),
			status,
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
