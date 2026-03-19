import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { getTodaySchedule } from "../services/prayerScheduleService.js";

export const prayerRoutes = new Hono().get(
	"/today",
	zValidator(
		"query",
		z.object({
			userId: z.coerce.number().int().positive(),
		}),
	),
	async (c) => {
		const { userId } = c.req.valid("query");

		try {
			const data = await getTodaySchedule({ userId });
			return c.json({ success: true, data });
		} catch (err) {
			const message = err instanceof Error ? err.message : "Unknown error";
			return c.json({ success: false, message }, 400);
		}
	},
);
