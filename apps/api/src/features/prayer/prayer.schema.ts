import { z } from "zod";

export const GetTodayScheduleQuerySchema = z.object({
	userId: z.coerce.number().int().positive(),
});

export type GetTodayScheduleQuery = z.infer<typeof GetTodayScheduleQuerySchema>;

export const PrayerNameEnum = z.enum([
	"subuh",
	"dzuhur",
	"ashar",
	"maghrib",
	"isya",
]);
export type PrayerName = z.infer<typeof PrayerNameEnum>;

export const CheckInRequestSchema = z.object({
	prayerName: PrayerNameEnum,
});

export type CheckInRequest = z.infer<typeof CheckInRequestSchema>;

export const CheckInResponseSchema = z.object({
	prayerName: PrayerNameEnum,
	adzanTime: z.string(),
	bufferLimit: z.string(),
	checkInAt: z.string(),
	status: z.enum(["ON_TIME", "PERFORMED", "MISSED"]),
	responseTimeMinutes: z.number(),
});

export type CheckInResponse = z.infer<typeof CheckInResponseSchema>;

export const PrayerScheduleSchema = z.object({
	prayerName: z.string(),
	scheduledAdzanTime: z.string(),
	bufferLimit: z.string(),
	status: z.string().optional(),
	checkInAt: z.string().nullable().optional(),
	responseTimeMinutes: z.number().nullable().optional(),
	isChecked: z.boolean().optional(),
});

export const PrayerTodayResponseSchema = z.object({
	schedules: z.array(PrayerScheduleSchema),
	cityName: z.string(),
	timezone: z.string().optional(),
	nextPrayer: z
		.object({
			prayerName: z.string(),
			countdownSeconds: z.number(),
		})
		.optional(),
});

export type PrayerSchedule = z.infer<typeof PrayerScheduleSchema>;
export type PrayerTodayResponse = z.infer<typeof PrayerTodayResponseSchema>;

// --- History Schemas ---

export const GetHistoryQuerySchema = z.object({
	period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/)
		.optional(),
	page: z.coerce.number().int().positive().default(1),
	per_page: z.coerce.number().int().positive().default(7),
});

export type GetHistoryQuery = z.infer<typeof GetHistoryQuerySchema>;

export const HistoryPrayerItemSchema = z.object({
	prayer_name: PrayerNameEnum,
	adzan_time: z.string(),
	buffer_limit: z.string(),
	check_in_at: z.string().nullable(),
	status: z.enum(["on-time", "performed", "missed", "late", "early"]),
	response_time_minutes: z.number().nullable(),
});

export const HistoryDayGroupSchema = z.object({
	date: z.string(),
	total_completed: z.number(),
	total_prayers: z.number(),
	prayers: z.array(HistoryPrayerItemSchema),
});

export const HistoryResponseSchema = z.object({
	period: z.string(),
	pagination: z.object({
		current_page: z.number(),
		per_page: z.number(),
		total_pages: z.number(),
	}),
	data: z.array(HistoryDayGroupSchema),
});

export type HistoryResponse = z.infer<typeof HistoryResponseSchema>;
export type HistoryDayGroup = z.infer<typeof HistoryDayGroupSchema>;
export type HistoryPrayerItem = z.infer<typeof HistoryPrayerItemSchema>;
