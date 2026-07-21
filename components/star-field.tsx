"use client"

import { useEffect, useRef, useState } from "react"

// Coordonatele constelatiilor zodiacale (normalizate 0-100)
const CONSTELLATIONS = {
  aries: {
    name: "Berbec",
    stars: [
      { x: 15, y: 12 }, { x: 18, y: 15 }, { x: 22, y: 14 }, { x: 25, y: 18 }
    ],
    lines: [[0, 1], [1, 2], [2, 3]]
  },
  taurus: {
    name: "Taur", 
    stars: [
      { x: 82, y: 8 }, { x: 85, y: 12 }, { x: 88, y: 10 }, { x: 86, y: 15 }, 
      { x: 83, y: 18 }, { x: 80, y: 14 }
    ],
    lines: [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [5, 0]]
  },
  gemini: {
    name: "Gemeni",
    stars: [
      { x: 8, y: 28 }, { x: 12, y: 32 }, { x: 10, y: 38 }, { x: 18, y: 28 },
      { x: 22, y: 32 }, { x: 20, y: 38 }
    ],
    lines: [[0, 1], [1, 2], [3, 4], [4, 5], [1, 4]]
  },
  cancer: {
    name: "Rac",
    stars: [
      { x: 88, y: 30 }, { x: 92, y: 34 }, { x: 90, y: 38 }, { x: 94, y: 36 },
      { x: 91, y: 42 }
    ],
    lines: [[0, 1], [1, 2], [1, 3], [2, 4]]
  },
  leo: {
    name: "Leu",
    stars: [
      { x: 5, y: 52 }, { x: 10, y: 48 }, { x: 15, y: 50 }, { x: 12, y: 55 },
      { x: 8, y: 58 }, { x: 18, y: 56 }
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [2, 5]]
  },
  virgo: {
    name: "Fecioara",
    stars: [
      { x: 85, y: 52 }, { x: 88, y: 48 }, { x: 92, y: 50 }, { x: 95, y: 54 },
      { x: 90, y: 58 }, { x: 86, y: 56 }
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]]
  },
  libra: {
    name: "Balanta",
    stars: [
      { x: 12, y: 72 }, { x: 8, y: 76 }, { x: 16, y: 76 }, { x: 12, y: 80 },
      { x: 6, y: 82 }, { x: 18, y: 82 }
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5]]
  },
  scorpio: {
    name: "Scorpion",
    stars: [
      { x: 82, y: 70 }, { x: 85, y: 74 }, { x: 88, y: 72 }, { x: 91, y: 76 },
      { x: 94, y: 74 }, { x: 96, y: 78 }, { x: 94, y: 82 }
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]
  },
  sagittarius: {
    name: "Sagetator",
    stars: [
      { x: 35, y: 15 }, { x: 40, y: 12 }, { x: 38, y: 18 }, { x: 42, y: 20 },
      { x: 45, y: 16 }
    ],
    lines: [[0, 1], [0, 2], [2, 3], [3, 4], [1, 4]]
  },
  capricorn: {
    name: "Capricorn",
    stars: [
      { x: 55, y: 10 }, { x: 60, y: 8 }, { x: 58, y: 14 }, { x: 62, y: 16 },
      { x: 65, y: 12 }
    ],
    lines: [[0, 1], [0, 2], [1, 4], [2, 3], [3, 4]]
  },
  aquarius: {
    name: "Varsator",
    stars: [
      { x: 45, y: 85 }, { x: 50, y: 82 }, { x: 48, y: 88 }, { x: 53, y: 86 },
      { x: 55, y: 90 }, { x: 58, y: 84 }
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5]]
  },
  pisces: {
    name: "Pesti",
    stars: [
      { x: 68, y: 88 }, { x: 72, y: 85 }, { x: 75, y: 88 }, { x: 70, y: 92 },
      { x: 74, y: 94 }, { x: 78, y: 90 }
    ],
    lines: [[0, 1], [1, 2], [0, 3], [3, 4], [2, 5], [4, 5]]
  }
}

const CONSTELLATION_ORDER = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
]

export function StarField() {
  const [activeConstellation, setActiveConstellation] = useState(0)
  const [isClient, setIsClient] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Rotate through constellations
  useEffect(() => {
    if (!isClient) return
    
    const interval = setInterval(() => {
      setActiveConstellation(prev => (prev + 1) % CONSTELLATION_ORDER.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [isClient])

  // Draw minimal background stars
  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      drawStars()
    }

    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453
      return x - Math.floor(x)
    }

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Minimal tiny stars - only 80
      for (let i = 0; i < 80; i++) {
        const x = seededRandom(i * 7) * canvas.width
        const y = seededRandom(i * 11) * canvas.height
        const size = seededRandom(i * 13) * 1 + 0.3
        const opacity = seededRandom(i * 17) * 0.3 + 0.1
        
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      }
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [isClient])

  const currentKey = CONSTELLATION_ORDER[activeConstellation]
  const currentConstellation = CONSTELLATIONS[currentKey as keyof typeof CONSTELLATIONS]

  return (
    <>
      {/* Bright cosmic gradient background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 0%, hsl(270, 60%, 22%) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 20% 30%, hsl(280, 55%, 18%) 0%, transparent 45%),
            radial-gradient(ellipse 90% 70% at 80% 70%, hsl(265, 50%, 16%) 0%, transparent 50%),
            linear-gradient(180deg, 
              hsl(268, 55%, 16%) 0%, 
              hsl(272, 50%, 14%) 30%,
              hsl(270, 52%, 12%) 60%,
              hsl(265, 48%, 10%) 100%
            )
          `
        }}
      />
      
      {/* Glowing nebula - gold (top left) - brighter */}
      <div 
        className="fixed inset-0 pointer-events-none animate-nebula-drift animate-nebula-glow"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 15% 20%, rgba(255, 200, 100, 0.25) 0%, rgba(255, 180, 80, 0.12) 40%, transparent 70%)
          `
        }}
      />
      
      {/* Glowing nebula - violet (bottom right) - brighter */}
      <div 
        className="fixed inset-0 pointer-events-none animate-nebula-drift-reverse animate-nebula-glow"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 85% 70%, rgba(180, 120, 255, 0.22) 0%, rgba(160, 100, 220, 0.10) 40%, transparent 65%)
          `,
          animationDelay: '4s'
        }}
      />

      {/* Glowing nebula - rose/magenta (center) - brighter */}
      <div 
        className="fixed inset-0 pointer-events-none animate-nebula-drift animate-nebula-glow"
        style={{
          background: `
            radial-gradient(ellipse 60% 45% at 50% 50%, rgba(220, 120, 180, 0.18) 0%, rgba(200, 100, 160, 0.08) 45%, transparent 70%)
          `,
          animationDelay: '8s'
        }}
      />

      {/* Glowing nebula - cyan/teal (top right) - brighter */}
      <div 
        className="fixed inset-0 pointer-events-none animate-nebula-drift-reverse animate-nebula-glow"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 80% 15%, rgba(100, 200, 230, 0.18) 0%, rgba(80, 180, 210, 0.08) 45%, transparent 65%)
          `,
          animationDelay: '2s'
        }}
      />

      {/* Glowing nebula - deep blue (bottom left) - brighter */}
      <div 
        className="fixed inset-0 pointer-events-none animate-nebula-drift animate-nebula-glow"
        style={{
          background: `
            radial-gradient(ellipse 65% 55% at 20% 85%, rgba(120, 150, 255, 0.20) 0%, rgba(100, 130, 230, 0.08) 45%, transparent 68%)
          `,
          animationDelay: '6s'
        }}
      />

      {/* Minimal background stars */}
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-60"
      />
      
      {/* Zodiac Constellations */}
      {isClient && (
        <svg 
          className="fixed inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="0.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {CONSTELLATION_ORDER.map((key, index) => {
            const constellation = CONSTELLATIONS[key as keyof typeof CONSTELLATIONS]
            const isActive = index === activeConstellation
            
            return (
              <g 
                key={key}
                className={isActive ? "opacity-100" : "opacity-[0.06]"}
                style={{ transition: 'opacity 2s ease-in-out' }}
              >
                {/* Lines */}
                {constellation.lines.map(([from, to], i) => (
                  <line
                    key={`${key}-line-${i}`}
                    x1={constellation.stars[from].x}
                    y1={constellation.stars[from].y}
                    x2={constellation.stars[to].x}
                    y2={constellation.stars[to].y}
                    stroke={isActive ? "rgba(200, 165, 80, 0.5)" : "rgba(200, 165, 80, 0.15)"}
                    strokeWidth={isActive ? 0.12 : 0.06}
                    style={{ transition: 'all 2s ease-in-out' }}
                  />
                ))}
                
                {/* Stars */}
                {constellation.stars.map((star, i) => (
                  <circle
                    key={`${key}-star-${i}`}
                    cx={star.x}
                    cy={star.y}
                    r={isActive ? 0.5 : 0.25}
                    fill={isActive ? "#FFD700" : "rgba(255, 255, 255, 0.4)"}
                    filter={isActive ? "url(#glow)" : undefined}
                    style={{ transition: 'all 2s ease-in-out' }}
                  />
                ))}

                {/* Name */}
                {isActive && (
                  <text
                    x={constellation.stars[0].x}
                    y={constellation.stars[0].y - 2.5}
                    fill="rgba(200, 165, 80, 0.6)"
                    fontSize="1.2"
                    fontFamily="serif"
                    textAnchor="middle"
                    className="animate-fade-in"
                  >
                    {constellation.name}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
      
      {/* Premium Comets */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Comet 1 - Long golden tail */}
        <div 
          className="absolute w-48 h-[2px] animate-comet-1"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(200, 165, 80, 0.8), rgba(255, 215, 0, 1))',
            boxShadow: '0 0 20px 2px rgba(255, 215, 0, 0.5), 0 0 40px 4px rgba(200, 165, 80, 0.3)',
            borderRadius: '50%',
            left: '-200px',
            top: '20%',
          }}
        />
        
        {/* Comet 2 - Violet accent */}
        <div 
          className="absolute w-32 h-[1.5px] animate-comet-2"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.7), rgba(200, 165, 80, 1))',
            boxShadow: '0 0 15px 2px rgba(139, 92, 246, 0.4), 0 0 30px 4px rgba(200, 165, 80, 0.2)',
            borderRadius: '50%',
            left: '-150px',
            top: '45%',
          }}
        />
        
        {/* Comet 3 - Fast small */}
        <div 
          className="absolute w-24 h-[1px] animate-comet-3"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), rgba(255, 215, 0, 0.9))',
            boxShadow: '0 0 10px 1px rgba(255, 215, 0, 0.4)',
            borderRadius: '50%',
            left: '-100px',
            top: '70%',
          }}
        />
        
        {/* Comet 4 - Diagonal luxury */}
        <div 
          className="absolute w-40 h-[2px] animate-comet-4"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(200, 165, 80, 0.6), rgba(255, 255, 255, 1))',
            boxShadow: '0 0 25px 3px rgba(255, 255, 255, 0.4), 0 0 50px 6px rgba(200, 165, 80, 0.2)',
            borderRadius: '50%',
            transform: 'rotate(-25deg)',
            left: '-200px',
            top: '35%',
          }}
        />
      </div>
      
      {/* Soft vignette - symmetric, no hard edges */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 150% 100% at 50% 50%, transparent 50%, rgba(0, 0, 0, 0.15) 100%)'
        }}
      />

      <style jsx>{`
        @keyframes comet-1 {
          0% { transform: translateX(0) translateY(0); opacity: 0; }
          5% { opacity: 1; }
          30% { opacity: 1; }
          35% { transform: translateX(calc(100vw + 400px)) translateY(100px); opacity: 0; }
          100% { transform: translateX(calc(100vw + 400px)) translateY(100px); opacity: 0; }
        }
        
        @keyframes comet-2 {
          0%, 40% { transform: translateX(0) translateY(0); opacity: 0; }
          45% { opacity: 1; }
          65% { opacity: 1; }
          70% { transform: translateX(calc(100vw + 300px)) translateY(80px); opacity: 0; }
          100% { transform: translateX(calc(100vw + 300px)) translateY(80px); opacity: 0; }
        }
        
        @keyframes comet-3 {
          0%, 60% { transform: translateX(0) translateY(0); opacity: 0; }
          62% { opacity: 1; }
          78% { opacity: 1; }
          80% { transform: translateX(calc(100vw + 200px)) translateY(-50px); opacity: 0; }
          100% { transform: translateX(calc(100vw + 200px)) translateY(-50px); opacity: 0; }
        }
        
        @keyframes comet-4 {
          0%, 75% { transform: rotate(-25deg) translateX(0); opacity: 0; }
          78% { opacity: 1; }
          92% { opacity: 1; }
          95% { transform: rotate(-25deg) translateX(calc(100vw + 400px)); opacity: 0; }
          100% { transform: rotate(-25deg) translateX(calc(100vw + 400px)); opacity: 0; }
        }
        
        .animate-comet-1 { animation: comet-1 20s ease-in-out infinite; }
        .animate-comet-2 { animation: comet-2 25s ease-in-out infinite; }
        .animate-comet-3 { animation: comet-3 18s ease-in-out infinite; }
        .animate-comet-4 { animation: comet-4 30s ease-in-out infinite; }
        
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-nebula-drift {
          animation: nebulaGlow 12s ease-in-out infinite;
        }
        
        .animate-nebula-drift-reverse {
          animation: nebulaGlow 14s ease-in-out infinite;
        }

        /* Glow animation only - no transform to prevent misalignment */
        .animate-nebula-drift.animate-nebula-glow {
          animation: nebulaGlow 12s ease-in-out infinite;
        }

        .animate-nebula-drift-reverse.animate-nebula-glow {
          animation: nebulaGlow 14s ease-in-out infinite;
        }
        
        @keyframes nebulaGlow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  )
}
