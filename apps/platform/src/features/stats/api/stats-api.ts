import { api } from "@/utils/api";
import type { StatsSummaryResponse } from "../types/stats.types";

interface ApiResponse<T> {
	success: boolean;
	data: T;
	message?: string;
}

export async function fetchStatsSummary(
	period: "daily" | "weekly" | "monthly",
	date?: string,
): Promise<StatsSummaryResponse> {
	const token = localStorage.getItem("auth_token");
	const response = await api.api.v1.stats.summary.$get(
		{ query: { period, date } },
		{ headers: token ? { Authorization: `Bearer ${token}` } : undefined },
	);

	if (!response.ok) {
		const errorData = (await response.json().catch(() => ({}))) as {
			message?: string;
		};
		throw new Error(
			errorData.message || `Failed to fetch stats: ${response.statusText}`,
		);
	}

	const result = (await response.json()) as ApiResponse<StatsSummaryResponse>;

	if (!result.success) {
		throw new Error(result.message || "Failed to fetch stats");
	}

	return result.data;
}
