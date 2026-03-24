export interface PrayerSchedule {
	prayerName: string;
	scheduledAdzanTime: string;
	bufferLimit: string;
	status?: string;
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
	userId: number;
	enabled?: boolean;
	refetchInterval?: number;
}
