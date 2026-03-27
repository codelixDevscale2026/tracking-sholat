import { z } from "zod";

export const GetStatsSummaryQuerySchema = z.object({
	period: z.enum(["daily", "weekly", "monthly"]),
	date: z.string().optional(), // YYYY-MM-DD
});

export type GetStatsSummaryQuery = z.infer<typeof GetStatsSummaryQuerySchema>;

export const DailyTrendSchema = z.object({
	day: z.string(),
	date: z.string(),
	on_time: z.number(),
	performed: z.number(),
	missed: z.number(),
});

export type DailyTrend = z.infer<typeof DailyTrendSchema>;

export const PrayerBreakdownItemSchema = z.object({
	prayer_name: z.string(),
	total: z.number(),
	on_time: z.number(),
	performed: z.number(),
	missed: z.number(),
	consistency_percentage: z.number(),
});

export type PrayerBreakdownItem = z.infer<typeof PrayerBreakdownItemSchema>;

export const StatsSummarySchema = z.object({
	total_on_time: z.number(),
	total_performed: z.number(),
	total_missed: z.number(),
	total_prayers: z.number(),
	on_time_percentage: z.number(),
	average_response_time_minutes: z.number(),
	streak_days: z.number(),
});

export type StatsSummary = z.infer<typeof StatsSummarySchema>;

export const StatsSummaryResponseSchema = z.object({
	period: z.enum(["daily", "weekly", "monthly"]),
	date_range: z.object({
		from: z.string(),
		to: z.string(),
	}),
	summary: StatsSummarySchema,
	daily_trend: z.array(DailyTrendSchema),
	prayer_breakdown: z.array(PrayerBreakdownItemSchema),
});

export type StatsSummaryResponse = z.infer<typeof StatsSummaryResponseSchema>;
