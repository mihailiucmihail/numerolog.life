import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { calculateDateOnlyCrystal } from './date-only-crystal'

const html = readFileSync(resolve(process.cwd(), 'public/cristalul-calculator.html'), 'utf8')
const today = new Date('2026-09-13T12:00:00Z')

function originalFunction(name: string): string {
  const start = html.indexOf(`function ${name}(`)
  assert.notEqual(start, -1, `Missing original function: ${name}`)
  const openingBrace = html.indexOf('{', start)
  let depth = 0
  for (let index = openingBrace; index < html.length; index++) {
    if (html[index] === '{') depth++
    if (html[index] === '}' && --depth === 0) return html.slice(start, index + 1)
  }
  throw new Error(`Unterminated original function: ${name}`)
}

const helpers = ['numberTo22', 'sumNumbers', 'lastNotZero', 'calcTP', 'calcOPV', 'computeRabochieChisla', 'computeMetacycles'].map(originalFunction).join('\n')
const computeStart = html.indexOf('function computeAll(')
assert.notEqual(computeStart, -1)
const start = html.indexOf('  const TaroDay = numberTo22(day);', computeStart)
const end = html.indexOf('  const RZ_num =', start)
assert.ok(start > computeStart && end > start)

// Execute only the original date block: never invoke computeAll with fake/empty identity.
const original = new Function('day', 'month', 'year', `${helpers}\n${html.slice(start, end)}\nreturn {
  TaroDay,TaroMonth,TaroYear,childhoodDigit,
  WorkNum_1,WorkNum_2,WorkNum_3,WorkNum_4,WorkNum_5,WorkNum_6,
  TP,TP_DOP,TP_4:AE24,OPV:OPV_simple,OPV_DOP,ZK:ZK_num,SZ_num,Prof_num,
  fateTrapNum,KCH_num,karmicLesson1_num,secretWishNum,
  KN_2:AA25,KN_3:AC25,KN_4:AE25,
  metacycles:computeMetacycles(day,month,year)
};`) as (day: number, month: number, year: number) => Record<string, unknown>

test('date-only formulas agree with the production calculator across calendar boundaries', () => {
  let compared = 0
  for (const year of [1900, 1904, 1961, 1988, 1992, 1999, 2000, 2001, 2024, 2026]) {
    for (let month = 1; month <= 12; month++) {
      for (const day of [1, 3, 9, 13, 14, 21, 22, 23, 27, 28, 29, 30, 31]) {
        const date = new Date(Date.UTC(year, month - 1, day))
        if (date.getUTCMonth() !== month - 1 || date > today) continue
        const result = calculateDateOnlyCrystal({ day, month, year }, today)
        const expected = original(day, month, year)
        for (const [key, value] of Object.entries(expected)) assert.deepEqual(result[key as keyof typeof result], value, `${day}/${month}/${year}: ${key}`)
        assert.equal(Object.values(result.counts).reduce((sum, n) => sum + n, 0), `${day}${month}${year}`.replace(/0/g, '').length)
        compared++
      }
    }
  }
  assert.ok(compared > 1400)
})

test('date-only output contains no invented name, vocation, gender, mandala or nominal map', () => {
  const result = calculateDateOnlyCrystal({ day: 10, month: 5, year: 1992, first: 'Ignored', gender: 'f' }, today)
  assert.equal(result.kind, 'date-only')
  for (const field of ['first', 'last', 'middle', 'gender', 'nameArcana', 'Prizvanie_num', 'RZ_num', 'mandala', 'nameCounts', 'combinedCounts']) assert.equal(field in result, false, field)
  assert.deepEqual(result, calculateDateOnlyCrystal({ day: 10, month: 5, year: 1992 }, today))
  assert.throws(() => calculateDateOnlyCrystal({ day: 31, month: 2, year: 2000 }, today))
})

test('zero differences reduce to 22 without replacing OPV with days 14–22', () => {
  const same = calculateDateOnlyCrystal({ day: 3, month: 3, year: 2000 }, today)
  assert.equal(same.OPV, 22)
  const karmicDay = calculateDateOnlyCrystal({ day: 14, month: 5, year: 2000 }, today)
  assert.equal(karmicDay.OPV, 9)
  assert.equal(karmicDay.OPV_DOP, 14)
})
