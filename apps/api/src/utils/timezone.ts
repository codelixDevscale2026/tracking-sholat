export function getYMDInTimeZone(date: Date, timeZone: string) {
	const dtf = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
	const parts = dtf.formatToParts(date);
	const year = Number(parts.find((p) => p.type === "year")?.value);
	const month = Number(parts.find((p) => p.type === "month")?.value);
	const day = Number(parts.find((p) => p.type === "day")?.value);

	return { year, month, day };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
	// Compute offset by comparing the same instant formatted in the target timezone vs UTC.
	const dtf = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});

	const parts = dtf.formatToParts(date);
	const y = Number(parts.find((p) => p.type === "year")?.value);
	const m = Number(parts.find((p) => p.type === "month")?.value);
	const d = Number(parts.find((p) => p.type === "day")?.value);
	const hh = Number(parts.find((p) => p.type === "hour")?.value);
	const mm = Number(parts.find((p) => p.type === "minute")?.value);
	const ss = Number(parts.find((p) => p.type === "second")?.value);

	// Treat formatted parts as if they were UTC to get the local wall-clock instant.
	const asUtc = Date.UTC(y, m - 1, d, hh, mm, ss);
	return asUtc - date.getTime();
}

export function zonedDateTimeToUtc(options: {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second?: number;
	timeZone: string;
}) {
	const { year, month, day, hour, minute, second = 0, timeZone } = options;

	// Start with the wall clock time interpreted as UTC.
	const utcGuess = new Date(
		Date.UTC(year, month - 1, day, hour, minute, second),
	);
	// Calculate the timezone offset at that instant, then subtract to get the real UTC time.
	const offsetMs = getTimeZoneOffsetMs(utcGuess, timeZone);
	return new Date(utcGuess.getTime() - offsetMs);
}

export function parseHHMM(hhmm: string) {
	const [h, m] = hhmm.split(":");
	return {
		hour: Number(h),
		minute: Number(m),
	};
}
