/**
 * PROJECTS
 * --------
 * Add/edit/remove projects here. They auto-sort by date (newest first).
 *
 * Each project needs:
 *   title  - Project name (shown in the list + detail page)
 *   date   - Format: "MM/DD/YY"
 *
 * Optional fields for the detail page:
 *   links  - Array of link objects: { label: "GitHub", href: "https://..." }
 *   body   - Longer write-up (supports \n for line breaks)
 *   images - Array of image objects: { src: "/images/example.png", caption: "optional caption" }
 *
 * To add a new project, copy the template below and fill it in:
 *
 *   {
 *     title: 'Project Name',
 *     date: 'MM/DD/YY',
 *     links: [
 *       { label: 'GitHub', href: 'https://github.com/...' },
 *       { label: 'Demo', href: 'https://...' },
 *     ],
 *   },
 */

export const projects = [
  {
    title: 'SpeakEasy',
    date: '04/19/26',
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/SpeakEasy' },
      { label: 'Download', href: 'https://getspeakeasy.xyz' },
    ],
  },
  {
    title: 'VLMs for Deep Space',
    date: '04/06/26',
    links: [
      { label: 'GitHub', href: 'https://github.com/ksuoo/NASA-JPL-Capstone' },
    ],
  },
  {
    title: 'BrainBank',
    date: '03/15/26',
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/BrainBank' },
    ],
  },
  {
    title: 'LiftVault',
    date: '03/07/26',
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/LiftVault' },
    ],
  },
  {
    title: 'Cosmic Harmonic Visualizer',
    date: '11/20/25',
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/HarmonicVisualizer' },
    ],
  },
  {
    title: 'Fact-Checker Extension',
    date: '03/06/25',
    links: [
      { label: 'GitHub', href: 'https://github.com/imaddar/hack_cu_public/tree/main' },
    ],
  },
  {
    title: 'SportsSnap',
    date: '08/15/24',
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/sportssnap' },
    ],
  },
  {
    title: 'Community Event Platform',
    date: '05/20/24',
    links: [
      { label: 'GitHub', href: 'https://github.com/latrael/13-03' },
    ],
  },
]
