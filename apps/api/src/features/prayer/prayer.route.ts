import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getTodaySchedule } from "./prayer.controller.js";
import { GetTodayScheduleQuerySchema } from "./prayer.schema.js";

export const prayerRoutes = new Hono().get(
	"/today",
	zValidator("query", GetTodayScheduleQuerySchema),
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
