# Tracking Sholat - Monorepo

Proyek ini adalah platform untuk melacak aktivitas sholat harian, dibangun dengan arsitektur monorepo yang modern dan type-safe.

## Tech Stack
- **Backend**: Hono.js (Node server)
- **Frontend**: React + TanStack Router & Query
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker & Docker Compose
- **Linting & Formatting**: Biome
- **Validation**: Zod
- **Tooling**: pnpm workspaces

## Getting Started
1. Clone the repository:
    ```bash
    git clone https://github.com/anasMuf/tracking-sholat.git
    ```
2. Navigate to the project directory:
    ```bash
    cd tracking-sholat
    ```
3. Install dependencies:
    ```bash
    pnpm install
    ```
4. Set up the environment variables:
    - Create a `.env` file in the root directory.
    - Copy content from `.env.example` or use the following:
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
    VITE_API_BASE_URL="http://localhost:8000"
    JWT_SECRET="your_jwt_secret_here"
    ```
5. Set up the Database:
    - Make sure your PostgreSQL instance is running (via Docker or local).
    ```bash
    # Run migrations to create tables
    pnpm run --filter api db:migrate

    # Generate Prisma client
    pnpm run --filter api db:generate

    # Seed initial data (optional)
    pnpm run --filter api db:seed
    ```
6. Start the development server:
    ```bash
    pnpm dev
    ```