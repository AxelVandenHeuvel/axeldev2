export const projects = [
  {
    slug: 'spark',
    title: 'VLMs for Deep Space Spacecraft',
    description:
      "A collaborative senior capstone project in colaboration with NASA's Jet Propulsion Laboratroy that is focusing on developoing an open source software library to run VLMs for deep space spacecrafts.",
    stack: ['C++', 'Ollama', 'llama.cpp', 'Docker', 'Raspberry Pi'],
    github: 'https://github.com/ksuoo/NASA-JPL-Capstone',
    highlight: 'Software could potentially be used on future NASA missions to deep space.',
    date: 'current',
    detail: {
      overview: 'A collaborative senior capstone project in collaboration with NASA\'s Jet Propulsion Laboratory focusing on developing an open source software library to run VLMs for deep space spacecrafts.',
      // Custom buttons - easily add more by adding objects to this array
      buttons: [
        { label: 'GitHub', href: 'https://github.com/ksuoo/NASA-JPL-Capstone', external: true },
        // Add more buttons here, e.g.:
        // label: 'Demo', href: 'https://example.com', external: true },
        // { label: 'Documentation', href: '/docs', external: false },
      ],
      // Sections - easily add images, text, lists
      sections: [
        {
          type: 'text',
          title: 'Overview',
          body: 'In this project, my team and I are developing an open soruce software library to run VLMs on SBCs that could potentially be used on future deep space missions.',
        },
        // Add images like this:
        // {
        //   type: 'image',
        //   src: '/path/to/image.jpg',
        //   alt: 'Description of image',
        //   caption: 'Optional caption text',
        // },
        // Add lists like this:
        // {
        //   type: 'text',
        //   title: 'Technologies Used',
        //   list: ['C++', 'Ollama', 'llama.cpp', 'Docker', 'Raspberry Pi'],
        // },
      ],
    },
  },
  {
    slug: 'sherlock',
    title: 'Fact-Checker Chrome Extension',
    description:
      'Nicknamed "Sherlock", a chrome extension that fact checks online statements.',
    stack: ['Python', 'JavaScript', 'Flask', 'OpenAI'],
    github: 'https://github.com/imaddar/hack_cu_public/tree/main',
    highlight: '',
    date: '2025-03-06',
    detail: { 
      overview: 'Nicknamed "Sherlock", a chrome extension that fact checks online statements.', 
      sections: 
      [{ title: 'Notes', body: 'Created for CU Hackathon 2025. Revisiting it in the near future to improve it.' }] 
    },
  },
  {
    slug: 'act',
    title: 'Autonomous Detect and Act Battlefield Platform',
    description:
      'Collaborated with the Army Cyber Institute to lead research and techinical discovery for a modular hotswap payload drone system.',
    stack: ['Python', 'CAD'],
    date: '2024-12-05',
    detail: { overview: 'Collaborated with the Army Cyber Institute to lead research and techinical discovery for a modular hotswap payload drone system.', sections: [{ title: 'Notes', body: 'Interviewed 75+ experts in related fields. ' }] },
  },
  {
    slug: 'sportssnap',
    title: 'SportsSnap',
    description:
      'Chrome Extension that finds information on a sports player based on a screenshot from a YouTube video.',
    stack: ['Python', 'Flask', 'JavaScript', 'Elevenlabs'],
    date: '2024-08-15',
    detail: { overview: 'Placeholder copy goes here.', buttons: [{ label: 'Devpost', href: 'https://devpost.com/software/sportssnap', external: true }], sections: [{ title: 'Notes', body: 'Placed 5th at Hackathon.' }] },
  },
  {
    slug: 'reptracker',
    title: "Axel's Rep Tracker",
    description: 'An ios app made to track your lifts.',
    stack: ['Swift'],
    github: 'https://github.com/AxelVandenHeuvel/axels-rep-tracker',
    highlight: 'Soon to be published to app store.',
    date: 'current',
    detail: { overview: 'IOS app made to track your lifts', sections: [{ title: 'Notes', body: 'Currently working on an app to track my lifts (curated for me). App store soon.' }] },
  },
  {
    slug: 'eventedu',
    title: 'Community Event Platform',
    description: 'Nicknamed "eventedu", a web app that allows users to join and create communities and events, as well as add friends to see what they are attending and joining.',
    stack: ['Node.js', 'HTML/CSS', 'PostgreSQL', 'JavaScript'],
    github: 'https://github.com/latrael/13-03',
    highlight: 'Followed Agile Methodoligies.',
    date: '2024-05-20',
    detail: { overview: 'Nicknamed "eventedu", a web app that allows users to join and create communities and events, as well as add friends to see what they are attending and joining.', buttons: [{ label: 'GitHub', href: 'https://github.com/latrael/13-03', external: true }], sections: [{ title: 'Notes', body: 'Followed agile methodoligies.' }] },
  },
  {
    slug: 'cosmic',
    title: 'Cosmic Harmonic Visulaizer',
    description: 'Space-Themed Harmonic Visualizer that creates constellations with the uploaded music.',
    stack: ['JavaScript', 'Three.js', 'HTML/CSS'],
    github: 'https://github.com/AxelVandenHeuvel/HarmonicVisualizer',
    highlight: '',
    date: '2025-11-20',
    detail: { overview: 'Space-Themed Harmonic Visualizer that creates constellations with the uploaded music.', sections: [{ title: 'Notes', body: 'Having fun with Codex' }] },
  },
  {
    slug: 'website',
    title: 'Personal Website',
    description: 'My site that you are currently on.',
    stack: ['Tailwind', 'JavaScript'],
    github: 'https://github.com/AxelVandenHeuvel/axeldev2',
    highlight: '',
    date: '2024-01-01',
    detail: { overview: 'Placeholder copy goes here.', sections: [{ title: 'Notes', body: 'More placeholder details coming soon.' }] },
  },
]
