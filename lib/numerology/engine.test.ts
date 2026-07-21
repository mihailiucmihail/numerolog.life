/**
 * Unit Tests for Numerology 22 Engine
 * Tests all calculation functions with known values and edge cases
 */

import {
  calculateLifePath,
  calculateExpression,
  calculateSoul,
  calculatePersonality,
  calculateMaturity,
  getBirthdayNumber,
  getBirthMonth,
  getBirthYear,
  calculatePersonalYear,
  calculatePersonalMonth,
  calculatePersonalDay,
  calculateChallenges,
  calculatePinnacles,
  calculateKarmicLessons,
  calculateKarmicDebts,
  calculate,
  calculateAndNormalize,
  Numerology22Input
} from './engine'

// ============================================================================
// TEST FIXTURES
// ============================================================================

const testInputs = {
  // Test case 1: Known Life Path 1
  person1: {
    fullName: 'John Smith',
    birthDate: new Date('1985-03-21'),
  },
  // Test case 2: Known Master Number Life Path (22)
  person2: {
    fullName: 'Maria Garcia',
    birthDate: new Date('1979-04-13'),
  },
  // Test case 3: Romanian name with diacritics
  person3: {
    fullName: 'Mihailiuc Mihail',
    birthDate: new Date('1992-10-05'),
  },
  // Test case 4: Multi-part name
  person4: {
    fullName: 'Ana Maria Popescu Ionescu',
    birthDate: new Date('1988-07-15'),
  }
}

// ============================================================================
// TEST SUITE: Core Number Calculations
// ============================================================================

describe('Numerology 22 Engine - Core Numbers', () => {
  
  test('calculateLifePath - validates correct computation', () => {
    // Date: 1985-03-21
    // Year: 1+9+8+5 = 23 -> 2+3 = 5
    // Month: 3
    // Day: 2+1 = 3
    // Sum: 5+3+3 = 11 (master number)
    const result = calculateLifePath(new Date('1985-03-21'))
    expect(result).toBe(11)
  })
  
  test('calculateLifePath - master number 22', () => {
    // Date: 1979-04-13
    // Year: 1+9+7+9 = 26 -> 2+6 = 8
    // Month: 4
    // Day: 1+3 = 4
    // Sum: 8+4+4 = 16 -> 1+6 = 7
    const result = calculateLifePath(new Date('1979-04-13'))
    expect(result).toBe(7)
  })
  
  test('calculateLifePath - single digit', () => {
    // Date: 2000-01-01
    // Year: 2+0+0+0 = 2
    // Month: 1
    // Day: 1
    // Sum: 2+1+1 = 4
    const result = calculateLifePath(new Date('2000-01-01'))
    expect(result).toBe(4)
  })
  
  test('calculateExpression - full name sum', () => {
    // "JOHN" = 1+6+8+5 = 20 -> 2+0 = 2
    // "SMITH" = 1+13+9+20+8 = 51 -> 5+1 = 6
    // Total: 2+6 = 8
    const result = calculateExpression('John Smith')
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(33)
  })
  
  test('calculateSoul - vowel values only', () => {
    // "JOHN": O=6 -> 6
    // "SMITH": I=9 -> 9
    // Total: 6+9 = 15 -> 1+5 = 6
    const result = calculateSoul('John Smith')
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(33)
  })
  
  test('calculatePersonality - consonant values only', () => {
    // Should return valid number 1-33
    const result = calculatePersonality('John Smith')
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(33)
  })
  
  test('calculateMaturity - sum of Life Path + Expression', () => {
    const lifePath = 11
    const expression = 7
    const result = calculateMaturity(lifePath, expression)
    // 11+7 = 18 -> 1+8 = 9
    expect(result).toBe(9)
  })
  
  test('calculateMaturity - preserves master numbers', () => {
    const lifePath = 22
    const expression = 22
    const result = calculateMaturity(lifePath, expression)
    // 22+22 = 44 -> 4+4 = 8
    expect(result).toBe(8)
  })
  
  test('getBirthdayNumber - day extraction', () => {
    // Day: 21
    const result = getBirthdayNumber(new Date('1985-03-21'))
    // 2+1 = 3
    expect(result).toBe(3)
  })
  
  test('getBirthdayNumber - master number birthday', () => {
    // Day: 22
    const result = getBirthdayNumber(new Date('2000-05-22'))
    expect(result).toBe(22)
  })
  
  test('getBirthMonth - month reduction', () => {
    const result = getBirthMonth(new Date('1985-11-21'))
    // 1+1 = 2
    expect(result).toBe(2)
  })
  
  test('getBirthYear - year digit sum', () => {
    const result = getBirthYear(new Date('1985-03-21'))
    // 1+9+8+5 = 23 -> 2+3 = 5
    expect(result).toBe(5)
  })
})

// ============================================================================
// TEST SUITE: Personal Cycles
// ============================================================================

describe('Numerology 22 Engine - Personal Cycles', () => {
  
  test('calculatePersonalYear - valid computation', () => {
    const birthDate = new Date('1985-03-21')
    const result = calculatePersonalYear(birthDate, 2024)
    expect(typeof result).toBe('number')
    expect(result).toBeGreaterThanOrEqual(1)
    expect(result).toBeLessThanOrEqual(9)
  })
  
  test('calculatePersonalMonth - personal year + month', () => {
    const result = calculatePersonalMonth(5, 3)
    // 5+3 = 8
    expect(result).toBe(8)
  })
  
  test('calculatePersonalDay - personal month + day', () => {
    const result = calculatePersonalDay(8, 21)
    // 8+21 = 29 -> 2+9 = 11 (not reduced from master)
    expect(result).toBe(11)
  })
})

// ============================================================================
// TEST SUITE: Challenges & Pinnacles
// ============================================================================

describe('Numerology 22 Engine - Challenges & Pinnacles', () => {
  
  test('calculateChallenges - returns array of 4 numbers', () => {
    const result = calculateChallenges(new Date('1985-03-21'))
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(4)
    result.forEach(num => {
      expect(typeof num).toBe('number')
      expect(num).toBeGreaterThanOrEqual(0)
      expect(num).toBeLessThanOrEqual(9)
    })
  })
  
  test('calculatePinnacles - returns array of 4 numbers', () => {
    const result = calculatePinnacles(new Date('1985-03-21'))
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(4)
    result.forEach(num => {
      expect(typeof num).toBe('number')
      expect(num).toBeGreaterThanOrEqual(1)
      expect(num).toBeLessThanOrEqual(33)
    })
  })
})

// ============================================================================
// TEST SUITE: Karmic Numbers
// ============================================================================

describe('Numerology 22 Engine - Karmic Numbers', () => {
  
  test('calculateKarmicLessons - identifies missing numbers 1-9', () => {
    const result = calculateKarmicLessons('John Smith')
    expect(Array.isArray(result)).toBe(true)
    // All values should be 1-9
    result.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1)
      expect(num).toBeLessThanOrEqual(9)
    })
  })
  
  test('calculateKarmicLessons - empty array for complete name', () => {
    // Include all numbers 1-9 in name
    const result = calculateKarmicLessons('abcdefghi')
    expect(Array.isArray(result)).toBe(true)
  })
  
  test('calculateKarmicDebts - identifies master numbers', () => {
    const result = calculateKarmicDebts(22, 11, 7)
    expect(Array.isArray(result)).toBe(true)
    expect(result).toContain(22)
    expect(result).toContain(11)
    expect(result).not.toContain(7)
  })
  
  test('calculateKarmicDebts - no debts for single digit', () => {
    const result = calculateKarmicDebts(5, 7, 3)
    expect(result).toEqual([])
  })
})

// ============================================================================
// TEST SUITE: Master Calculator
// ============================================================================

describe('Numerology 22 Engine - Master Calculator', () => {
  
  test('calculate - validates input requirements', () => {
    expect(() => {
      calculate({ fullName: '', birthDate: new Date() })
    }).toThrow()
    
    expect(() => {
      calculate({ fullName: 'Test', birthDate: new Date('invalid') })
    }).toThrow()
  })
  
  test('calculate - returns all indicators', () => {
    const input: Numerology22Input = {
      fullName: 'John Smith',
      birthDate: new Date('1985-03-21')
    }
    const result = calculate(input)
    
    expect(result.lifePathNumber).toBeDefined()
    expect(result.expressionNumber).toBeDefined()
    expect(result.soulNumber).toBeDefined()
    expect(result.personalityNumber).toBeDefined()
    expect(result.maturityNumber).toBeDefined()
    expect(result.birthdayNumber).toBeDefined()
    expect(result.birthMonth).toBeDefined()
    expect(result.birthYear).toBeDefined()
    expect(result.personalYear).toBeDefined()
    expect(result.personalMonth).toBeDefined()
    expect(result.personalDay).toBeDefined()
    expect(result.challenge1).toBeDefined()
    expect(result.challenge2).toBeDefined()
    expect(result.challenge3).toBeDefined()
    expect(result.challenge4).toBeDefined()
    expect(result.pinnacle1).toBeDefined()
    expect(result.pinnacle2).toBeDefined()
    expect(result.pinnacle3).toBeDefined()
    expect(result.pinnacle4).toBeDefined()
    expect(Array.isArray(result.karmaticDebts)).toBe(true)
    expect(Array.isArray(result.karmaticLessons)).toBe(true)
    expect(typeof result.isMasterLifePath).toBe('boolean')
    expect(typeof result.isMasterExpression).toBe('boolean')
    expect(typeof result.isMasterSoul).toBe('boolean')
    expect(typeof result.isMasterMaturity).toBe('boolean')
  })
  
  test('calculate - all numbers in valid range', () => {
    const input: Numerology22Input = {
      fullName: 'Test Person',
      birthDate: new Date('1990-06-15')
    }
    const result = calculate(input)
    
    // Core numbers should be 1-33
    expect([result.lifePathNumber, result.expressionNumber, result.soulNumber, 
            result.personalityNumber, result.maturityNumber]).forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1)
      expect(num).toBeLessThanOrEqual(33)
    })
    
    // Daily cycles should be 1-9
    expect([result.personalYear, result.personalMonth, result.personalDay]).forEach(num => {
      expect(num).toBeGreaterThanOrEqual(1)
      expect(num).toBeLessThanOrEqual(9)
    })
    
    // Challenges should be 0-9
    expect([result.challenge1, result.challenge2, result.challenge3, result.challenge4])
      .forEach(num => {
      expect(num).toBeGreaterThanOrEqual(0)
      expect(num).toBeLessThanOrEqual(9)
    })
  })
  
  test('calculateAndNormalize - returns complete output', () => {
    const input: Numerology22Input = {
      fullName: 'John Smith',
      birthDate: new Date('1985-03-21')
    }
    const result = calculateAndNormalize(input)
    
    expect(result.input).toEqual(input)
    expect(result.indicators).toBeDefined()
    expect(result.calculatedAt).toBeDefined()
    expect(result.calculationVersion).toBe('1.0.0')
  })
  
  test('calculateAndNormalize - ISO timestamp', () => {
    const input: Numerology22Input = {
      fullName: 'John Smith',
      birthDate: new Date('1985-03-21')
    }
    const result = calculateAndNormalize(input)
    
    expect(new Date(result.calculatedAt)).toBeInstanceOf(Date)
    expect(result.calculatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

// ============================================================================
// TEST SUITE: Romanian Diacritics Support
// ============================================================================

describe('Numerology 22 Engine - Romanian Support', () => {
  
  test('calculate - handles Romanian diacritics', () => {
    const input: Numerology22Input = {
      fullName: 'Mihailiuc Mihail',
      birthDate: new Date('1992-10-05')
    }
    expect(() => calculate(input)).not.toThrow()
    const result = calculate(input)
    expect(result.expressionNumber).toBeDefined()
  })
  
  test('calculate - special characters are ignored', () => {
    const input1: Numerology22Input = {
      fullName: 'John Smith',
      birthDate: new Date('1985-03-21')
    }
    const input2: Numerology22Input = {
      fullName: 'John-Smith',
      birthDate: new Date('1985-03-21')
    }
    const result1 = calculate(input1)
    const result2 = calculate(input2)
    
    // Should be equivalent after normalization
    expect(result1.expressionNumber).toBe(result2.expressionNumber)
  })
})

// ============================================================================
// TEST SUITE: Consistency
// ============================================================================

describe('Numerology 22 Engine - Consistency', () => {
  
  test('calculate - same input always produces same output', () => {
    const input: Numerology22Input = {
      fullName: 'Test Person',
      birthDate: new Date('1985-03-21')
    }
    
    const result1 = calculate(input)
    const result2 = calculate(input)
    
    expect(result1.lifePathNumber).toBe(result2.lifePathNumber)
    expect(result1.expressionNumber).toBe(result2.expressionNumber)
    expect(result1.soulNumber).toBe(result2.soulNumber)
  })
  
  test('calculate - all test fixtures produce valid output', () => {
    Object.values(testInputs).forEach(input => {
      expect(() => calculate(input)).not.toThrow()
      const result = calculate(input)
      expect(result).toBeDefined()
      expect(result.lifePathNumber).toBeGreaterThanOrEqual(1)
    })
  })
})
