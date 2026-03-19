import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { config as dotenvConfig } from "dotenv";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { prayerRoutes } from "./routes/prayers.js";

if (!process.env.DATABASE_URL) {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	dotenvConfig({ path: path.resolve(__dirname, "../../.env") });
}

const app = new Hono()
	.use(cors())
	.get("/", (c) => {
		return c.json({ message: "Hello Hono!" });
	})
	.route("/api/v1/prayers", prayerRoutes);

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
