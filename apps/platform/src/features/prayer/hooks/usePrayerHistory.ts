import { useQuery } from "@tanstack/react-query";
import { fetchPrayerHistory } from "../api/prayer-api";

export function usePrayerHistory(params: {
	period: "daily" | "weekly" | "monthly";
	date?: string;
	page?: number;
}) {
	return useQuery({
		queryKey: ["prayer-history", params.period, params.date, params.page],
		queryFn: () =>
			fetchPrayerHistory({
				period: params.period,
				date: params.date,
				page: params.page ?? 1,
				per_page: 7,
			}),
		staleTime: 5 * 60 * 1000, // 5 minutes cache
	});
}
