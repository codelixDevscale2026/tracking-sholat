import { createHash } from "node:crypto";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import type { Variables } from "../../index.js";
import { prisma } from "../../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

type Env = {
	Variables: Variables & {
		jwtPayload: {
			id: number;
			email: string;
			[key: string]: unknown;
		};
	};
};

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
	const token = c.req.header("Authorization")?.replace("Bearer ", "");

	if (!token) {
		return c.json({ message: "Unauthorized" }, 401);
	}

	const tokenHash = createHash("sha256").update(token).digest("hex");
	const authToken = await prisma.authToken.findUnique({
		where: { tokenHash },
	});

	if (!authToken || authToken.revokedAt) {
		return c.json({ message: "Session expired or revoked" }, 401);
	}

	if (authToken.expiresAt < new Date()) {
		return c.json({ message: "Session expired" }, 401);
	}

	// Use jwt middleware as a function
	const validator = jwt({
		secret: JWT_SECRET,
		alg: "HS256",
	});

	let errorResponse: Response | null = null;
	await validator(c, async () => {
		const payload = c.get("jwtPayload");
		const user = await prisma.user.findUnique({
			where: { id: payload.id },
		});

		if (!user) {
			errorResponse = c.json({ message: "User not found" }, 401);
			return;
		}

		c.set("user", user);
	});

	if (errorResponse) return errorResponse;
	if (!c.get("jwtPayload")) return c.json({ message: "Unauthorized" }, 401);

	await next();
});
