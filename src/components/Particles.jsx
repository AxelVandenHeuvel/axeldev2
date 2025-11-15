import { useEffect, useRef } from 'react'
import './Particles.css'

const randRange = (min, max) => Math.random() * (max - min) + min

export default function Particles({
  className = '',
  particleColors = ['#ffffff'],
  particleCount = 200,
  particleSpread = 10,
  speed = 0.15,
  particleBaseSize = 90,
  moveParticlesOnHover = true,
  alphaParticles = false,
  disableRotation = false,
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationId

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.scale(dpr, dpr)
    }

    const createParticles = () => {
      particlesRef.current = Array.from({ length: particleCount }).map(() => {
        const color = particleColors[Math.floor(Math.random() * particleColors.length)] || '#ffffff'
        const size = particleBaseSize * randRange(0.3, 1)
        return {
          x: Math.random() * canvas.clientWidth,
          y: Math.random() * canvas.clientHeight,
          baseX: Math.random() * canvas.clientWidth,
          baseY: Math.random() * canvas.clientHeight,
          drift: randRange(0.5, 1.5),
          offset: Math.random() * Math.PI * 2,
          color,
          size,
          alpha: alphaParticles ? randRange(0.35, 0.8) : 1,
          rotation: Math.random() * Math.PI * 2,
          depth: Math.random(),
        }
      })
    }

    const render = (time) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)

      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.04
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.04

      particlesRef.current.forEach((particle, index) => {
        const noise = Math.sin(time * 0.00008 + particle.offset)
        const depthScale = 0.4 + particle.depth * 1.1
        const amp = particleSpread * depthScale
        particle.x += Math.cos(time * 0.00005 + index) * speed * amp + noise * depthScale
        particle.y += Math.sin(time * 0.00005 + index) * speed * amp + noise * depthScale

        if (!disableRotation) {
          particle.rotation += 0.007 * particle.drift
        }

        if (particle.x > width + 50) particle.x = -50
        if (particle.x < -50) particle.x = width + 50
        if (particle.y > height + 50) particle.y = -50
        if (particle.y < -50) particle.y = height + 50

        const parallaxIntensity = 10 + particle.depth * 25
        const parallaxX = pointerRef.current.x * parallaxIntensity
        const parallaxY = pointerRef.current.y * parallaxIntensity

        ctx.save()
        ctx.translate(particle.x + parallaxX, particle.y + parallaxY)
        ctx.rotate(particle.rotation)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * depthScale * 0.6)
        gradient.addColorStop(0, particle.color)
        gradient.addColorStop(1, `${particle.color}00`)
        ctx.globalAlpha = particle.alpha
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(0, 0, particle.size * (alphaParticles ? 0.35 : 0.18), 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      animationId = requestAnimationFrame(render)
    }

    const handlePointer = (event) => {
      if (!moveParticlesOnHover) return
      const rect = canvas.getBoundingClientRect()
      pointerRef.current.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2
      pointerRef.current.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    }

    const handleLeave = () => {
      pointerRef.current.targetX = 0
      pointerRef.current.targetY = 0
    }

    const init = () => {
      resize()
      createParticles()
      animationId = requestAnimationFrame(render)
    }

    init()
    window.addEventListener('resize', init)
    canvas.addEventListener('pointermove', handlePointer)
    canvas.addEventListener('pointerleave', handleLeave)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', init)
      canvas.removeEventListener('pointermove', handlePointer)
      canvas.removeEventListener('pointerleave', handleLeave)
    }
  }, [particleColors, particleCount, particleSpread, speed, particleBaseSize, moveParticlesOnHover, alphaParticles, disableRotation])

  return (
    <div className={`particles-layer ${className}`}>
      <canvas ref={canvasRef} className="particles-canvas" />
    </div>
  )
}
