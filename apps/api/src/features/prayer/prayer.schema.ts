import { z } from "zod";

export const GetTodayScheduleQuerySchema = z.object({
	userId: z.coerce.number().int().positive(),
});

export type GetTodayScheduleQuery = z.infer<typeof GetTodayScheduleQuerySchema>;

export const PrayerScheduleSchema = z.object({
	prayerName: z.string(),
	scheduledAdzanTime: z.string(),
	bufferLimit: z.string(),
	status: z.string().optional(),
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
