# TaskForge AI

A modern project and task management UI built with **Angular 21** — dashboard, Kanban board, projects, team, analytics, and an AI assistant screen. Data is mocked in-memory so you can explore the full UX without a backend.

> Repo: [rezasalehidev/angular-jira](https://github.com/rezasalehidev/angular-jira)

---

## Features

| Area | What you get |
|------|----------------|
| **Dashboard** | Overview stats, activity feed, charts |
| **Projects** | Project list + detail views with progress |
| **Tasks** | Task list with filters and a slide-over drawer |
| **Kanban** | Drag-and-drop board (`@angular/cdk`) |
| **Team** | Members and roles |
| **Analytics** | Charts for workload and status |
| **Notifications** | In-app notification center |
| **AI Assistant** | Chat-style assistant UI |
| **Settings** | Preferences and theme controls |
| **Command palette** | Quick navigation / actions |

---

## Tech stack

- **Angular 21** (standalone components, signals, lazy routes)
- **Angular CDK** — drag-and-drop for Kanban
- **Tailwind CSS 3** — styling
- **Lucide Angular** — icons
- **RxJS** — reactive streams
- **TypeScript 5.9**

No API server required — stores load mock data on startup.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+ (`npm i -g pnpm`)

---

## Getting started

```bash
git clone git@github.com:rezasalehidev/angular-jira.git
cd angular-jira
pnpm install
pnpm start
```

Open **[http://localhost:4200](http://localhost:4200)**.

| Script | Description |
|--------|-------------|
| `pnpm start` | Dev server with HMR (`ng serve`) |
| `pnpm build` | Production build → `dist/demo/browser` |
| `pnpm ng …` | Pass-through to the Angular CLI |

---

## Project structure

```
src/
├── app/
│   ├── core/           # Models, mock data, services, signal stores
│   ├── features/       # Route pages (dashboard, kanban, tasks, …)
│   ├── layout/         # Shell, sidebar, header
│   └── shared/         # UI primitives, command palette, task drawer
├── global_styles.css
├── index.html
└── main.ts
```

Routes are lazy-loaded from `src/app/app.routes.ts` (dashboard, projects, tasks, kanban, team, analytics, notifications, AI assistant, settings).

---

## Deploy on Vercel

This repo includes a `vercel.json` configured for an Angular SPA:

| Setting | Value |
|---------|--------|
| Install | `pnpm install` |
| Build | `pnpm build` |
| Output | `dist/demo/browser` |
| Rewrites | All routes → `/index.html` |

**Steps**

1. Import [rezasalehidev/angular-jira](https://github.com/rezasalehidev/angular-jira) in the [Vercel dashboard](https://vercel.com/new).
2. Confirm framework preset / build settings match the table above (or leave `vercel.json` as-is).
3. Deploy.

---

## License

Private demo project — adjust as needed for your use case.
