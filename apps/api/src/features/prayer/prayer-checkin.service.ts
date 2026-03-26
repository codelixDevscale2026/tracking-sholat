import { addMinutes, differenceInMinutes } from "date-fns";
import type { PrayerStatus } from "../generated/prisma/index.js";

export interface CheckInResult {
	status: PrayerStatus;
	responseTimeMinutes: number;
	bufferLimit: Date;
}

export function calculateCheckInStatus(options: {
	checkInAt: Date;
	adzanTime: Date;
	bufferMinutes: number;
	nextAdzanTime?: Date;
}): CheckInResult {
	const { checkInAt, adzanTime, bufferMinutes, nextAdzanTime } = options;

	const bufferLimit = addMinutes(adzanTime, bufferMinutes);
	const responseTimeMinutes = differenceInMinutes(checkInAt, adzanTime);

	// ON_TIME: check_in <= adzan + buffer
	if (checkInAt.getTime() <= bufferLimit.getTime()) {
		return {
			status: "ON_TIME",
			responseTimeMinutes: Math.max(0, responseTimeMinutes),
			bufferLimit,
		};
	}

	// PERFORMED: check_in > adzan + buffer (but still before next prayer if provided)
	// If nextAdzanTime is provided, ensure we're still before it
	if (nextAdzanTime && checkInAt.getTime() >= nextAdzanTime.getTime()) {
		// This shouldn't happen in normal flow (would be handled as missed by cron)
		// But we return PERFORMED as fallback
	}

	return {
		status: "PERFORMED",
		responseTimeMinutes,
		bufferLimit,
	};
}

export function validateCheckInTime(options: {
	checkInAt: Date;
	adzanTime: Date;
}): { valid: boolean; error?: string } {
	const { checkInAt, adzanTime } = options;

	// Check if trying to check in before adzan time
	if (checkInAt.getTime() < adzanTime.getTime()) {
		return {
			valid: false,
			error: "PRAYER_TIME_NOT_YET",
		};
	}

	return { valid: true };
}
