# Primäre Quellen (immer zuerst)

## Fate Regeln

Verlasse dich nicht ausschließlich auf dein Trainingswissen. Nutze Thinking-Models und Deep Research! Studiere das folgende File, wenn es um Fate Regeln und Mechaniken geht: [Fate Regeln](./FATE.md)

# Tech Stack & Projektkonventionen

## Package Manager

- Nutze **pnpm** (`pnpm install`, `pnpm add`, `pnpm run dev`, etc.)

## Dev-Server & Build

- Dev: `pnpm run dev`
- Build: `pnpm run build`
- Preview: `pnpm run preview`

## Tech Stack

- **Vue 3** mit `<script setup lang="ts">` (Composition API mit script setup, kein Options API)
- **TypeScript** — alle neuen Dateien als `.ts` / `.vue` mit TypeScript
- **Pinia** für State Management
- **Vue Router** für Routing
- **Vite** als Build-Tool (Config: `vite.config.ts`)
- Globales CSS in `src/style.css` (kein SCSS, keine CSS Modules)

## Tests

- Test-Framework: **Vitest** mit **happy-dom** Environment
- Komponenten-Tests: **@testing-library/vue** + **@vue/test-utils**
- Testdateien: `*.spec.ts`, direkt neben der zu testenden Datei (z.B. `FateButton.spec.ts` neben `FateButton.vue`)
- Tests ausführen: `pnpm run test` (watch) oder `pnpm run test:run` (einmalig)
- Pinia in Tests: `setActivePinia(createPinia())` im `beforeEach`
- Vitest globals sind aktiviert (`globals: true`) — kein Import von `vi`, `describe`, `it`, `expect` nötig (außer für Typen)

## Komponenten-Konventionen

- Shared/wiederverwendbare Komponenten: `src/components/shared/`
  - Z.B. Buttons über `FateButton.vue` mit `variant`-Prop (statt nativen `<button>` direkt stylen)
- Charakter-Komponenten: `src/components/character/`
- Kampagnen-Komponenten: `src/components/campaign/`
- Geteilte Typen zentral in `src/types/`
