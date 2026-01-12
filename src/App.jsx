import { Navbar } from './components/Navbar'
import ColorBends from './components/ColorBends'
import { Hero } from './sections/Hero'
import { About } from './sections/About'
import { Posts } from './sections/Posts'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'
import { Experience } from './sections/Experience'

function App() {
  return (
    <div className="relative min-h-screen text-slate-300">
      <div className="fixed inset-0 -z-20 bg-night" style={{ transform: 'translateZ(0)', WebkitBackfaceVisibility: 'hidden' }}>
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
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <About />
        <Posts />
        <Experience />
        <Contact />
        <Footer />
      </main>
    </div>
  )
}

export default App
