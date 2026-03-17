import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import authRouter from "./features/auth/auth.route.js";
import type { User } from "./generated/prisma/index.js";

export type Variables = {
	user: User;
};

const app = new Hono<{ Variables: Variables }>()
	.use(cors())
	.get("/", (c) => {
		return c.json({ message: "Hello Hono!" });
	})
	.route("/api/v1/auth", authRouter);

// Global Error Handler to ensure all errors are returned as JSON
app.onError((err, c) => {
	if (err instanceof HTTPException) {
		return c.json(
			{
				message: err.message,
				status: err.status,
			},
			err.status,
		);
	}

	return c.json(
		{
			message: err.message || "Internal Server Error",
		},
		500,
	);
});

export type AppType = typeof app;

serve(
	{
		fetch: app.fetch,
		port: 8000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
