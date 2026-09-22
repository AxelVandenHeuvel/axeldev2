# axelvh.dev

Personal site for Axel VandenHeuvel, a Computer Science student at the University of Colorado Boulder.
Live at https://axelvh.dev.

This file describes the site as it actually is.
Read it before changing anything, and update it when the structure changes.

## Design

The site is deliberately minimal and a little playful: monospace type, ASCII art, and very few words.
It is not a conventional portfolio with a hero, skills grid, or contact form, and should not drift toward one.

- **Home** is a cream (`#f2ebe0`) screen with the name in ASCII letters and an animated ASCII black hole in the middle.
Clicking or pressing Enter on the black hole enters the site.
- **Inner pages** are night (`#050914`) with light monospace text.
The categories page has an animated three.js `ColorBends` shader behind it.
- **Europe 2026** is the exception: a bespoke aged-paper map cutscene with its own fonts (Cinzel, IM Fell English SC, Special Elite), loaded only on that page.
- Keep it fast on mobile, keep tap targets comfortable, and avoid low-contrast or tiny text.

## Stack

- React 19 + Vite 7, Tailwind CSS 3.
- `three` for the ColorBends shader only.
- No router library: `src/lib/router.js` is a tiny History API router.
- Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.
The custom domain comes from `public/CNAME`.

## Routes

All routes are defined in `src/lib/routes.js`, which has no React imports so the build script can use it too.

| Path | Page |
| --- | --- |
| `/` | Home |
| `/about`, `/contact` | Home with that panel open |
| `/posts` | Categories (`cs`, `travel`, and a disabled `???`) |
| `/posts/:category` | List of posts, newest first |
| `/posts/:category/:slug` | A single post |
| anything else | Not-found page |

Use the `Link` component (`src/components/Link.jsx`) for internal links and `navigate()` for programmatic navigation.
Never use `window.location` for internal navigation.

`npm run build` runs `scripts/prerender-routes.mjs` afterwards, which writes an `index.html` (with the right `<title>`) for every known route into `dist/`.
That is what makes deep links return 200 on GitHub Pages.
Unknown paths fall through to `404.html`, which boots the same app and shows the not-found page.
Because routes are nested, Vite's `base` must stay `'/'`.

## Layout

```
src/
  App.jsx              route switch, page title, <html> background
  lib/router.js        usePath() + navigate()
  lib/routes.js        route table, slugs, allPaths() for prerendering
  pages/               one component per route
  components/          Link, AsciiBlackHole, ColorBends, europe/ (cutscene parts)
  data/projects.js     cs posts (currently empty)
  data/travel.js       travel posts
  data/europe2026.js   Europe cutscene content: places, blurbs, photos, itinerary
  data/europeMap.js    generated map geometry - do not edit by hand
  lib/europe*.js, projection.js, landmass.js   cutscene camera and geometry
scripts/
  prerender-routes.mjs   postbuild route shells
  build-europe-map.mjs   regenerates data/europeMap.js (npm run map:build, run by hand)
public/
  images/europe2026/   trip photos (see the README there)
```

## Content

- **Posts** live in `src/data/projects.js` (cs) and `src/data/travel.js`.
The header comment in each file documents the fields.
A post's URL slug defaults to its title, lowercased and hyphenated, and can be overridden with `slug`.
- **Custom post pages:** a post with a `view` field renders a bespoke lazy-loaded component registered in `customViews` in `src/App.jsx` instead of the generic `PostPage`.
Only `europe2026` exists today.
- **About and contact** panel content lives in `src/pages/HomePage.jsx`.
To add a panel, add its key to `panels` in `src/lib/routes.js` and its content to `panelContent`.
- **Europe 2026** content is edited in `src/data/europe2026.js` only; everything else in the cutscene derives from it.

## Performance

- `CategoriesPage` (three.js) and `Europe2026Page` are lazy-loaded so they stay out of the homepage bundle.
Keep heavy dependencies behind `lazy()`.
- The Europe cutscene's scroll loop mutates the DOM through refs inside `requestAnimationFrame` and never calls `setState` per frame.
Preserve that when editing it.

## Commands

```
npm run dev        local dev server
npm run build      production build + route prerender
npm run preview    serve dist/
npm run lint       eslint
npm run map:build  regenerate the Europe map data (network, run by hand)
```

`npm run lint` and `npm run build` must both pass cleanly before committing.
