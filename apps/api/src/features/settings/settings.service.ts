import { prisma } from "../../lib/prisma.js";
import type { UpdateSettingsInput } from "./settings.schema.js";

export const SettingsService = {
	async getSettings(userId: number) {
		let settings = await prisma.prayerSettings.findUnique({
			where: { userId },
		});

		if (!settings) {
			settings = await prisma.prayerSettings.create({
				data: {
					userId,
					globalBufferMinutes: 20,
					timezone: "Asia/Jakarta",
					calculationMethod: "mwl",
					autoDetectLocation: true,
				},
			});
		}

		return settings;
	},

	async updateSettings(userId: number, input: UpdateSettingsInput) {
		const currentSettings = await this.getSettings(userId);

		// If lat/lon changed, update cityName (mock reverse geocoding)
		let cityName = currentSettings.cityName;
		if (input.latitude !== undefined || input.longitude !== undefined) {
			const lat =
				input.latitude ??
				(currentSettings.latitude ? Number(currentSettings.latitude) : null);
			const lon =
				input.longitude ??
				(currentSettings.longitude ? Number(currentSettings.longitude) : null);

			if (lat !== null && lon !== null) {
				cityName = await this.reverseGeocode(lat, lon);
			}
		}

		const updated = await prisma.prayerSettings.update({
			where: { userId },
			data: {
				...input,
				cityName,
			},
		});

		// Requirement: If calculationMethod changes, invalidate schedules
		if (
			input.calculationMethod &&
			input.calculationMethod !== currentSettings.calculationMethod
		) {
			await prisma.dailyPrayerSchedule.deleteMany({
				where: { userId },
			});
		}

		return updated;
	},

	async reverseGeocode(lat: number, lon: number) {
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
				{
					headers: {
						"User-Agent": "SholatTracker/1.0",
					},
				},
			);
			const data = (await res.json()) as {
				address?: {
					city?: string;
					town?: string;
					village?: string;
					suburb?: string;
					county?: string;
					country?: string;
				};
			};

			const address = data.address || {};
			const city =
				address.city ||
				address.town ||
				address.village ||
				address.suburb ||
				address.county ||
				"Unknown Location";
			const country = address.country || "";

			return country ? `${city}, ${country}` : city;
		} catch (error) {
			console.error("Reverse geocoding error:", error);
			return `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`;
		}
	},
};
