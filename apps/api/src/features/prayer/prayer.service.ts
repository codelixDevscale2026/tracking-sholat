import { parseHHMM } from "../../utils/timezone.js";

export type PrayerName = "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya";

export interface ProviderResult {
	cityName: string;
	timezone: string;
	method: string;
	timings: Record<PrayerName, string>; // HH:mm
}

function mapMethodToAlAdhanId(method: string) {
	// https://aladhan.com/prayer-times-api#GetTimings
	// Common mapping used in many apps.
	switch (method.toLowerCase()) {
		case "mwl":
			return 3;
		case "isna":
			return 2;
		case "egypt":
			return 5;
		case "makkah":
			return 4;
		case "karachi":
			return 1;
		default:
			return 3;
	}
}

export async function fetchFromAlAdhan(options: {
	date: { day: number; month: number; year: number };
	latitude: number;
	longitude: number;
	method: string;
}) {
	const { date, latitude, longitude, method } = options;
	const methodId = mapMethodToAlAdhanId(method);
	const dd = String(date.day).padStart(2, "0");
	const mm = String(date.month).padStart(2, "0");
	const yyyy = String(date.year);

	const url = new URL(`https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}`);
	url.searchParams.set("latitude", String(latitude));
	url.searchParams.set("longitude", String(longitude));
	url.searchParams.set("method", String(methodId));

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`AlAdhan request failed: ${res.status} ${res.statusText}`);
	}

	const json = (await res.json()) as any;
	if (!json?.data?.timings) {
		throw new Error("AlAdhan response missing timings");
	}

	const timings = json.data.timings;
	const meta = json.data.meta;

	const pick = (k: string) => {
		const value: string = timings[k];
		// AlAdhan can return "04:26" or "04:26 (WIB)".
		return value.split(" ")[0];
	};

	const result: ProviderResult = {
		cityName: "",
		timezone: meta?.timezone ?? "UTC",
		method,
		timings: {
			subuh: pick("Fajr"),
			dzuhur: pick("Dhuhr"),
			ashar: pick("Asr"),
			maghrib: pick("Maghrib"),
			isya: pick("Isha"),
		},
	};

	// sanity validate HH:mm strings
	for (const [name, hhmm] of Object.entries(result.timings)) {
		const parsed = parseHHMM(hhmm);
		if (Number.isNaN(parsed.hour) || Number.isNaN(parsed.minute)) {
			throw new Error(`AlAdhan invalid time for ${name}: ${hhmm}`);
		}
	}

	return result;
}

let myQuranCityCache: {
	loadedAt: number;
	cities: Array<{ id: string; lokasi: string }>;
} | null = null;

async function loadMyQuranCities() {
	const now = Date.now();
	if (
		myQuranCityCache &&
		now - myQuranCityCache.loadedAt < 24 * 60 * 60 * 1000
	) {
		return myQuranCityCache.cities;
	}

	const res = await fetch("https://api.myquran.com/v2/sholat/kota/semua");
	if (!res.ok) {
		throw new Error(
			`myQuran cities request failed: ${res.status} ${res.statusText}`,
		);
	}

	const json = (await res.json()) as any;
	if (!json?.data || !Array.isArray(json.data)) {
		throw new Error("myQuran cities response missing data");
	}

	const cities = json.data as Array<{ id: string; lokasi: string }>;
	myQuranCityCache = { loadedAt: now, cities };
	return cities;
}

function pickBestCityId(
	cities: Array<{ id: string; lokasi: string }>,
	cityName: string,
) {
	const query = cityName.trim().toLowerCase();
	if (!query) return null;

	// exact match
	for (const c of cities) {
		if (c.lokasi.trim().toLowerCase() === query) return c.id;
	}

	// contains match
	for (const c of cities) {
		const name = c.lokasi.trim().toLowerCase();
		if (name.includes(query) || query.includes(name)) return c.id;
	}

	return null;
}

export async function fetchFromMyQuran(options: {
	date: { day: number; month: number; year: number };
	cityName: string;
	method: string;
}) {
	const { date, cityName, method } = options;
	const cities = await loadMyQuranCities();
	const cityId = pickBestCityId(cities, cityName);
	if (!cityId) {
		throw new Error(
			`myQuran cannot resolve city id for cityName='${cityName}'`,
		);
	}

	const yyyy = String(date.year);
	const mm = String(date.month).padStart(2, "0");
	const dd = String(date.day).padStart(2, "0");

	const url = `https://api.myquran.com/v2/sholat/jadwal/${cityId}/${yyyy}/${mm}/${dd}`;
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(
			`myQuran jadwal request failed: ${res.status} ${res.statusText}`,
		);
	}

	const json = (await res.json()) as any;
	const jadwal = json?.data?.jadwal;
	if (!jadwal) {
		throw new Error("myQuran response missing jadwal");
	}

	const result: ProviderResult = {
		cityName: json?.data?.lokasi ?? cityName,
		timezone: "Asia/Jakarta",
		method,
		timings: {
			subuh: jadwal.subuh,
			dzuhur: jadwal.dzuhur,
			ashar: jadwal.ashar,
			maghrib: jadwal.maghrib,
			isya: jadwal.isya,
		},
	};

	for (const [name, hhmm] of Object.entries(result.timings)) {
		const parsed = parseHHMM(hhmm);
		if (Number.isNaN(parsed.hour) || Number.isNaN(parsed.minute)) {
			throw new Error(`myQuran invalid time for ${name}: ${hhmm}`);
		}
	}

	return result;
}
