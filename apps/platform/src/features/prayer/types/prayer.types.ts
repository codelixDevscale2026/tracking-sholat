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

export interface HistoryPrayerItem {
	prayer_name: string;
	adzan_time: string;
	buffer_limit: string;
	check_in_at: string | null;
	status: string;
	response_time_minutes: number | null;
}

export interface HistoryDayGroup {
	date: string;
	total_completed: number;
	total_prayers: number;
	prayers: HistoryPrayerItem[];
}

export interface PrayerHistoryResponse {
	period: string;
	pagination: {
		current_page: number;
		per_page: number;
		total_pages: number;
	};
	data: HistoryDayGroup[];
}
