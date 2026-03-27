import { api } from "@/utils/api";
import type {
	PrayerSettings,
	SettingsResponse,
	UpdateSettingsInput,
	UpdateSettingsResponse,
} from "../types/settings.types";

export async function fetchSettings(): Promise<PrayerSettings> {
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
}

export async function updateSettings(
	values: UpdateSettingsInput,
): Promise<UpdateSettingsResponse> {
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
}
