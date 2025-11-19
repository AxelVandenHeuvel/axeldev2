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
          colors={["#FF0066", "#00FF88", "#0066FF"]}
          rotation={0}
          autoRotate={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={0}
          parallax={0.5}
          noise={0.1}
          transparent={true}
          intensity={0.5}
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
