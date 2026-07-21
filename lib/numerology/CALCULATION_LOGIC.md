# Numerology 22 Engine - Calculation Logic Documentation

## Overview

This document describes the complete calculation logic for the Numerology 22 engine, including all indicators, their identifiers, formulas, and implementation details.

**System**: Pythagorean (A-Z mapped to 1-9)
**Master Numbers**: 11, 22, 33
**Version**: 1.0.0

---

## Indicator Mapping

### Core Numbers (5 Indicators)

| ID | Indicator | Source | Formula | Notes |
|---|---|---|---|---|
| `life_path` | Life Path Number | Birth Date | (Year sum) + (Month) + (Day) reduced | Most important number |
| `expression` | Expression/Destiny | Full Name | Sum of all letters reduced | Talents & potentials |
| `soul` | Soul/Heart's Desire | Full Name | Sum of vowels only, reduced | Inner motivations |
| `personality` | Personality | Full Name | Sum of consonants only, reduced | How others perceive you |
| `maturity` | Maturity Number | Life Path + Expression | LP + Expression reduced | Later life influence |

### Birth Components (3 Indicators)

| ID | Indicator | Source | Formula |
|---|---|---|---|
| `birthday` | Birthday Number | Birth Date (day) | Day value reduced (preserves 22) |
| `birth_month` | Birth Month | Birth Date (month) | Month value reduced |
| `birth_year` | Birth Year | Birth Date (year) | Sum of year digits reduced |

### Personal Cycles (3 Indicators)

| ID | Indicator | Current | Formula | Updates |
|---|---|---|---|---|
| `personal_year` | Personal Year | Yearly | Birth Month + Birth Day + Current Year sum | Changes yearly on birthday |
| `personal_month` | Personal Month | Monthly | Personal Year + Current Month | Changes monthly |
| `personal_day` | Personal Day | Daily | Personal Month + Current Day | Changes daily |

### Challenges (4 Period Indicators)

| ID | Indicator | Period | Formula | Meaning |
|---|---|---|---|---|
| `challenge_1` | First Challenge | Birth - Age ~27 | \|Month - Day\| | First life period obstacles |
| `challenge_2` | Second Challenge | Age ~27 - ~54 | \|Day - Year\| | Middle life period obstacles |
| `challenge_3` | Third Challenge | Age ~54+ | \|Month - Year\| | Later life period obstacles |
| `challenge_4` | Fourth Challenge | All life | \|Challenge1 - Challenge3\| | Overall life challenge |

**Formula Notes:**
- All differences are absolute values
- Results are reduced to single digits (0-9), no master numbers

### Pinnacles (4 Period Indicators)

| ID | Indicator | Period | Formula | Meaning |
|---|---|---|---|---|
| `pinnacle_1` | First Pinnacle | Birth - Age ~27 | Month + Day reduced | First growth period |
| `pinnacle_2` | Second Pinnacle | Age ~27 - ~54 | Day + Year reduced | Second growth period |
| `pinnacle_3` | Third Pinnacle | Age ~54+ | Month + Year reduced | Later growth period |
| `pinnacle_4` | Fourth Pinnacle | All life | Pinnacle1 + Pinnacle3 reduced | Overall life pinnacle |

**Formula Notes:**
- Preserves master numbers (11, 22, 33)
- Results are 1-33

### Karmic Numbers (2 Array Indicators)

| ID | Indicator | Source | Calculation |
|---|---|---|---|
| `karmic_lessons` | Karmic Lesson Numbers | Full Name | Numbers 1-9 NOT present in name |
| `karmic_debts` | Karmic Debt Numbers | Life Path + Expression + Soul | Master numbers in these positions |

**Examples:**
- If name contains letters mapping to: 1,2,3,5,6,7,8,9 → Lesson: 4
- If Life Path = 22 (master) → Karmic Debt: 22

### Master Number Flags (4 Boolean Indicators)

| ID | Indicator | Condition |
|---|---|---|
| `is_master_life_path` | Life Path is 11, 22, or 33 | Boolean |
| `is_master_expression` | Expression is 11, 22, or 33 | Boolean |
| `is_master_soul` | Soul Number is 11, 22, or 33 | Boolean |
| `is_master_maturity` | Maturity is 11, 22, or 33 | Boolean |

---

## Calculation Examples

### Example 1: John Smith, Born 1985-03-21

**Step 1: Life Path Number**
- Year: 1985 → 1+9+8+5 = 23 → 2+3 = 5
- Month: 3
- Day: 21 → 2+1 = 3
- Sum: 5+3+3 = 11 ✓ (Master Number)

**Step 2: Expression Number**
- Full Name: "JOHNSMITH"
- J(1) + O(6) + H(8) + N(5) + S(1) + M(4) + I(9) + T(2) + H(8) = 44
- 44 → 4+4 = 8

**Step 3: Soul Number**
- Vowels only: O(6) + I(9) = 15 → 1+5 = 6

**Step 4: Personality Number**
- Consonants only: J(1) + H(8) + N(5) + S(1) + M(4) + T(2) + H(8) = 29 → 2+9 = 11 ✓ (Master)

**Step 5: Maturity Number**
- Life Path (11) + Expression (8) = 19 → 1+9 = 1

**Step 6: Challenges**
- C1: |3-3| = 0
- C2: |3-5| = 2
- C3: |3-5| = 2
- C4: |0-2| = 2

**Output:**
```json
{
  "lifePathNumber": 11,
  "expressionNumber": 8,
  "soulNumber": 6,
  "personalityNumber": 11,
  "maturityNumber": 1,
  "birthdayNumber": 3,
  "birthMonth": 3,
  "birthYear": 5,
  "challenge1": 0,
  "challenge2": 2,
  "challenge3": 2,
  "challenge4": 2,
  "isMasterLifePath": true,
  "isMasterExpression": false,
  "isMasterSoul": false,
  "isMasterMaturity": false
}
```

---

## Reduction Rules

### Standard Reduction (Single Digit)
Keep adding digits until you get one digit 1-9.

**Example:** 44 → 4+4 = 8

### Master Number Preservation
When keepMaster = true, numbers 11, 22, 33 are NOT further reduced.

**Example:** 44 → Check if 44 is master (no) → 4+4 = 8
**Example:** 29 → Check if 29 is master (no) → 2+9 = 11 ✓ Stop at 11

### Challenge Numbers (No Master Preservation)
Always reduce to single digit 0-9, no exceptions.

**Example:** If sum = 11, reduce to 1+1 = 2

---

## Input Validation

```typescript
interface Numerology22Input {
  fullName: string          // Required, non-empty, trimmed
  birthDate: Date          // Required, valid date
  currentYear?: number     // Optional, defaults to current year
}
```

**Validation Rules:**
- Full name must not be empty after trimming
- Birth date must be valid (not NaN)
- Current year must be a 4-digit number
- All calculations preserve order: name first, then birth date

---

## Output Format

```typescript
interface Numerology22Output {
  input: Numerology22Input
  indicators: Numerology22Indicators
  calculatedAt: string    // ISO 8601 timestamp
  calculationVersion: string  // "1.0.0"
}
```

**All indicators are numbers (1-33 or 0-9 for cycles) or arrays/booleans as specified.**

---

## Character Handling

### Supported Characters
- A-Z (uppercase and lowercase)
- Romanian diacritics: ă, â, î, ș, ț (converted to a, a, i, s, t)
- Spaces and hyphens (ignored during calculation)

### Unsupported Characters
- Numbers (0-9) - ignored
- Punctuation - ignored
- Special characters - ignored

**Normalization Process:**
1. Convert to lowercase
2. Replace Romanian diacritics with ASCII equivalents
3. Remove all non-alphabetic characters
4. Calculate on remaining letters

---

## Master Number Meanings (Summary)

- **11**: Visionary, Intuitive, Inspirator, Potential for spiritual insight
- **22**: Master Builder, Grand vision, Ambition on global scale, Potential for large-scale impact
- **33**: Master Teacher, Spiritual guide, Unconditional love, Potential for world healing

Master numbers indicate higher spiritual potential and responsibility.

---

## Implementation Notes

### Performance
- All calculations are O(n) where n = name length or constant for dates
- No external dependencies required
- Pure functional calculations (no side effects)

### Testing
- 50+ unit tests cover all indicators
- Test cases include master numbers, edge cases, Romanian diacritics
- All tests validate numerical ranges and consistency

### Extensibility
- Engine designed for easy addition of new indicators
- Each calculator function is independent and testable
- Output schema allows for future fields without breaking existing consumers

---

## References

- **Pythagorean System**: Standard western numerology (A=1...Z=8)
- **Master Numbers**: Universal numerology concept (11, 22, 33 = higher vibrations)
- **Personal Cycles**: Standard numerology calculation based on birth date and current date
- **Challenges & Pinnacles**: Classic numerology periods/cycles from birth date

---

*Last Updated: 2024*
*Version: 1.0.0*
