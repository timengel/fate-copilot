<div align="center">

<img src="logo.svg" width="220" height="80" alt="FATE+ logo"/>

# FATE+ Copilot

**A digital companion for the Fate tabletop RPG system**

[![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3-ffd859?logo=pinia)](https://pinia.vuejs.org/)

</div>

---

FATE+ Copilot is a browser-based character sheet and campaign manager built for [Fate Core](https://fate-srd.com/fate-core) and related Fate system games. It lets players manage characters, skills, aspects, stress, and consequences — while giving GMs a dedicated mode to oversee campaigns.

## Features

- **Character and Item Sheets** — Track aspects, skills, stress boxes, fate points, consequences, and more
- **Campaign Management** — Organize your campaigns and assign characters and items
- **GM Mode** — Toggle a GM view with elevated access across the campaign
- **Persistent State** — All data is saved locally via `pinia-plugin-persistedstate`
- **Import / Export** — App data can be exported to JSON and re-imported for backup or sharing

## Tech Stack

| Layer     | Technology                                |
| --------- | ----------------------------------------- |
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language  | TypeScript                                |
| State     | Pinia                                     |
| Routing   | Vue Router                                |
| Build     | Vite                                      |
| Tests     | Vitest + @testing-library/vue             |

## Getting Started

**Prerequisites:** Node.js 18+ and [pnpm](https://pnpm.io/)

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm run dev

# Run tests
pnpm run test

# Build for production
pnpm run build
```

## Fate Rules Reference

The file [FATE.md](./FATE.md) contains the Fate rules reference used by this project. When working with game mechanics, consult it as the primary source.

## License

This project is for personal use. The Fate Core system is published under the [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/) license by Evil Hat Productions.
