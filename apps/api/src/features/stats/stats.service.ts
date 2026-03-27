import {
	eachDayOfInterval,
	endOfDay,
	endOfMonth,
	endOfWeek,
	format,
	isEqual,
	startOfDay,
	startOfMonth,
	startOfWeek,
	subDays,
} from "date-fns";
import { prisma } from "../../utils/prisma.js";
import type { PrayerName } from "../prayer/prayer.service.js";
import type {
	DailyTrend,
	PrayerBreakdownItem,
	StatsSummary,
} from "./stats.schema.js";

const PRAYER_NAMES: PrayerName[] = [
	"subuh",
	"dzuhur",
	"ashar",
	"maghrib",
	"isya",
];

export function getDateRange(
	period: "daily" | "weekly" | "monthly",
	referenceDate: Date,
) {
	let from: Date;
	let to: Date;

	switch (period) {
		case "daily":
			from = startOfDay(referenceDate);
			to = endOfDay(referenceDate);
			break;
		case "weekly":
			from = startOfWeek(referenceDate, { weekStartsOn: 1 });
			to = endOfWeek(referenceDate, { weekStartsOn: 1 });
			break;
		case "monthly":
			from = startOfMonth(referenceDate);
			to = endOfMonth(referenceDate);
			break;
	}

	return { from, to };
}

export async function getStatsSummary(
	userId: number,
	from: Date,
	to: Date,
): Promise<StatsSummary> {
	const aggregate = await prisma.prayerLog.groupBy({
		by: ["status"],
		where: {
			userId,
			date: {
				gte: from,
				lte: to,
			},
		},
		_count: {
			_all: true,
		},
	});

	let totalOnTime = 0;
	let totalPerformed = 0;
	let totalMissed = 0;

	for (const item of aggregate) {
		if (item.status === "ON_TIME") totalOnTime = item._count._all;
		if (item.status === "PERFORMED") totalPerformed = item._count._all;
		if (item.status === "MISSED") totalMissed = item._count._all;
	}

	const totalPrayers = totalOnTime + totalPerformed + totalMissed;
	const onTimePercentage =
		totalPrayers > 0 ? Math.round((totalOnTime / totalPrayers) * 100) : 0;

	const avgResponse = await prisma.prayerLog.aggregate({
		where: {
			userId,
			date: { gte: from, lte: to },
			status: { in: ["ON_TIME", "PERFORMED"] },
		},
		_avg: {
			responseTimeMinutes: true,
		},
	});

	const streak = await getStreakDays(userId);

	return {
		total_on_time: totalOnTime,
		total_performed: totalPerformed,
		total_missed: totalMissed,
		total_prayers: totalPrayers,
		on_time_percentage: onTimePercentage,
		average_response_time_minutes: Math.round(
			avgResponse._avg.responseTimeMinutes || 0,
		),
		streak_days: streak,
	};
}

export async function getStreakDays(userId: number): Promise<number> {
	// A streak is counted if user has all 5 prayers checked in (ON_TIME or PERFORMED) for consecutive days
	// starting from yesterday back in time. Today is included if all prayers so far are checked in,
	// but usually streaks are calculated on finished days.

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// Get all days where user has 5 completed prayers
	const completedDays = await prisma.prayerLog.groupBy({
		by: ["date"],
		where: {
			userId,
			status: { in: ["ON_TIME", "PERFORMED"] },
		},
		having: {
			prayerName: {
				_count: {
					equals: 5,
				},
			},
		},
		orderBy: {
			date: "desc",
		},
	});

	if (completedDays.length === 0) return 0;

	let streak = 0;
	const _currentDate = today;

	// Check if today is completed or yesterday was the last completed day
	const lastCompletedDate = new Date(completedDays[0].date);
	lastCompletedDate.setHours(0, 0, 0, 0);

	// If the most recent completed day is not today or yesterday, streak is broken
	if (lastCompletedDate < subDays(today, 1)) {
		return 0;
	}

	// Iterate and count consecutive days
	let checkDate = lastCompletedDate;
	for (const day of completedDays) {
		const dayDate = new Date(day.date);
		dayDate.setHours(0, 0, 0, 0);

		if (isEqual(dayDate, checkDate)) {
			streak++;
			checkDate = subDays(checkDate, 1);
		} else {
			break;
		}
	}

	return streak;
}

export async function getDailyTrend(
	userId: number,
	from: Date,
	to: Date,
): Promise<DailyTrend[]> {
	const logs = await prisma.prayerLog.findMany({
		where: {
			userId,
			date: { gte: from, lte: to },
		},
	});

	const days = eachDayOfInterval({ start: from, end: to });

	return days.map((date) => {
		const dayLogs = logs.filter(
			(l) => format(l.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
		);
		return {
			day: format(date, "EEE"),
			date: format(date, "yyyy-MM-dd"),
			on_time: dayLogs.filter((l) => l.status === "ON_TIME").length,
			performed: dayLogs.filter((l) => l.status === "PERFORMED").length,
			missed: dayLogs.filter((l) => l.status === "MISSED").length,
		};
	});
}

export async function getPrayerBreakdown(
	userId: number,
	from: Date,
	to: Date,
): Promise<PrayerBreakdownItem[]> {
	const aggregate = await prisma.prayerLog.groupBy({
		by: ["prayerName", "status"],
		where: {
			userId,
			date: { gte: from, lte: to },
		},
		_count: {
			_all: true,
		},
	});

	return PRAYER_NAMES.map((name) => {
		const items = aggregate.filter((a) => a.prayerName === name);
		const onTime = items.find((i) => i.status === "ON_TIME")?._count._all || 0;
		const performed =
			items.find((i) => i.status === "PERFORMED")?._count._all || 0;
		const missed = items.find((i) => i.status === "MISSED")?._count._all || 0;
		const total = onTime + performed + missed;

		return {
			prayer_name: name,
			total,
			on_time: onTime,
			performed,
			missed,
			consistency_percentage:
				total > 0 ? Math.round(((onTime + performed) / total) * 100) : 0,
		};
	});
}
