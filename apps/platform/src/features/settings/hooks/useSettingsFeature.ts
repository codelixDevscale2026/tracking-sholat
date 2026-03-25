import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/utils/api";
import type {
	PrayerSettings,
	SettingsResponse,
	UpdateSettingsInput,
	UpdateSettingsResponse,
} from "../settings.types";

export function useSettingsFeature() {
	const queryClient = useQueryClient();

	const settingsQuery = useQuery({
		queryKey: ["settings"],
		queryFn: async () => {
			const token = localStorage.getItem("auth_token");
			const res = await api.api.v1.settings.$get(
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!res.ok) {
				throw new Error("Failed to fetch settings");
			}

			const data = (await res.json()) as unknown as SettingsResponse;
			return data.data;
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	const updateSettingsMutation = useMutation({
		mutationFn: async (values: UpdateSettingsInput) => {
			const token = localStorage.getItem("auth_token");
			const res = await api.api.v1.settings.$patch(
				{
					json: values,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const data = await res.json();
			if (!res.ok) {
				const error = data as unknown as { message: string };
				throw new Error(error.message || "Failed to update settings");
			}

			return data as unknown as UpdateSettingsResponse;
		},
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
			// Optionally invalidate schedules if calculation method changed
			// queryClient.invalidateQueries({ queryKey: ["prayers", "today"] });
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
