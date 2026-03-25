import { api } from "@/utils/api";
import type { PrayerTodayResponse } from "../types/prayer.types";

export async function fetchTodaySchedule(
	userId: number,
): Promise<PrayerTodayResponse> {
	const response = await api.api.v1.prayers.today.$get({
		query: { userId: String(userId) },
	});

	if (!response.ok) {
		const errorData = (await response.json().catch(() => ({}))) as any;
		throw new Error(
			errorData.message ||
				`Failed to fetch prayer schedule: ${response.statusText}`,
		);
	}

	const data = (await response.json()) as any;

	if (!data.success) {
		throw new Error(data.message || "Failed to fetch prayer schedule");
	}

	return data.data;
}
