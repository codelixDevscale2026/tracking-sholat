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
