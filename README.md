# Template project monorepo

This is a template monorepo project that you can use as a starting point for your own projects. It includes a basic structure for a monorepo, with a few example packages and applications.

## Tech Stack
- **Backend**: Hono
- **Frontend**: Tanstack Router + Query
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Containerization**: Docker
- **linting**: biome
- **Validation**: zod
- **Tooling**: pnpm-workspaces

## Getting Started
1. Clone the repository:
    ```bash
    git clone https://github.com/anasMuf/monorepo_starterkit.git
    ```
2. Navigate to the project directory:
    ```bash
    cd monorepo_starterkit
    ```
3. Install dependencies:
    ```bash
    pnpm install
    ```
4. Set up the environment variables by creating a `.env` file in the root directory and adding the following content:
    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/monorepo_starterkit?schema=public"
    VITE_API_BASE_URL="http://localhost:8000"
    ```
5. Start the development server:
    ```bash
    pnpm dev
    ```