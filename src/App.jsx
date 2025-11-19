import { Navbar } from './components/Navbar'
import ColorBends from './components/ColorBends'
import { ScrollProgress } from './components/ScrollProgress'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Projects } from './sections/Projects'
import { Skills } from './sections/Skills'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'
import { Experience } from './sections/Experience'

function App() {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="fixed inset-0 -z-20 overflow-hidden bg-night">
        <ColorBends
          className="absolute inset-0"
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={30}
          speed={0.3}
          scale={1.2}
          frequency={1.4}
          warpStrength={1.2}
          mouseInfluence={0.8}
          parallax={0.6}
          noise={0.08}
          transparent={false}
        />
      </div>
      <ScrollProgress />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Footer />
      </div>
    </div>
  )
}

export default App
