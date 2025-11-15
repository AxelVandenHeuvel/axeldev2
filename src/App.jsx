import { Navbar } from './components/Navbar'
import Particles from './components/Particles'
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
        <Particles
          className="absolute inset-0"
          particleColors={['#ffffff']}
          particleCount={80}
          particleSpread={18}
          speed={0.006}
          particleBaseSize={16}
          moveParticlesOnHover
          alphaParticles={false}
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
