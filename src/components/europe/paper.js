/**
 * Parchment treatment. No image assets -- everything here is generated.
 *
 * THE ONE RULE: feTurbulence is CPU-rasterized in every browser. There is no
 * GPU path. A full-screen 1440x900 evaluation at 4 octaves costs 20-40ms --
 * two-plus frames. So it is evaluated ONCE into a small data-URI tile and
 * repeated as a static background that the compositor handles for free.
 *
 * Never put a turbulence filter inside the animated SVG. A single stray
 * filter="url(#grain)" on the map root takes the page from 60fps to 15.
 */

export const PAPER = {
  base: '#e8dcc0', // aged cream field
  highlight: '#f2e8d0', // 3 points off the site's #f2ebe0 -- deliberate continuity
  sea: '#dcd0b4',
  land: '#e6d9ba',
  landEdge: '#8a7355', // coastline and border ink
  graticule: '#b09a76',
  shadow: '#c4ad86',
  burn: '#8a6f4a',
  routePlane: '#9c2b23',
  routeRail: '#7d4a2e',
  routeBus: '#8f6a3c',
  pin: '#a8322a',
  inkDeep: '#3d2b1a', // display type
  inkBody: '#5a4632', // body copy
}

export const ROUTE_STYLE = {
  plane: { color: PAPER.routePlane, width: 2.4, dash: [10, 9] },
  train: { color: PAPER.routeRail, width: 2.0, dash: [7, 5] },
  bus: { color: PAPER.routeBus, width: 2.0, dash: [2.5, 4] },
}

const svgTile = (w, h, inner) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'%3E${inner}%3C/svg%3E")`

/**
 * Fine paper grain. stitchTiles='stitch' is what makes it seamless -- without
 * it the repeat shows a visible grid.
 */
export const GRAIN_URL = svgTile(
  240,
  240,
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch' seed='7'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.5'/%3E`
)

/** Low-frequency sepia blotching -- the "this has been in a drawer" layer. */
export const MOTTLE_URL = svgTile(
  600,
  600,
  `%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.012 0.02' numOctaves='3' stitchTiles='stitch' seed='19'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.72 0 0 0 0 0.60 0 0 0 0 0.42 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='600' height='600' filter='url(%23m)'/%3E`
)

/** Burnt edges. A radial gradient, not a filter -- same look, no offscreen pass. */
export const VIGNETTE =
  'radial-gradient(ellipse 120% 100% at 50% 45%, rgba(0,0,0,0) 40%, rgba(122,92,54,0.18) 72%, rgba(80,56,28,0.42) 100%)'
