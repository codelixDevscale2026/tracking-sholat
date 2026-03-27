import { Hono } from "hono";
import { PrayerStatus } from "../../generated/prisma/index.js";
import { prisma } from "../../utils/prisma.js";
import { getYMDInTimeZone } from "../../utils/timezone.js";

export const schedulerApp = new Hono().post("/auto-missed", async (c) => {
	const now = new Date();
	const prev24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
	console.log("start auto-missed scheduler on: ", now.toISOString());
	console.log("prev 24 hours on: ", prev24Hours.toISOString());
	const users = await prisma.user.findMany({
		select: {
			id: true,
			fullName: true,
			settings: true,
			authTokens: {
				where: {
					expiresAt: {
						gte: now,
					},
				},
			},
			schedules: {
				where: {
					scheduledAdzanTime: {
						lt: now,
						gte: prev24Hours,
					},
				},
				orderBy: {
					scheduledAdzanTime: "desc",
				},
				take: 2,
			},
			prayerLogs: {
				where: {
					createdAt: { gte: prev24Hours, lt: now },
				},
			},
		},
	});

	console.log(`found ${users.length} users to check`);

	for (let i = 0; i < users.length; i++) {
		// skip inactive users
		if (users[i].authTokens.length === 0) {
			continue;
		}

		// Get today's schedule date
		const ymd = getYMDInTimeZone(
			now,
			users[i].settings?.timezone || "Asia/Jakarta",
		);
		const scheduleDate = new Date(Date.UTC(ymd.year, ymd.month - 1, ymd.day));

		// 5 a clock
		// subuh time
		// prev should be isya
		const schedules = users[i].schedules[1];
		const prevShalahDate = schedules.scheduledAdzanTime;
		const prevShalahName = schedules.prayerName;

		console.log(schedules);

		if (!prevShalahName || !prevShalahDate) {
			continue;
		}

		console.log(`${prevShalahDate}: ${prevShalahName}`);

		const logExists = await prisma.prayerLog.findFirst({
			where: {
				prayerName: prevShalahName,
				date: scheduleDate,
				userId: users[i].id,
			},
		});

		if (logExists) {
			console.log(`log exists withId: ${logExists.id}`);
			continue;
		}

		const newLog = await prisma.prayerLog.create({
			data: {
				userId: users[i].id,
				prayerName: prevShalahName,
				date: scheduleDate,
				checkInTimestamp: now,
				status: PrayerStatus.MISSED,
				bufferSnapshotMinutes: 20,
				adzanSnapshotTime: prevShalahDate,
				responseTimeMinutes: 20,
			},
		});
	}

	return c.body(null, 202);
});
