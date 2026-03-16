import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono().use(cors()).get("/", (c) => {
	return c.json({ message: "Hello Hono!" });
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
