import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { calculateDateOnlyCrystal } from './date-only-crystal'
import { interpolateLifeChart, projectLifeChartPreview } from './date-only-life-charts'

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

const graphHelpers = ['numberTo9', 'retrogradeCalc', 'pad2', 'magicDigits', 'buildLifeChart', 'buildAllLifeCharts', 'buildQualityOfLife', 'buildYearlyCycle', 'mostRecentBirthday', 'computeCurrentAge', 'interpolateAtAge'].map(originalFunction).join('\n')
const graphStart = html.indexOf('  const karmicVals =', computeStart)
const graphEnd = html.indexOf('  let nameArcana =', graphStart)
assert.ok(graphStart > computeStart && graphEnd > graphStart)
const dateGraphBlock = html.slice(graphStart, graphEnd).replace('layer1, last, first)', 'layer1)')
const originalGraphs = new Function('day', 'month', 'year', 'now', `
  const Date = class extends globalThis.Date {
    constructor(...args) { super(...(args.length > 1 ? [globalThis.Date.UTC(...args)] : args.length ? args : [now])); }
    getFullYear() { return this.getUTCFullYear(); }
    getMonth() { return this.getUTCMonth(); }
    getDate() { return this.getUTCDate(); }
    setHours(...args) { return this.setUTCHours(...args); }
  };
  const YEAR_ENERGY_MAP = {1:1,2:2,3:3,4:4,5:5,6:4,7:3,8:2,9:1};
  ${helpers}\n${graphHelpers}\n${html.slice(start, end)}\n${dateGraphBlock}
  return {baseRaw,layer1,repeatCount,karmicLayerAges,lifeCharts,selfRealizationChart,qualityOfLife,yearlyCycle,currentAge:curAgeNow};
`) as (day: number, month: number, year: number, now: number) => Record<string, unknown>

test('all date-derived graphs preserve original seeds, shifted coordinates, averages and crossings', () => {
  let compared = 0
  for (const year of [1900, 1904, 1988, 1992, 1999, 2000, 2024, 2026]) {
    for (let month = 1; month <= 12; month++) {
      for (const day of [1, 9, 14, 22, 28, 29, 30, 31]) {
        const date = new Date(Date.UTC(year, month - 1, day))
        if (date.getUTCMonth() !== month - 1 || date > today) continue
        const result = calculateDateOnlyCrystal({ day, month, year }, today)
        const expected = originalGraphs(day, month, year, today.getTime())
        for (const [key, value] of Object.entries(expected)) assert.deepEqual(result[key as keyof typeof result], value, `${day}/${month}/${year}: ${key}`)
        compared++
      }
    }
  }
  assert.ok(compared > 650)
})

test('preview graphs stop at current plot age, interpolate the boundary and never mutate full charts', () => {
  const result = calculateDateOnlyCrystal({ day: 10, month: 5, year: 1992 }, today)
  for (const chart of [...Object.values(result.lifeCharts), result.selfRealizationChart]) {
    const untouched = structuredClone(chart)
    for (const age of [0, 1, 9, 10, 34, 79, 120]) {
      const preview = projectLifeChartPreview(chart, age)
      assert.ok(preview.points.every(point => point.plotAge <= age))
      assert.ok(preview.crossings.every(crossing => crossing <= age))
      assert.equal(preview.points.at(-1)?.plotAge, age)
      assert.equal(preview.currentLevel, interpolateLifeChart(chart.points, age))
      assert.equal('energy' in preview, false)
      assert.equal('financialPersonal' in preview, false)
      preview.points[0].level = 999
      assert.deepEqual(chart, untouched)
    }
  }
  assert.throws(() => projectLifeChartPreview(result.lifeCharts.career, -1))
  assert.throws(() => projectLifeChartPreview(result.lifeCharts.career, NaN))
})

test('cycles and current age remain correct before, on and after a leap-day birthday', () => {
  for (const reference of ['2024-02-28', '2024-02-29', '2024-03-01', '2025-02-28', '2025-03-01']) {
    const now = new Date(`${reference}T12:00:00Z`)
    const result = calculateDateOnlyCrystal({ day: 29, month: 2, year: 2000 }, now)
    const original = originalGraphs(29, 2, 2000, now.getTime())
    assert.equal(result.currentAge, original.currentAge)
    assert.deepEqual(result.yearlyCycle, original.yearlyCycle)
    assert.deepEqual(result.qualityOfLife, original.qualityOfLife)
  }
})

const alphabetStart = html.indexOf('const ALPHABETS = {')
const alphabetEnd = html.indexOf('function normalizeForAlphabet(', alphabetStart)
assert.ok(alphabetStart >= 0 && alphabetEnd > alphabetStart)
const nominalHelpers = ['normalizeForAlphabet', 'numberTo22', 'letterToNumber', 'lettersToNumber', 'checkNameData', 'checkPersonalResult'].map(originalFunction).join('\n')
const nominal = new Function(`${html.slice(alphabetStart, alphabetEnd)}\n${nominalHelpers}\nreturn {
  enrich: checkPersonalResult,
  name: checkNameData,
  expected(value, key) {
    const normalized = normalizeForAlphabet(value, key);
    return numberTo22(lettersToNumber(normalized, ALPHABETS[key].letters));
  },
};`)() as {
  enrich: (birth: ReturnType<typeof calculateDateOnlyCrystal>, identity: Record<string, string>) => ReturnType<typeof calculateDateOnlyCrystal> & {
    nameArcana: { first: number | null; last: number | null }
    nameCounts: Record<string, number> | null
    Prizvanie_num: number | null
    RZ_num: number | null
  }
  name: (value: unknown) => { arcana: number; counts: Record<string, number>; alphabet: string } | null
  expected: (value: string, alphabet: string) => number
}

test('private Grani preview adds no nominal values until actual names are supplied', () => {
  const birth = calculateDateOnlyCrystal({ day: 10, month: 5, year: 1992 }, today)
  const before = structuredClone(birth)
  const result = nominal.enrich(birth, {})
  assert.deepEqual(result.nameArcana, { first: null, last: null })
  for (const field of ['nameCounts', 'Prizvanie_num', 'RZ_num'] as const) assert.equal(result[field], null)
  assert.deepEqual(birth, before)
  assert.equal(result.lifeCharts, birth.lifeCharts)
  assert.equal('gender' in result, false)
  assert.equal('mandala' in result, false)
})

test('private nominal fragments preserve original letter arithmetic for Latin and Cyrillic', () => {
  const birth = calculateDateOnlyCrystal({ day: 10, month: 5, year: 1992 }, today)
  for (const [name, alphabet] of [['Ana', 'ro'], ['Ion', 'ro'], ['Ștefan', 'ro'], ['Анна', 'ru'], ['Иван', 'ru'], ['Ёлка', 'ru']]) {
    const data = nominal.name(name)!
    assert.equal(data.alphabet, alphabet)
    assert.equal(data.arcana, nominal.expected(name, alphabet))
    assert.equal(Object.values(data.counts).reduce((sum, n) => sum + n, 0), name.length)
    const firstOnly = nominal.enrich(birth, { first: name })
    assert.equal(firstOnly.nameArcana.first, data.arcana)
    assert.equal(firstOnly.RZ_num, null)
    const sum = 9 * birth.TaroMonth + birth.TaroYear + data.arcana
    assert.equal(firstOnly.Prizvanie_num, ((sum - 1) % 22) + 1)
    const lastOnly = nominal.enrich(birth, { last: name })
    assert.equal(lastOnly.RZ_num, data.arcana)
    assert.equal(lastOnly.Prizvanie_num, null)
    assert.equal(lastOnly.nameCounts, null)
    assert.equal(lastOnly.lifeCharts, firstOnly.lifeCharts)
  }
  for (const value of [undefined, null, '', ' ', '123', '张伟', 'AnaИван']) assert.equal(nominal.name(value), null)
  assert.deepEqual(nominal.name('Ștefan'.normalize('NFD')), nominal.name('Ștefan'))
})

test('zero differences reduce to 22 without replacing OPV with days 14–22', () => {
  const same = calculateDateOnlyCrystal({ day: 3, month: 3, year: 2000 }, today)
  assert.equal(same.OPV, 22)
  const karmicDay = calculateDateOnlyCrystal({ day: 14, month: 5, year: 2000 }, today)
  assert.equal(karmicDay.OPV, 9)
  assert.equal(karmicDay.OPV_DOP, 14)
})
