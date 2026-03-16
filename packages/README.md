# Packages

This directory contains shared packages used across the monorepo. Each subdirectory is a self-contained package that can be imported by any app in `apps/`.

## Structure

```
packages/
├── <package-name>/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Creating a New Package

1. Create a new directory under `packages/`:
   ```bash
   mkdir packages/<package-name>
   ```

2. Initialize the package:
   ```bash
   cd packages/<package-name>
   pnpm init
   ```

3. Set the package name with a scope in `package.json`:
   ```json
   {
     "name": "@repo/<package-name>",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "exports": {
       ".": "./src/index.ts"
     }
   }
   ```

4. Import it from any app by adding it as a dependency:
   ```json
   {
     "dependencies": {
       "@repo/<package-name>": "workspace:*"
     }
   }
   ```

## Package Ideas

| Package | Description |
|---------|-------------|
| `@repo/db` | Prisma client, schema, and database utilities |
| `@repo/validators` | Shared Zod schemas for validation across frontend and backend |
| `@repo/config` | Shared configuration (TypeScript, Biome, etc.) |
| `@repo/utils` | Common utility functions |
