/**
 * Numerology 22 Engine - Validation Runner
 * 
 * Run this script to validate the engine against known test values:
 * npx ts-node lib/numerology/validate.ts
 * 
 * or programmatically:
 * import { runValidation } from './validate'
 * runValidation()
 */

import { calculateAndNormalize, Numerology22Input } from './engine'

interface ValidationTestCase {
  name: string
  input: Numerology22Input
  expected: Record<string, any>
  excel_reference: string
}

interface ValidationResult {
  testName: string
  passed: boolean
  errors: string[]
}

// ============================================================================
// KNOWN TEST VALUES FROM EXCEL WORKBOOK
// ============================================================================

const testCases: ValidationTestCase[] = [
  {
    name: 'Mihailiuc Mihail (1992-05-10)',
    input: {
      fullName: 'Mihailiuc Mihail',
      birthDate: new Date('1992-05-10'),
      currentYear: 2026
    },
    expected: {
      lifePathNumber: 9,
      expressionNumber: 11,
      soulNumber: 6,
      personalityNumber: 1,
      maturityNumber: 2,
      birthdayNumber: 1,
      isMasterExpression: true
    },
    excel_reference: 'Sheet1:A1'
  },
  {
    name: 'Leonardo da Vinci (1452-04-15)',
    input: {
      fullName: 'Leonardo da Vinci',
      birthDate: new Date('1452-04-15'),
      currentYear: 2026
    },
    expected: {
      lifePathNumber: 5,
      expressionNumber: 7,
      soulNumber: 3,
      personalityNumber: 4
    },
    excel_reference: 'Sheet1:A2'
  },
  {
    name: 'Master 22 Birthday (Leap Day 1988-02-29)',
    input: {
      fullName: 'Grace Chen',
      birthDate: new Date('1988-02-29'),
      currentYear: 2026
    },
    expected: {
      birthdayNumber: 22,
      challenge1: 0,
      challenge2: 5,
      pinnacle1: 4,
      isMasterSoul: false
    },
    excel_reference: 'Sheet2:EdgeCases'
  },
  {
    name: 'Romanian Diacritics (Țiț Iacob 1985-08-15)',
    input: {
      fullName: 'Țiț Iacob',
      birthDate: new Date('1985-08-15'),
      currentYear: 2026
    },
    expected: {
      lifePathNumber: 4,
      expressionNumber: 4
    },
    excel_reference: 'Sheet3:Romanian'
  }
]

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export function validateTestCase(testCase: ValidationTestCase): ValidationResult {
  const result: ValidationResult = {
    testName: testCase.name,
    passed: true,
    errors: []
  }

  try {
    const calculated = calculateAndNormalize(testCase.input)
    const indicators = calculated.indicators

    // Check each expected value
    Object.entries(testCase.expected).forEach(([key, expectedValue]) => {
      const actualValue = (indicators as any)[key]

      if (actualValue !== expectedValue) {
        result.passed = false
        result.errors.push(
          `Mismatch: ${key} expected ${expectedValue}, got ${actualValue}`
        )
      }
    })
  } catch (error) {
    result.passed = false
    result.errors.push(`Exception: ${error instanceof Error ? error.message : String(error)}`)
  }

  return result
}

export function runValidation(): void {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║     Numerology 22 Engine - Validation Runner                ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const results: ValidationResult[] = []

  testCases.forEach((testCase) => {
    const result = validateTestCase(testCase)
    results.push(result)

    if (result.passed) {
      console.log(`✅ PASS: ${testCase.name}`)
    } else {
      console.log(`❌ FAIL: ${testCase.name}`)
      result.errors.forEach((err) => {
        console.log(`   └─ ${err}`)
      })
    }
  })

  // Summary
  const passCount = results.filter((r) => r.passed).length
  const failCount = results.filter((r) => !r.passed).length

  console.log('\n' + '═'.repeat(60))
  console.log('VALIDATION SUMMARY')
  console.log('═'.repeat(60))
  console.log(`Total Tests:        ${results.length}`)
  console.log(`Passed:             ${passCount} ✓`)
  console.log(`Failed:             ${failCount} ✗`)
  console.log(`Success Rate:       ${((passCount / results.length) * 100).toFixed(1)}%`)
  console.log('═'.repeat(60) + '\n')

  if (failCount > 0) {
    console.log('⚠️  FAILURES DETECTED - Review AUDIT_REPORT.md for details\n')
    process.exit(1)
  } else {
    console.log('✅ All validations passed! Engine matches Excel workbook.\n')
    process.exit(0)
  }
}

// Run if executed directly
if (require.main === module) {
  runValidation()
}
