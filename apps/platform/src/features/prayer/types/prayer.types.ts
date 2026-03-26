export type PrayerName = "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya";

export type PrayerStatus =
	| "upcoming"
	| "pending"
	| "ON_TIME"
	| "PERFORMED"
	| "MISSED";

export interface PrayerSchedule {
	prayerName: PrayerName;
	scheduledAdzanTime: string;
	bufferLimit: string;
	status?: PrayerStatus;
	checkInAt?: string | null;
	responseTimeMinutes?: number | null;
	isChecked?: boolean;
}

export interface PrayerTodayResponse {
	schedules: PrayerSchedule[];
	cityName: string;
	timezone?: string;
	nextPrayer?: {
		prayerName: PrayerName;
		countdownSeconds: number;
	};
}

export interface CheckInRequest {
	prayerName: PrayerName;
}

export interface CheckInResponse {
	prayerName: PrayerName;
	adzanTime: string;
	bufferLimit: string;
	checkInAt: string;
	status: "ON_TIME" | "PERFORMED" | "MISSED";
	responseTimeMinutes: number;
}

export interface UseTodayScheduleOptions {
	userId?: number;
	enabled?: boolean;
	refetchInterval?: number;
}
