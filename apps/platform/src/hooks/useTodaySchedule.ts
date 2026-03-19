import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

interface PrayerSchedule {
	prayerName: string;
	scheduledAdzanTime: string;
	bufferLimit: string;
	status?: string;
}

interface PrayerTodayResponse {
	schedules: PrayerSchedule[];
	cityName: string;
	timezone?: string;
	nextPrayer?: {
		prayerName: string;
		countdownSeconds: number;
	};
}

interface UseTodayScheduleOptions {
	userId: number;
	enabled?: boolean;
	refetchInterval?: number;
}

export function useTodaySchedule({
	userId,
	enabled = true,
	refetchInterval = 5 * 60 * 1000, // 5 minutes
}: UseTodayScheduleOptions) {
	return useQuery({
		queryKey: ["prayer-schedule", "today", userId],
		queryFn: async (): Promise<PrayerTodayResponse> => {
			try {
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

// Hook for countdown timer
export function useCountdown(initialSeconds: number) {
	const [countdown, setCountdown] = useState(initialSeconds);
	const [isActive, setIsActive] = useState(true);

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null;

		if (isActive && countdown > 0) {
			interval = setInterval(() => {
				setCountdown((countdown: number) => countdown - 1);
			}, 1000);
		} else if (countdown === 0) {
			setIsActive(false);
		}

		return () => {
			if (interval) clearInterval(interval);
		};
	}, [isActive, countdown]);

	const reset = (newSeconds?: number) => {
		setCountdown(newSeconds ?? initialSeconds);
		setIsActive(true);
	};

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
		}

		return `${minutes}:${secs.toString().padStart(2, "0")}`;
	};

	return {
		countdown,
		isActive,
		reset,
		formatTime,
	};
}
