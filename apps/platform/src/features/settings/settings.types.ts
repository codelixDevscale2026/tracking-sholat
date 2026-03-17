export interface CalculationMethod {
	value: string;
	label: string;
}

export interface PrayerSettings {
	id: number;
	userId: number;
	globalBufferMinutes: number;
	latitude: number | null;
	longitude: number | null;
	cityName: string | null;
	timezone: string;
	autoDetectLocation: boolean;
	calculationMethod: string;
	updatedAt: string;
}

export interface SettingsResponse {
	data: PrayerSettings & {
		available_calculation_methods: CalculationMethod[];
	};
}

export interface UpdateSettingsInput {
	globalBufferMinutes?: number;
	latitude?: number;
	longitude?: number;
	timezone?: string;
	autoDetectLocation?: boolean;
	calculationMethod?: string;
}

export interface UpdateSettingsResponse {
	message: string;
	data: PrayerSettings;
}
