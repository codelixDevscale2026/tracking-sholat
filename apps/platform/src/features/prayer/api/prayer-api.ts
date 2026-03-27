import { api } from "@/utils/api";
import type {
	CheckInRequest,
	CheckInResponse,
	PrayerHistoryResponse,
	PrayerTodayResponse,
} from "../types/prayer.types";

export async function fetchTodaySchedule(
	userId: number,
): Promise<PrayerTodayResponse> {
	const token = localStorage.getItem("auth_token");
	const response = await api.api.v1.prayers.today.$get(
		{
			query: { userId: String(userId) },
		},
		{
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		},
	);

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

export async function fetchPrayerHistory(params: {
	period: "daily" | "weekly" | "monthly";
	date?: string;
	page?: number;
	per_page?: number;
}): Promise<PrayerHistoryResponse> {
	const token = localStorage.getItem("auth_token");
	const response = await api.api.v1.prayers.history.$get(
		{
			query: {
				period: params.period,
				...(params.date && { date: params.date }),
				...(params.page && { page: String(params.page) }),
				...(params.per_page && { per_page: String(params.per_page) }),
			},
		},
		{
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		},
	);

	if (!response.ok) {
		const errorData = (await response.json().catch(() => ({}))) as any;
		throw new Error(
			errorData.message || `Failed to fetch history: ${response.statusText}`,
		);
	}

	const data = (await response.json()) as any;

	if (!data.success) {
		throw new Error(data.message || "Failed to fetch history");
	}

	return data.data;
}

export async function checkInPrayer(
	prayerName: CheckInRequest["prayerName"],
): Promise<CheckInResponse> {
	const token = localStorage.getItem("auth_token");
	const response = await api.api.v1.prayers.checkin.$post(
		{
			json: { prayerName },
		},
		{
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		},
	);

	if (!response.ok) {
		const errorData = (await response.json().catch(() => ({}))) as any;
		const errorCode = errorData.error?.code || "UNKNOWN_ERROR";
		const errorMessage = errorData.error?.message || response.statusText;
		throw new Error(`${errorCode}: ${errorMessage}`);
	}

	const data = (await response.json()) as any;

	if (!data.success) {
		throw new Error(data.message || "Failed to check in");
	}

	return data.data;
}
