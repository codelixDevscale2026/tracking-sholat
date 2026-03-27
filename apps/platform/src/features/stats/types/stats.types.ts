export interface StatsSummary {
	total_on_time: number;
	total_performed: number;
	total_missed: number;
	total_prayers: number;
	on_time_percentage: number;
	average_response_time_minutes: number;
	streak_days: number;
}

export interface DailyTrend {
	day: string; // "Mon", "Tue", ...
	date: string; // "2026-03-11"
	on_time: number;
	performed: number;
	missed: number;
}

export interface PrayerBreakdownItem {
	prayer_name: string;
	total: number;
	on_time: number;
	performed: number;
	missed: number;
	consistency_percentage: number;
}

export interface StatsSummaryResponse {
	period: "daily" | "weekly" | "monthly";
	date_range: { from: string; to: string };
	summary: StatsSummary;
	daily_trend: DailyTrend[];
	prayer_breakdown: PrayerBreakdownItem[];
}
