import { useQuery } from "@tanstack/react-query";
import { fetchTodaySchedule } from "../api/prayer-api";
import type { UseTodayScheduleOptions } from "../types/prayer.types";

export function useTodaySchedule({
	userId,
	enabled = true,
	refetchInterval = 5 * 60 * 1000, // 5 minutes
}: UseTodayScheduleOptions) {
	return useQuery({
		queryKey: ["prayer-schedule", "today", userId],
		queryFn: async () => {
			try {
				return await fetchTodaySchedule(userId);
			} catch (error) {
				// If the backend is down/unreachable (e.g. ERR_CONNECTION_REFUSED),
				// return a safe fallback so the frontend can still run.
				if (error instanceof TypeError) {
					return {
						schedules: [],
						cityName: "",
						timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
						nextPrayer: undefined,
					};
				}
				throw error;
			}
		},
		enabled: enabled && !!userId,
		refetchInterval,
		staleTime: 2 * 60 * 1000, // 2 minutes
		retry: (failureCount, error) => {
			// Don't retry on authentication errors
			if (error instanceof Error && error.message.includes("401")) {
				return false;
			}
			// Retry up to 3 times for other errors
			return failureCount < 3;
		},
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});
}
