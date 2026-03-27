import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Variables } from "../../index.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { getStatsSummaryController } from "./stats.controller.js";
import { GetStatsSummaryQuerySchema } from "./stats.schema.js";

const statsRouter = new Hono<{ Variables: Variables }>().get(
	"/summary",
	authMiddleware,
	zValidator("query", GetStatsSummaryQuerySchema),
	async (c) => {
		const user = c.get("user");
		if (!user) {
			return c.json({ success: false, message: "Unauthorized" }, 401);
		}

		const { period, date } = c.req.valid("query");

		try {
			const data = await getStatsSummaryController({
				userId: user.id,
				period,
				date,
			});

			return c.json({ success: true, data });
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Internal Server Error";
			return c.json({ success: false, message }, 500);
		}
	},
);

export { statsRouter };
