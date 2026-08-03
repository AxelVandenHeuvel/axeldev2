/**
 * TRAVEL
 * ------
 * Same shape as projects (see src/data/projects.js). Entries auto-sort by
 * date (newest first) and open in the same detail view.
 *
 * Each entry needs:
 *   title  - Where you went
 *   date   - Format: "MM/DD/YY"
 *
 * Optional fields for the detail page:
 *   body   - Write-up (supports \n for line breaks)
 *   images - Array of image objects: { src: "/images/example.png", caption: "optional caption" }
 *   links  - Array of link objects: { label: "Map", href: "https://..." }
 *   view   - Renders a bespoke full-page component instead of the standard
 *            detail view. Registered in src/App.jsx (`customViews`). Only
 *            'europe2026' exists today; entries without this field are
 *            unaffected.
 *
 * To add a trip, copy the template below and fill it in:
 *
 *   {
 *     title: 'Somewhere',
 *     date: 'MM/DD/YY',
 *     body: 'What the trip was like.',
 *     images: [
 *       { src: '/images/my-photo.jpg', caption: 'What this shows' },
 *     ],
 *   },
 */

export const travel = [
  {
    title: 'Europe 2026',
    date: '08/03/26',
    // Opens the scroll cutscene instead of the generic detail view.
    // Content lives in src/data/europe2026.js.
    view: 'europe2026',
  },
]
