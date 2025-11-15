/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        night: '#050914',
        aurora: '#1d1b2f',
        accent: '#a855f7',
        accentSoft: '#c084fc',
        glow: '#5eead4',
      },
      boxShadow: {
        glow: '0 15px 60px rgba(168,85,247,0.25)',
        card: '0 20px 45px rgba(15,23,42,0.45)',
      },
      backgroundImage: {
        'noise-soft':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
}
