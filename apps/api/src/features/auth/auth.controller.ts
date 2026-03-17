import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Variables } from "../../index.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";

type Env = { Variables: Variables };

export const AuthController = {
	async register(
		c: Context<Env, "/register", { out: { json: RegisterInput } }>,
	) {
		const input = c.req.valid("json");
		const { user, token } = await AuthService.register(input).catch((e) => {
			throw new HTTPException(400, { message: e.message });
		});
		const { passwordHash: _, ...userWithoutPassword } = user;
		return c.json({ user: userWithoutPassword, token });
	},

	async login(c: Context<Env, "/login", { out: { json: LoginInput } }>) {
		const input = c.req.valid("json");
		const { user, token } = await AuthService.login(input).catch((e) => {
			throw new HTTPException(401, { message: e.message });
		});
		const { passwordHash: _, ...userWithoutPassword } = user;
		return c.json({ user: userWithoutPassword, token });
	},

	async logout(c: Context<Env, "/logout">) {
		const token = c.req.header("Authorization")?.replace("Bearer ", "");
		if (!token) {
			throw new HTTPException(401, { message: "Unauthorized" });
		}
		await AuthService.logout(token).catch((_e) => {
			throw new HTTPException(500, { message: "Logout failed" });
		});
		return c.json({ message: "Logged out successfully" });
	},

	async me(c: Context<Env, "/me">) {
		const user = c.get("user");
		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}
		const { passwordHash: _, ...userWithoutPassword } = user;
		return c.json({ user: userWithoutPassword });
	},
};
