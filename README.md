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
4. Set up the environment variables by creating a `.env` file in the root directory and adding the following content:
    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/tracking_sholat?schema=public"
    VITE_API_BASE_URL="http://localhost:8000"
    ```
5. Start the development server:
    ```bash
    pnpm dev
    ```