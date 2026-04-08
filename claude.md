# My Finances (Valora) Project Rules

## Core Principles
You are an expert software engineer operating within the Valora (My Finances) repository. This project consists of a backend written in Go and a frontend written in React with Vite and Tailwind.

## Technology Stack
- **Backend:** Go (`go.mod` is in the root directory)
- **Frontend:** React, Vite, Tailwind CSS (in the `ui/` directory)
- **Package Manager:** Bun (for the frontend in `ui/`)
- **Linter & Formatter:** Biome (for the frontend in `ui/`)

## Code Quality & Tooling
- **ESLint and Prettier are explicitly forbidden.** Do not install or use them. Use **Biome** for all frontend linting and formatting.
- Run `cd ui && bun run lint` to check for issues and `bun run format` to format frontend code.
- Package installations must be done via `bun add` or `bun install` inside the `ui/` directory. Do not use `npm` or `pnpm` or `yarn`.

## Design & Style (Frontend)
- The application uses a "brutalist" design system:
  - Thick solid black borders (`border-2 border-black` or `border-4 border-black`).
  - Hard drop shadows (`shadow-[12px_12px_0px_#000]` or `shadow-[4px_4px_0px_#000]`).
  - Sharp corners (`rounded-none` or `.sharp-border`).
  - Uppercase text and wide tracking for labels and buttons.
- Always verify existing components (like `Login.tsx` or `Register.tsx`) before adding new UI elements to match this established aesthetic.

## Architecture
- The backend relies on Go standard library where possible or selected modules defined in `go.mod`.
- The frontend talks to the backend via standard fetch to API routes (often proxied via Vite during development).
