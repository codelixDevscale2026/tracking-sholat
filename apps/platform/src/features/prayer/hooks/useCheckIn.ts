import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { checkInPrayer } from "../api/prayer-api";
import type { PrayerName } from "../types/prayer.types";

interface CheckInParams {
	prayerName: PrayerName;
	userId: number;
}

export function useCheckIn() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ prayerName }: CheckInParams) => checkInPrayer(prayerName),
		onSuccess: (data, variables) => {
			toast.success("Check-in berhasil!", {
				description: `Sholat ${data.prayerName} berhasil dicatat dengan status ${data.status.toLowerCase().replace("_", " ")}`,
			});
			// Invalidate todaySchedule query to refetch updated data
			queryClient.invalidateQueries({
				queryKey: ["prayer-schedule", "today", variables.userId],
			});
		},
		onError: (error: Error) => {
			const errorMessage = error.message;

			if (errorMessage.includes("PRAYER_TIME_NOT_YET")) {
				toast.error("Waktu sholat belum masuk", {
					description: "Tunggu hingga waktu adzan dimulai",
				});
			} else if (errorMessage.includes("DUPLICATE_CHECKIN")) {
				toast.error("Sudah check-in", {
					description:
						"Anda sudah melakukan check-in untuk sholat ini hari ini",
				});
			} else if (errorMessage.includes("PRAYER_ALREADY_MISSED")) {
				toast.error("Sholat sudah missed", {
					description: "Tidak dapat check-in karena waktu sholat sudah lewat",
				});
			} else {
				toast.error("Gagal check-in", {
					description: errorMessage,
				});
			}
		},
	});
}
