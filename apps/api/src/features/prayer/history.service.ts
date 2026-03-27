import { addDays, subDays } from "date-fns";
import { prisma } from "../../utils/prisma.js";
import { getYMDInTimeZone } from "../../utils/timezone.js";
import type {
	HistoryDayGroup,
	HistoryPrayerItem,
	HistoryResponse,
} from "./prayer.schema.js";

const PRAYER_ORDER = ["subuh", "dzuhur", "ashar", "maghrib", "isya"] as const;

function getDateRange(period: string, referenceDate: Date, timezone: string) {
	const ymd = getYMDInTimeZone(referenceDate, timezone);
	const ref = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day));

	if (period === "daily") {
		return { from: ref, to: ref };
	}
	if (period === "weekly") {
		return { from: subDays(ref, 6), to: ref };
	}
	if (period === "monthly") {
		return { from: subDays(ref, 29), to: ref };
	}
	return { from: ref, to: ref };
}

export async function getPrayerHistory(options: {
	userId: number;
	period: string;
	date?: string;
	page: number;
	perPage: number;
}): Promise<HistoryResponse> {
	const { userId, period, date, page, perPage } = options;

	const settings = await prisma.prayerSettings.findUnique({
		where: { userId },
	});
	const timezone = settings?.timezone ?? "Asia/Jakarta";

	let referenceDate: Date;
	if (date) {
		const [y, m, d] = date.split("-").map(Number);
		referenceDate = new Date(Date.UTC(y, m - 1, d));
	} else {
		referenceDate = new Date();
	}

	const { from, to } = getDateRange(period, referenceDate, timezone);

	// First, we need to find all unique dates in the range for this user that have logs.
	// But actually, we want to show all dates in the range, even if empty?
	// The PRD says "see prayer records from previous days".
	// Let's query all logs in the range.
	const logs = await prisma.prayerLog.findMany({
		where: {
			userId,
			date: {
				gte: from,
				lte: to,
			},
		},
		include: {
			DailyPrayerSchedule: true,
		},
		orderBy: {
			date: "desc",
		},
	});

	// Group logs by date string
	const logsByDate = new Map<string, typeof logs>();
	for (const log of logs) {
		const dateStr = log.date.toISOString().split("T")[0];
		if (!logsByDate.has(dateStr)) {
			logsByDate.set(dateStr, []);
		}
		logsByDate.get(dateStr)?.push(log);
	}

	// Get all unique dates from the logs, sorted descending
	const uniqueDates = Array.from(logsByDate.keys()).sort((a, b) =>
		b.localeCompare(a),
	);

	const totalDays = uniqueDates.length;
	const totalPages = Math.max(1, Math.ceil(totalDays / perPage));
	const currentPage = Math.min(page, totalPages);
	const paginatedDates = uniqueDates.slice(
		(currentPage - 1) * perPage,
		currentPage * perPage,
	);

	const data: HistoryDayGroup[] = paginatedDates.map((dateStr) => {
		const dayLogs = logsByDate.get(dateStr) || [];

		const prayers = PRAYER_ORDER.map((prayerName) => {
			const log = dayLogs.find((l) => l.prayerName === prayerName);
			if (!log) return null;

			const adzanTime =
				log.adzanSnapshotTime ?? log.DailyPrayerSchedule?.scheduledAdzanTime;
			const bufferMinutes =
				log.bufferSnapshotMinutes ?? settings?.globalBufferMinutes ?? 20;
			const _bufferLimit = adzanTime ? addDays(adzanTime, 0) : null; // just to clone if needed, but we use addMinutes below

			// Re-calculating buffer limit for response
			const limit = adzanTime
				? new Date(adzanTime.getTime() + bufferMinutes * 60000)
				: null;

			return {
				prayer_name: prayerName,
				adzan_time: adzanTime?.toISOString() ?? "",
				buffer_limit: limit?.toISOString() ?? "",
				check_in_at: log.checkInTimestamp?.toISOString() ?? null,
				status: log.status.toLowerCase().replace("_", "-"), // ON_TIME -> on-time
				response_time_minutes: log.responseTimeMinutes,
			};
		}).filter((p): p is HistoryPrayerItem => p !== null);

		const totalCompleted = prayers.filter((p) => p.status !== "missed").length;

		return {
			date: dateStr,
			total_completed: totalCompleted,
			total_prayers: prayers.length,
			prayers,
		};
	});

	return {
		period,
		pagination: {
			current_page: currentPage,
			per_page: perPage,
			total_pages: totalPages,
		},
		data,
	};
}
