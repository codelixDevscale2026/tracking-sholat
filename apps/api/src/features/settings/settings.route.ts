import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { Variables } from "../../index.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { SettingsController } from "./settings.controller.js";
import { updateSettingsSchema } from "./settings.schema.js";

type Env = { Variables: Variables };

const settingsRouter = new Hono<Env>()
	.use(authMiddleware)
	.get("/", SettingsController.getSettings)
	.patch(
		"/",
		zValidator("json", updateSettingsSchema),
		SettingsController.updateSettings,
	);

export default settingsRouter;
