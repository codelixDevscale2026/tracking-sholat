import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { prisma } from "../../lib/prisma.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export const AuthService = {
	async hashPassword(password: string) {
		return bcrypt.hash(password, 10);
	},

	async comparePassword(password: string, hash: string) {
		return bcrypt.compare(password, hash);
	},

	hashToken(token: string) {
		return createHash("sha256").update(token).digest("hex");
	},

	async register(input: RegisterInput) {
		const existingUser = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (existingUser) {
			throw new Error("Email already registered");
		}

		const passwordHash = await AuthService.hashPassword(input.password);

		const user = await prisma.user.create({
			data: {
				fullName: input.fullName,
				email: input.email,
				passwordHash,
			},
		});

		const token = await AuthService.generateToken(user.id, user.email);
		return { user, token };
	},

	async login(input: LoginInput) {
		const user = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (
			!user ||
			!(await AuthService.comparePassword(input.password, user.passwordHash))
		) {
			throw new Error("Invalid credentials");
		}

		const token = await AuthService.generateToken(user.id, user.email);
		return { user, token };
	},

	async generateToken(userId: number, email: string) {
		const token = await sign(
			{
				id: userId,
				email,
				iat: Math.floor(Date.now() / 1000),
			},
			JWT_SECRET,
		);
		const tokenHash = AuthService.hashToken(token);

		await prisma.authToken.create({
			data: {
				userId,
				tokenHash,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			},
		});

		return token;
	},

	async logout(token: string) {
		const tokenHash = AuthService.hashToken(token);
		await prisma.authToken.update({
			where: { tokenHash },
			data: { revokedAt: new Date() },
		});
	},
};
