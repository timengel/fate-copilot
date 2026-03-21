# Primary Sources (always check first)

## Fate Rules

Do not rely solely on your training knowledge. Use Thinking Models and Deep Research! Study the following file for anything related to Fate rules and mechanics: [Fate Guide](./FATE.md)

# Tech Stack & Project Conventions

## Package Manager

- Use **pnpm** (`pnpm install`, `pnpm add`, `pnpm run dev`, etc.)

## Dev Server & Build

- Dev: `pnpm run dev`
- Build: `pnpm run build`
- Preview: `pnpm run preview`

## Tech Stack

- **Vue 3** with `<script setup lang="ts">` (Composition API with script setup, no Options API)
- **TypeScript** — all new files as `.ts` / `.vue` with TypeScript
- **Pinia** for state management
- **Vue Router** for routing
- **Vite** as build tool (config: `vite.config.ts`)
- Global CSS in `src/style.css` (no SCSS, no CSS Modules)

## Tests

- Test framework: **Vitest** with **happy-dom** environment
- Component tests: **@testing-library/vue** + **@vue/test-utils**
- Test files: `*.spec.ts`, placed next to the file being tested (e.g. `FateButton.spec.ts` next to `FateButton.vue`)
- Run tests: `pnpm run test` (watch) or `pnpm run test:run` (once)
- Pinia in tests: `setActivePinia(createPinia())` in `beforeEach`
- Vitest globals are enabled (`globals: true`) — no need to import `vi`, `describe`, `it`, `expect` (except for types)

## Component Conventions

- Shared/reusable components: `src/components/shared/`
  - e.g. buttons via `FateButton.vue` with a `variant` prop (instead of styling native `<button>` elements directly)
- Character components: `src/components/character/`
- Campaign components: `src/components/campaign/`
- Shared types centrally in `src/types/`

## Code Style

- **Semicolons**: Yes — all `.ts` and `.vue` files use semicolons
- **Formatter**: Prettier (`.prettierrc` in root) — `pnpm exec prettier --write "src/**/*.{ts,vue}"`

## Scoped Styles

- Each Vue component gets its own **`<style scoped>`** tag for its own CSS rules
- Component-specific CSS does **not** belong in `src/style.css`
- `src/style.css` contains only: global CSS variables (`:root`), resets, app layout base structure, and utility classes used in 3+ components
- To style child component elements from a parent component: use the `:deep()` selector
