export type PrayerStatus =
	| "upcoming"
	| "pending"
	| "ON-TIME"
	| "PERFORMED"
	| "LATE"
	| "MISSED"
	| string;

export interface PrayerSchedule {
	prayerName: string;
	scheduledAdzanTime: string;
	bufferLimit: string;
	status?: PrayerStatus;
}

export interface PrayerTodayResponse {
	schedules: PrayerSchedule[];
	cityName: string;
	timezone?: string;
	nextPrayer?: {
		prayerName: string;
		countdownSeconds: number;
	};
}

export interface UseTodayScheduleOptions {
	userId?: number;
	enabled?: boolean;
	refetchInterval?: number;
}
