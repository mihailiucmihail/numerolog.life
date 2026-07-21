'use client'

import { motion } from 'framer-motion'
import { Home } from 'lucide-react'

interface HouseData {
  house: number
  sign: string
  degree: number
}

interface PlanetData {
  name: string
  house: number
  sign: string
  normDegree: number
}

interface AstrologicalHousesProps {
  houses: HouseData[]
  planets: PlanetData[]
}

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
}

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'Personalitate și Apariție',
  2: 'Bunuri și Valori',
  3: 'Comunicare și Frați',
  4: 'Familie și Rădăcini',
  5: 'Creativitate și Iubire',
  6: 'Muncă și Sănătate',
  7: 'Parteneriate și Căsătorie',
  8: 'Transformare și Moșteniri',
  9: 'Călătorii și Filosofie',
  10: 'Carieră și Reputație',
  11: 'Prieteni și Speranțe',
  12: 'Spiritualitate și Secrete',
}

export function AstrologicalHouses({ houses, planets }: AstrologicalHousesProps) {
  const getPlanetsInHouse = (houseNumber: number) => {
    return planets.filter((p) => p.house === houseNumber)
  }

  const formatDegrees = (degree: number) => {
    const degrees = Math.floor(degree)
    const minutes = Math.round((degree - degrees) * 60)
    return `${degrees}° ${minutes}'`
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-500/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-400" />
          Casele Astrologice
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {houses.map((house, index) => {
            const planetsInHouse = getPlanetsInHouse(house.house)
            return (
              <motion.div
                key={house.house}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-black/40 border border-blue-500/20 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
              >
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-blue-300">Casa {house.house}</span>
                    <span className="text-xl">{SIGN_SYMBOLS[house.sign]}</span>
                    <span className="text-sm text-gray-400">{house.sign}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic">
                    {HOUSE_MEANINGS[house.house]}
                  </p>
                </div>

                <div className="mb-3 pb-3 border-b border-blue-500/20">
                  <p className="text-xs text-gray-500">Cusp la {formatDegrees(house.degree)}</p>
                </div>

                {planetsInHouse.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-semibold">Planete în Casa:</p>
                    {planetsInHouse.map((planet) => (
                      <div key={planet.name} className="text-sm bg-blue-500/10 rounded px-2 py-1">
                        <span className="text-white font-medium">{planet.name}</span>
                        <span className="text-gray-400 ml-2">
                          {formatDegrees(planet.normDegree)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">Fără planete majore</p>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
