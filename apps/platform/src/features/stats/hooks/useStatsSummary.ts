import { useQuery } from "@tanstack/react-query";
import { fetchStatsSummary } from "../api/stats-api";

export function useStatsSummary(
	period: "daily" | "weekly" | "monthly",
	date?: string,
) {
	return useQuery({
		queryKey: ["stats", "summary", period, date],
		queryFn: () => fetchStatsSummary(period, date),
		staleTime: 5 * 60 * 1000, // 5 minutes (stats don't need real-time)
	});
}
