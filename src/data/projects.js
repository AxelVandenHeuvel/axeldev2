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
    title: 'SpeakEasy',
    tag: 'Rust',
    date: '04/19/26',
    description: 'Local, real-time speech-to-text for macOS. Hold a key, speak, release — your words appear wherever your cursor is, optionally refined by a local LLM. Everything runs on-device, no cloud.',
    tags: ['Rust', 'Tauri', 'whisper.cpp', 'llama.cpp', 'HTML/CSS/JS'],
    body: 'Built a push-to-talk dictation app for macOS that transcribes speech locally with whisper.cpp and can optionally refine the text with a bundled Qwen 2.5 LLM running through llama.cpp. Supports multiple refinement modes (raw, clean, rewrite), voice shortcuts, a personal dictionary, dictation commands, and multi-key push-to-talk combos. Signed with Apple Developer ID and notarized so it opens without Gatekeeper warnings. No audio or text ever leaves the device.',
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/SpeakEasy' },
      { label: 'Download', href: 'https://getspeakeasy.xyz' },
    ],
  },
  {
    title: 'VLMs for Deep Space',
    tag: 'Project',
    date: '04/06/26',
    description: 'A collaborative senior capstone project with NASA\'s Jet Propulsion Laboratory focusing on developing an open source software library to run VLMs for deep space spacecrafts.',
    tags: ['C++', 'Ollama', 'llama.cpp', 'Docker', 'Raspberry Pi'],
    body: 'My capstone team and I are developing an open source software library to run VLMs on SBCs that could potentially be used on future deep space missions. We are using llama.cpp as our main inference engine and benchmarking multiple local VLMs.',
    links: [
      { label: 'GitHub', href: 'https://github.com/ksuoo/NASA-JPL-Capstone' },
    ],
  },
  {
    title: 'BrainBank',
    tag: 'Python',
    date: '03/15/26',
    description: 'A hybrid Vector/Graph RAG system that turns unstructured journaling into a navigable 3D knowledge graph. Concepts, projects, tasks, and reflections are extracted from entries and connected into an explorable network.',
    tags: ['Python', 'FastAPI', 'LanceDB', 'Kuzu', 'React', 'Three.js', 'Gemini'],
    body: 'Built with a team of 4 CU Boulder CS seniors. The backend uses FastAPI with LanceDB for vector search and Kuzu for the concept graph, Gemini 1.5 Flash for concept extraction and grounded answers, and sentence-transformers for embeddings. The frontend is a React + Three.js app that renders the knowledge graph as an interactive 3D visualization. Supports journal ingestion, grounded Q&A, and latent document discovery across connected concepts.',
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/BrainBank' },
    ],
  },
  {
    title: 'LiftVault - Lift Tracking App',
    tag: 'Swift',
    date: '03/07/26',
    description: 'An iOS app made to track your lifts.',
    tags: ['Swift'],
    body: 'Lift Tracking app I made mainly for my one specific needs in the gym. It is focused on simplicity and ease of use which is important to me when I\'m in the middle of a workout. Everything is locally stored on the device. It uses the Apple Foundation Models to use AI to log sets and reps based on natural language',
    links: [
      { label: 'GitHub', href: 'https://github.com/AxelVandenHeuvel/LiftVault' },
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
    title: 'Community Event Platform',
    tag: 'Node.js',
    date: '05/20/24',
    description: 'A web app that allows users to join and create communities and events, as well as add friends.',
    tags: ['Node.js', 'HTML/CSS', 'PostgreSQL', 'JavaScript'],
    body: 'Followed agile methodologies as per class instructions.',
    links: [
      { label: 'GitHub', href: 'https://github.com/latrael/13-03' },
    ],
  },
]
