/**
 * Zodiac Sign Validation Tests
 * Ensures correct sun sign calculation for critical dates
 */

import { getSunSign } from "./astrology"

interface TestCase {
  birthDate: string
  expectedSign: string
  description: string
}

const testCases: TestCase[] = [
  // Critical edge cases
  { birthDate: "1992-10-05", expectedSign: "Balanța", description: "Libra (Balanță) - 05 octombrie" },
  { birthDate: "1992-10-23", expectedSign: "Scorpion", description: "Scorpio (Scorpion) - 23 octombrie" },
  { birthDate: "1992-10-22", expectedSign: "Balanța", description: "Libra (Balanță) - 22 octombrie (last day)" },
  
  // All zodiac signs - start dates
  { birthDate: "2000-03-21", expectedSign: "Berbec", description: "Aries (Berbec) - 21 martie" },
  { birthDate: "2000-04-20", expectedSign: "Taur", description: "Taurus (Taur) - 20 aprilie" },
  { birthDate: "2000-05-21", expectedSign: "Gemeni", description: "Gemini (Gemeni) - 21 mai" },
  { birthDate: "2000-06-21", expectedSign: "Rac", description: "Cancer (Rac) - 21 iunie" },
  { birthDate: "2000-07-23", expectedSign: "Leu", description: "Leo (Leu) - 23 iulie" },
  { birthDate: "2000-08-23", expectedSign: "Fecioara", description: "Virgo (Fecioara) - 23 august" },
  { birthDate: "2000-09-23", expectedSign: "Balanța", description: "Libra (Balanță) - 23 septembrie" },
  { birthDate: "2000-10-23", expectedSign: "Scorpion", description: "Scorpio (Scorpion) - 23 octombrie" },
  { birthDate: "2000-11-22", expectedSign: "Săgetător", description: "Sagittarius (Săgetător) - 22 noiembrie" },
  { birthDate: "2000-12-22", expectedSign: "Capricorn", description: "Capricorn (Capricorn) - 22 decembrie" },
  { birthDate: "2001-01-20", expectedSign: "Vărsător", description: "Aquarius (Vărsător) - 20 ianuarie" },
  { birthDate: "2001-02-19", expectedSign: "Pești", description: "Pisces (Pești) - 19 februarie" },
]

export function runZodiacValidationTests(): { passed: number; failed: number; errors: string[] } {
  let passed = 0
  let failed = 0
  const errors: string[] = []

  console.log("[v0] Running Zodiac Sign Validation Tests...")
  console.log("=" .repeat(60))

  for (const testCase of testCases) {
    try {
      const zodiacSign = getSunSign(testCase.birthDate)
      const isCorrect = zodiacSign.name === testCase.expectedSign

      if (isCorrect) {
        console.log(`✓ PASS: ${testCase.description}`)
        passed++
      } else {
        console.log(`✗ FAIL: ${testCase.description}`)
        console.log(`  Expected: ${testCase.expectedSign}, Got: ${zodiacSign.name}`)
        failed++
        errors.push(
          `${testCase.description}: Expected ${testCase.expectedSign}, got ${zodiacSign.name}`
        )
      }
    } catch (err) {
      console.log(`✗ ERROR: ${testCase.description}`)
      console.log(`  ${err}`)
      failed++
      errors.push(`${testCase.description}: ${String(err)}`)
    }
  }

  console.log("=" .repeat(60))
  console.log(`Results: ${passed} passed, ${failed} failed`)

  if (failed === 0) {
    console.log("🎉 All zodiac validation tests passed!")
  } else {
    console.log(`⚠️ ${failed} test(s) failed`)
  }

  return { passed, failed, errors }
}

// Run tests on module load if in development
if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
  // Tests will run when this module is imported
  if (typeof window === "undefined") {
    // Running on server
    setTimeout(() => {
      runZodiacValidationTests()
    }, 1000)
  }
}
