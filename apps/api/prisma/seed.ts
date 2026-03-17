import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/index.js";

config({ path: "../../.env" });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Starting seeding...");

	const passwordHash = await bcrypt.hash("password123", 10);

	// Create default test user
	const user = await prisma.user.upsert({
		where: { email: "test@example.com" },
		update: {},
		create: {
			email: "test@example.com",
			fullName: "Test User",
			username: "testuser",
			passwordHash,
		},
	});

	console.log("Seeding finished.");
	console.log("Test User created:", {
		id: user.id,
		email: user.email,
		fullName: user.fullName,
	});
}

main()
	.catch((e) => {
		console.error("Seeding error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
