import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { authMiddleware } from "../auth/auth.middleware.js";
import {
	checkInPrayer,
	getHistory,
	getTodaySchedule,
} from "./prayer.controller.js";
import {
	CheckInRequestSchema,
	GetHistoryQuerySchema,
	GetTodayScheduleQuerySchema,
} from "./prayer.schema.js";

export const prayerRoutes = new Hono()
	.get(
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
	)
	.get(
		"/history",
		authMiddleware,
		zValidator("query", GetHistoryQuerySchema),
		async (c) => {
			try {
				const user = c.get("user");
				if (!user) {
					return c.json({ success: false, message: "Unauthorized" }, 401);
				}

				const { period, date, page, per_page } = c.req.valid("query");
				const data = await getHistory({
					userId: user.id,
					period,
					date,
					page,
					perPage: per_page,
				});

				return c.json({ success: true, data });
			} catch (err) {
				const message = err instanceof Error ? err.message : "Unknown error";
				return c.json({ success: false, message }, 500);
			}
		},
	)
	.post(
		"/checkin",
		authMiddleware,
		zValidator("json", CheckInRequestSchema),
		async (c) => {
			try {
				const user = c.get("user");
				if (!user) {
					return c.json({ success: false, message: "Unauthorized" }, 401);
				}

				const { prayerName } = c.req.valid("json");
				const data = await checkInPrayer({ userId: user.id, prayerName });

				return c.json(
					{ success: true, message: "Check-in berhasil.", data },
					201,
				);
			} catch (err) {
				if (err instanceof Error) {
					// Handle specific error codes
					if (err.message === "PRAYER_TIME_NOT_YET") {
						return c.json(
							{
								success: false,
								error: {
									code: "PRAYER_TIME_NOT_YET",
									message: "Waktu sholat belum masuk",
									status: 400,
								},
							},
							400,
						);
					}
					if (err.message === "DUPLICATE_CHECKIN") {
						return c.json(
							{
								success: false,
								error: {
									code: "DUPLICATE_CHECKIN",
									message:
										"Anda sudah melakukan check-in untuk sholat ini hari ini.",
									status: 409,
								},
							},
							409,
						);
					}
					if (err.message === "PRAYER_ALREADY_MISSED") {
						return c.json(
							{
								success: false,
								error: {
									code: "PRAYER_ALREADY_MISSED",
									message: "Sholat sudah berstatus missed",
									status: 422,
								},
							},
							422,
						);
					}
				}
				const message = err instanceof Error ? err.message : "Unknown error";
				return c.json({ success: false, message }, 500);
			}
		},
	);
