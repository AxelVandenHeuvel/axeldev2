/**
 * PROJECTS
 * --------
 * Add/edit/remove projects here. They auto-sort by date (newest first).
 *
 * Each project needs:
 *   title  - Project name (shown on card + detail page)
 *   tag    - Short tech label shown on card (e.g. "Python", "Swift")
 *   date   - Format: "MM/DD/YY"
 *
 * Optional fields for the detail page:
 *   description - Short summary paragraph
 *   tags        - Array of tech/tools used, e.g. ["Python", "Flask", "OpenAI"]
 *   body        - Longer write-up (supports \n for line breaks)
 *   images      - Array of image objects: { src: "/images/example.png", caption: "optional caption" }
 *   links       - Array of link objects: { label: "GitHub", href: "https://..." }
 *
 * To add a new project, copy the template below and fill it in:
 *
 *   {
 *     title: 'Project Name',
 *     tag: 'Main Tech',
 *     date: 'MM/DD/YY',
 *     description: 'One sentence summary.',
 *     tags: ['Tech1', 'Tech2'],
 *     body: 'Longer description here.',
 *     images: [
 *       { src: '/images/my-image.png', caption: 'What this shows' },
 *     ],
 *     links: [
 *       { label: 'GitHub', href: 'https://github.com/...' },
 *       { label: 'Demo', href: 'https://...' },
 *     ],
 *   },
 */

export const projects = [
  {
    title: 'VLMs for Deep Space',
    tag: 'C++',
    date: '02/25/26',
    description: 'A collaborative senior capstone project with NASA\'s Jet Propulsion Laboratory focusing on developing an open source software library to run VLMs for deep space spacecrafts.',
    tags: ['C++', 'Ollama', 'llama.cpp', 'Docker', 'Raspberry Pi'],
    body: 'In this project, my team and I are developing an open source software library to run VLMs on SBCs that could potentially be used on future deep space missions.',
    links: [
      { label: 'GitHub', href: 'https://github.com/ksuoo/NASA-JPL-Capstone' },
    ],
  },
  {
    title: 'Rep Tracker',
    tag: 'Swift',
    date: '02/25/26',
    description: 'An iOS app made to track your lifts.',
    tags: ['Swift'],
    body: 'Currently working on an app to track my lifts (curated for me). App store soon.',
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/axels-rep-tracker' },
    ],
  },
  {
    title: 'Cosmic Harmonic Visualizer',
    tag: 'Three.js',
    date: '11/20/25',
    description: 'Space-themed harmonic visualizer that creates constellations with uploaded music.',
    tags: ['JavaScript', 'Three.js', 'HTML/CSS'],
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/HarmonicVisualizer' },
    ],
  },
  {
    title: 'Fact-Checker Extension',
    tag: 'Python',
    date: '03/06/25',
    description: 'Nicknamed "Sherlock", a Chrome extension that fact checks online statements.',
    tags: ['Python', 'JavaScript', 'Flask', 'OpenAI'],
    body: 'Created for CU Hackathon 2025. Revisiting it in the near future to improve it.',
    links: [
      { label: 'GitHub', href: 'https://github.com/imaddar/hack_cu_public/tree/main' },
    ],
  },
  {
    title: 'Battlefield Platform',
    tag: 'Python',
    date: '12/05/24',
    description: 'Collaborated with the Army Cyber Institute to lead research and technical discovery for a modular hotswap payload drone system.',
    tags: ['Python', 'CAD'],
    body: 'Interviewed 75+ experts in related fields.',
  },
  {
    title: 'SportsSnap',
    tag: 'Flask',
    date: '08/15/24',
    description: 'Chrome extension that finds information on a sports player based on a screenshot from a YouTube video.',
    tags: ['Python', 'Flask', 'JavaScript', 'Elevenlabs'],
    body: 'Placed 5th at Hackathon.',
    links: [
      { label: 'Devpost', href: 'https://devpost.com/software/sportssnap' },
    ],
  },
  {
    title: 'Event Platform',
    tag: 'Node.js',
    date: '05/20/24',
    description: 'A web app that allows users to join and create communities and events, as well as add friends.',
    tags: ['Node.js', 'HTML/CSS', 'PostgreSQL', 'JavaScript'],
    body: 'Followed agile methodologies.',
    links: [
      { label: 'GitHub', href: 'https://github.com/latrael/13-03' },
    ],
  },
  {
    title: 'Personal Website',
    tag: 'Tailwind',
    date: '01/01/24',
    description: 'My site that you are currently on.',
    tags: ['Tailwind', 'JavaScript'],
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/axeldev2' },
    ],
  },
]
