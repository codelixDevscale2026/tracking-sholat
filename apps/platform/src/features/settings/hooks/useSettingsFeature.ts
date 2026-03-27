import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchSettings, updateSettings } from "../api/settings-api";
import type {
	PrayerSettings,
	UpdateSettingsInput,
} from "../types/settings.types";

export function useSettingsFeature() {
	const queryClient = useQueryClient();

	const settingsQuery = useQuery({
		queryKey: ["settings"],
		queryFn: fetchSettings,
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const updateSettingsMutation = useMutation({
		mutationFn: (values: UpdateSettingsInput) => updateSettings(values),
		onSuccess: (data) => {
			queryClient.setQueryData(
				["settings"],
				(old: PrayerSettings | undefined) => {
					if (!old) return old;
					return {
						...old,
						...data.data,
					};
				},
			);
			toast.success(data.message || "Settings updated");
		},
		onError: (error: Error) => {
			toast.error(error.message);
		},
	});

	return {
		settings: settingsQuery.data,
		isLoading: settingsQuery.isLoading,
		isUpdating: updateSettingsMutation.isPending,
		updateSettings: updateSettingsMutation,
	};
}
