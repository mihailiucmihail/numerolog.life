import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { calculateDateOnlyCrystal } from './date-only-crystal'
import { canCalculateNameFragment, NAME_FRAGMENT_REQUIREMENTS, progressiveIdentitySchema, type NameFragment } from './progressive-input'

const html = readFileSync('public/cristalul-calculator.html', 'utf8')
const adapter = readFileSync('scripts/cristalul-progressive-check.js', 'utf8')

function extractFunction(source: string, name: string) {
  const start = source.indexOf(`function ${name}(`)
  assert.notEqual(start, -1, name)
  const opening = source.indexOf('{', start)
  let depth = 0
  for (let index = opening; index < source.length; index++) {
    if (source[index] === '{') depth++
    if (source[index] === '}' && --depth === 0) return source.slice(start, index + 1)
  }
  throw new Error(`Unterminated ${name}`)
}

const alphabetStart = html.indexOf('const ALPHABETS =')
const alphabetEnd = html.indexOf('function normalizeForAlphabet', alphabetStart)
assert.ok(alphabetStart > 0 && alphabetEnd > alphabetStart)
const helpers = ['normalizeForAlphabet', 'numberTo22', 'letterToNumber', 'lettersToNumber', 'sumNumbers', 'autoCyrillic', 'mReduceCol', 'mPairSum', 'mandalaFromGran', 'computeMandala', 'personalizedFinancialDigits', 'buildLifeChart', 'buildPersonalizedFinancialChart'].map(name => extractFunction(html, name)).join('\n')
const privateHelpers = ['checkNameAlphabet', 'checkNameData', 'checkPersonalResult'].map(name => extractFunction(adapter, name)).join('\n')
const functions = new Function(`${html.slice(alphabetStart, alphabetEnd)}\n${helpers}\n${privateHelpers}\nreturn { checkPersonalResult, computeMandala, buildPersonalizedFinancialChart, ALPHABETS };`)()
const date = calculateDateOnlyCrystal({ day: 10, month: 5, year: 1992 }, new Date('2026-09-13T12:00:00Z'))

function calculate(raw: unknown) {
  const identity = progressiveIdentitySchema.parse(raw)
  const available = Object.fromEntries((Object.keys(NAME_FRAGMENT_REQUIREMENTS) as NameFragment[]).map(fragment => [fragment, canCalculateNameFragment(fragment, identity)]))
  return functions.checkPersonalResult(date, identity, available)
}

test('no nominal calculation is run before its shared prerequisites exist', () => {
  for (const identity of [{}, { first: 'Ana' }, { last: 'Popescu' }]) {
    const result = calculate(identity)
    assert.equal(result.mandala, null)
    assert.equal(result.personalFinancialChart, null)
    assert.deepEqual(result.lifeCharts, date.lifeCharts)
  }
  const unavailable = functions.checkPersonalResult(date, { first: 'Ana', last: 'Popescu' }, {})
  assert.equal(unavailable.mandala, null)
  assert.equal(unavailable.personalFinancialChart, null)
  assert.equal(unavailable.Prizvanie_num, null)
})

test('mandala and nominal financial values reuse the original calculator for Latin and Cyrillic names', () => {
  for (const identity of [
    { first: 'Ana', last: 'Popescu', alphabet: 'ro' },
    { first: 'Ștefan', last: 'Țurcanu', middle: 'Andrei', alphabet: 'ro' },
    { first: 'Ирина', last: 'Иванова', alphabet: 'ru' },
    { first: 'Ирина', last: 'Иванова', middle: 'Александровна', alphabet: 'ru' },
  ]) {
    const result = calculate(identity)
    assert.deepEqual(result.mandala, functions.computeMandala(identity.last, identity.first, identity.middle || '', 10, 5, 1992, identity.alphabet))
    assert.deepEqual(result.personalFinancialChart, functions.buildPersonalizedFinancialChart(identity.last, identity.first, identity.middle || '', '', null, functions.ALPHABETS[identity.alphabet].letters))
    assert.deepEqual(result.lifeCharts, date.lifeCharts)
    assert.equal('gender' in result, false)
  }
})

test('completion recalculates without mutating the date result or retaining a stale nominal result', () => {
  const before = JSON.stringify(date)
  const first = calculate({ first: 'Ирина', last: 'Иванова' })
  const second = calculate({ first: 'Ирина', last: 'Иванова', middle: 'Александровна' })
  assert.notDeepEqual(first.mandala.gran, second.mandala.gran)
  assert.notDeepEqual(first.personalFinancialChart.points, second.personalFinancialChart.points)
  assert.equal(calculate({ first: 'Ирина' }).mandala, null)
  assert.equal(JSON.stringify(date), before)
})

test('mixed or unsupported alphabets are not silently dropped or replaced with invented identity', () => {
  for (const identity of [{ first: 'Ana', last: 'Иванова' }, { first: '张', last: '王' }]) {
    const result = calculate(identity)
    assert.equal(result.unsupportedAlphabet, true)
    assert.equal(result.mandala, null)
    assert.equal(result.personalFinancialChart, null)
  }
  const decomposed = calculate({ first: 'S\u0326tefan', last: 'Țurcanu' })
  assert.deepEqual(decomposed.mandala, calculate({ first: 'Ștefan', last: 'Țurcanu' }).mandala)
})
