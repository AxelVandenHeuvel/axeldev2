import { useState } from 'react'
import { AsciiBlackHole } from './components/AsciiBlackHole'
import { CategoriesPage } from './pages/CategoriesPage'
import { PostsPage } from './pages/PostsPage'
import { projects } from './data/projects'
import { travel } from './data/travel'

const panels = {
  about: {
    title: 'about',
    content: `I'm a Computer Science senior at the University of Colorado Boulder, graduating in 2026. Recently I've been interested in AI tools for development and I'm constantly looking to expand my knowledge in software engineering.\n\nOutside of coding, I enjoy lifting weights, hiking, mechanical keyboards, and astronomy.\n\n---\n\nEducation\n\nUniversity of Colorado Boulder\nB.S. Computer Science, 3.64 GPA`,
  },
  resume: {
    title: 'resume',
    pdf: '/resume.pdf',
  },
  contact: {
    title: 'contact',
    links: [
      { label: 'Email', value: 'axelvandenhe@gmail.com', href: 'mailto:axelvandenhe@gmail.com' },
      { label: 'GitHub', value: 'AxelVandenHeuvel', href: 'https://github.com/AxelVandenHeuvel' },
      { label: 'LinkedIn', value: 'Axel VandenHeuvel', href: 'https://www.linkedin.com/in/axel-vandenheuvel/' },
    ],
  },
}

const lists = {
  cs: { title: 'posts', posts: projects },
  travel: { title: 'travel', posts: travel },
}

function App() {
  const [activePanel, setActivePanel] = useState(null)
  const [page, setPage] = useState('home')
  const [activeList, setActiveList] = useState('cs')
  const [selectedPost, setSelectedPost] = useState(null)

  if (page === 'post' && selectedPost) {
    return (
      <div className="relative min-h-screen bg-[#050914] text-white font-mono">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <button
            onClick={() => { setSelectedPost(null); setPage('list') }}
            className="text-sm text-slate-400 hover:text-white mb-12 block transition-colors"
          >
            ← back
          </button>
          <h1 className="text-2xl font-medium mb-2">{selectedPost.title}</h1>
          <span className="text-xs text-slate-500">{selectedPost.date}</span>

          {selectedPost.body && (
            <p className="text-slate-400 text-sm mt-8 whitespace-pre-line">{selectedPost.body}</p>
          )}

          {selectedPost.images && selectedPost.images.length > 0 && (
            <div className="mt-8 space-y-6">
              {selectedPost.images.map((img, i) => (
                <figure key={i}>
                  <img src={img.src} alt={img.caption || ''} className="w-full rounded-sm" />
                  {img.caption && <figcaption className="text-xs text-slate-500 mt-2">{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}

          {selectedPost.links && selectedPost.links.length > 0 && (
            <div className="flex gap-4 mt-8">
              {selectedPost.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-sm transition-colors"
                >
                  {link.label} →
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (page === 'list') {
    return (
      <PostsPage
        title={lists[activeList].title}
        posts={lists[activeList].posts}
        onBack={() => setPage('categories')}
        onSelectPost={(post) => { setSelectedPost(post); setPage('post') }}
      />
    )
  }

  if (page === 'categories') {
    return (
      <CategoriesPage
        onBack={() => setPage('home')}
        onSelect={(key) => { setActiveList(key); setPage('list') }}
      />
    )
  }

  return (
    <div className="h-screen bg-[#f2ebe0] flex flex-col justify-between px-6 py-8 overflow-hidden relative">
      <nav className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-row gap-6 md:left-8 md:translate-x-0 md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-4 font-mono text-sm text-neutral-800 z-20">
        {['about', 'resume', 'contact'].map((link) => (
          <button
            key={link}
            onClick={() => setActivePanel(activePanel === link ? null : link)}
            className="text-left hover:underline cursor-pointer"
          >
            {link}
          </button>
        ))}
      </nav>

      {/* Panel popup */}
      {activePanel && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 md:p-16">
          <div
            className="absolute inset-0 bg-black/10"
            onClick={() => setActivePanel(null)}
          />
          <div className={`relative bg-[#f2ebe0] shadow-lg w-full ${panels[activePanel].pdf ? 'max-w-5xl h-[90vh]' : 'max-w-2xl max-h-[70vh]'} overflow-y-auto p-8 font-mono rounded-sm`}>
            <div className="absolute inset-2 md:inset-3 border border-neutral-800 rounded-sm pointer-events-none" />
            <button
              onClick={() => setActivePanel(null)}
              className="absolute top-1.5 right-3.5 text-neutral-400 hover:text-neutral-800 text-lg z-10"
            >
              x
            </button>
            <div className="relative px-4 py-2 h-full flex flex-col">
              <h2 className="text-neutral-800 text-lg font-medium mb-4">{panels[activePanel].title}</h2>
              {panels[activePanel].pdf && (
                <iframe
                  src={`${panels[activePanel].pdf}#toolbar=0&navpanes=0`}
                  title="resume"
                  className="flex-1 w-full border border-neutral-300 rounded-sm bg-white"
                />
              )}
              {panels[activePanel].content && (
                <p className="text-neutral-600 text-sm whitespace-pre-line">{panels[activePanel].content}</p>
              )}
              {panels[activePanel].links && (
                <div className="space-y-4">
                  {panels[activePanel].links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between py-3 border-b border-neutral-300 text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <span className="text-sm text-neutral-400">{link.label}</span>
                      <span className="hover:underline">{link.value}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <pre className="text-neutral-800 text-[10px] sm:text-xs md:text-sm leading-tight font-mono select-none mx-auto w-fit">
{`____ _  _ ____ _
|__|  \\/  |___ |
|  | _/\\_ |___ |___`}
      </pre>

      <AsciiBlackHole onEnter={() => setPage('categories')} />

      <pre className="text-neutral-800 text-[10px] sm:text-xs md:text-sm leading-tight font-mono select-none mx-auto w-fit">
{`_  _ ____ _  _ ___  ____ _  _ _  _ ____ _  _ _  _ ____ _
|  | |__| |\\ | |  \\ |___ |\\ | |__| |___ |  | |  | |___ |
 \\/  |  | | \\| |__/ |___ | \\| |  | |___ |__|  \\/  |___ |___`}
      </pre>
    </div>
  )
}

export default App
