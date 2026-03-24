import type { PrayerTodayResponse } from "../types/prayer.types";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchTodaySchedule(
	userId: number,
): Promise<PrayerTodayResponse> {
	const response = await fetch(
		`${API_BASE_URL}/api/v1/prayers/today?userId=${userId}`,
	);

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			errorData.message ||
				`Failed to fetch prayer schedule: ${response.statusText}`,
		);
	}

	const data = await response.json();

	if (!data.success) {
		throw new Error(data.message || "Failed to fetch prayer schedule");
	}

	return data.data;
}
