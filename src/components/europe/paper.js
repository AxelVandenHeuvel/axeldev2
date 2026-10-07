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
  base: '#aa956c', // darkened stock visible at the worn edges
  highlight: '#e8d8ad', // lighter paper reserved for readable notes
  sea: '#7f8d89', // oxidized blue-green wash from an old hand-tinted atlas
  land: '#cfb982', // sun-faded ochre parchment
  landEdge: '#484137', // softened brown-black printing ink
  borderShadow: '#171b1a', // displaced relief around political boundaries
  graticule: '#59615c', // faded blue-black cartographic ink
  shadow: '#71634c',
  burn: '#594935',
  fiber: '#5e5545',
  route: '#d92d35', // bright red route ink
  routeHighlight: '#ff5d57',
  routeUnderprint: '#382728',
  pin: '#d92d35',
  inkDeep: '#2f2b26', // display type
  inkBody: '#463d33', // body copy
  countryInk: '#273337',
  countryHalo: '#d2bf8e',
}

/**
 * One line for the whole journey.
 *
 * The films don't distinguish how you travelled -- it's a single solid red
 * line advancing across the map, and that uniformity is most of what makes it
 * read as the sequence it's imitating.
 *
 * Width is in screen pixels; see the styling block in Europe2026Page.
 */
export const ROUTE = {
  color: PAPER.route,
  underprintWidth: 6.4,
  width: 4.2,
  coreWidth: 1.25,
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
  `%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='3' stitchTiles='stitch' seed='7'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.3'/%3E`
)

/** Low-frequency sepia blotching -- the "this has been in a drawer" layer. */
export const MOTTLE_URL = svgTile(
  600,
  600,
  `%3Cfilter id='m'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.01 0.018' numOctaves='2' stitchTiles='stitch' seed='19'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.72 0 0 0 0 0.60 0 0 0 0 0.42 0 0 0 0.28 0'/%3E%3C/filter%3E%3Crect width='600' height='600' filter='url(%23m)'/%3E`
)

/** Fixed stains, foxing and fold shadows from a map repeatedly opened by hand. */
export const PATINA = [
  'radial-gradient(ellipse at 13% 17%, rgba(91,61,31,0.08), rgba(91,61,31,0.025) 10%, transparent 22%)',
  'radial-gradient(ellipse at 81% 72%, rgba(82,54,28,0.06), rgba(82,54,28,0.02) 13%, transparent 25%)',
  'radial-gradient(circle at 67% 9%, rgba(116,78,35,0.1), transparent 18%)',
  'radial-gradient(circle at 28% 84%, rgba(76,49,25,0.08), transparent 22%)',
].join(',')

/** Burnt edges. A radial gradient, not a filter -- same look, no offscreen pass. */
export const VIGNETTE =
  'radial-gradient(ellipse 115% 96% at 48% 43%, rgba(246,226,174,0.06) 26%, rgba(82,61,38,0.11) 68%, rgba(43,31,21,0.43) 100%)'
