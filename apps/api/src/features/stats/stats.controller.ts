import { format, parseISO } from "date-fns";
import type { StatsSummaryResponse } from "./stats.schema.js";
import {
	getDailyTrend,
	getDateRange,
	getPrayerBreakdown,
	getStatsSummary,
} from "./stats.service.js";

export async function getStatsSummaryController(options: {
	userId: number;
	period: "daily" | "weekly" | "monthly";
	date?: string;
}): Promise<StatsSummaryResponse> {
	const { userId, period, date } = options;
	const referenceDate = date ? parseISO(date) : new Date();
	const { from, to } = getDateRange(period, referenceDate);

	// Parallel execution
	const [summary, dailyTrend, prayerBreakdown] = await Promise.all([
		getStatsSummary(userId, from, to),
		getDailyTrend(userId, from, to),
		getPrayerBreakdown(userId, from, to),
	]);

	return {
		period,
		date_range: {
			from: format(from, "yyyy-MM-dd"),
			to: format(to, "yyyy-MM-dd"),
		},
		summary,
		daily_trend: dailyTrend,
		prayer_breakdown: prayerBreakdown,
	};
}
