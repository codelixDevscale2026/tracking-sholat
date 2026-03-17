import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Variables } from "../../index.js";
import type { UpdateSettingsInput } from "./settings.schema.js";
import { availableCalculationMethods } from "./settings.schema.js";
import { SettingsService } from "./settings.service.js";

type Env = { Variables: Variables };

export const SettingsController = {
	async getSettings(c: Context<Env>) {
		const user = c.get("user");
		if (!user) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}
		const settings = await SettingsService.getSettings(user.id);
		return c.json({
			data: {
				...settings,
				available_calculation_methods: availableCalculationMethods,
			},
		});
	},

	async updateSettings(
		c: Context<Env, "/", { out: { json: UpdateSettingsInput } }>,
	) {
		const user = c.get("user");
		if (!user) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}
		const input = c.req.valid("json");
		const settings = await SettingsService.updateSettings(user.id, input).catch(
			(e) => {
				throw new HTTPException(400, { message: e.message });
			},
		);
		return c.json({
			message: "Pengaturan berhasil disimpan.",
			data: settings,
		});
	},
};
