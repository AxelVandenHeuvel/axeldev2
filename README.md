# Axel VandenHeuvel — Portfolio

A modern, mobile-first portfolio for Axel VandenHeuvel built with React, Vite, and Tailwind CSS. The site includes hero/about/projects/experience/skills/contact sections, a full projects index, and dynamic deep-dive pages backed by a shared data source.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`. Update content via `src/data/projects.js` and the shared sections in `src/sections` and `src/components`.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build production assets into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Deployment

The repo ships with `.github/workflows/deploy.yml`, which installs dependencies, runs `npm run build`, and publishes `dist/` to GitHub Pages. The site uses a relative Vite `base` and includes `public/CNAME` so Pages serves `axelvh.dev`.

## Structure

```
.
├── public/              # Static assets (favicon, redirects, CNAME)
├── src/
│   ├── assets/          # Images, resume PDF, etc.
│   ├── components/      # Reusable UI components
│   ├── data/projects.js # Project content (cards + deep dives)
│   ├── sections/        # Page sections
│   ├── AllProjectsPage.jsx
│   ├── ProjectDetailPage.jsx
│   ├── projects-page.jsx / project-detail.jsx
│   └── main.jsx
├── project.html         # Entry page for deep dives (query-based)
├── projects.html        # Entry page for the full projects list
└── ...config files
```

## Custom domain

The domain `axelvh.dev` is defined in `public/CNAME`. Update that file if the domain changes.
