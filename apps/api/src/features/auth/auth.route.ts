import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { AuthController } from "./auth.controller.js";
import { authMiddleware } from "./auth.middleware.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

const authRouter = new Hono()
	.post(
		"/register",
		zValidator("json", registerSchema),
		AuthController.register,
	)
	.post("/login", zValidator("json", loginSchema), AuthController.login)
	.post("/logout", authMiddleware, AuthController.logout)
	.get("/me", authMiddleware, AuthController.me);

export default authRouter;
