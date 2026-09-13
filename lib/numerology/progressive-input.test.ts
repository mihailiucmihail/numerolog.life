import assert from 'node:assert/strict'
import test from 'node:test'
import { birthDateSchema, progressiveIdentitySchema, completeIdentitySchema, checkoutEmailSchema, canCalculateNameFragment, missingIdentityFields } from './progressive-input'

const today = new Date('2026-09-13T12:00:00Z')
const schema = birthDateSchema(today)

test('date preview accepts only real calendar dates and strips identity', () => {
  assert.deepEqual(schema.parse({ day: '29', month: '02', year: '2000', first: 'Ignored', email: 'ignored@example.com', gender: 'f' }), { day: 29, month: 2, year: 2000 })
  for (const input of [
    { day: 29, month: 2, year: 1900 }, { day: 29, month: 2, year: 2025 },
    { day: 31, month: 4, year: 2000 }, { day: 0, month: 1, year: 2000 },
    { day: 1, month: 13, year: 2000 }, { day: 1, month: 1, year: 1899 },
    { day: 14, month: 9, year: 2026 }, { day: 13.1, month: 9, year: 2000 },
    { day: '1e1', month: 1, year: 2000 }, { day: true, month: 1, year: 2000 },
    { day: null, month: 1, year: 2000 }, { day: '', month: 1, year: 2000 },
    { day: ' 1', month: 1, year: 2000 }, { day: 1, month: 1, year: Infinity },
  ]) assert.equal(schema.safeParse(input).success, false, JSON.stringify(input))
  assert.equal(schema.safeParse({ day: 13, month: 9, year: 2026 }).success, true)
})

test('partial identity does not invent names, a patronymic or gender', () => {
  assert.deepEqual(progressiveIdentitySchema.parse({}), {})
  assert.equal(progressiveIdentitySchema.parse({ first: ' ', middle: '' }).first, undefined)
  assert.deepEqual(progressiveIdentitySchema.parse({ first: ' Ștefan ', last: 'Popescu', middle: ' ' }), { first: 'Ștefan', last: 'Popescu', middle: undefined })
  assert.equal(progressiveIdentitySchema.safeParse({ first: 'Ирина', last: 'Иванова' }).success, true)
  assert.equal(progressiveIdentitySchema.safeParse({ first: 'Jean-Luc', last: 'O’Connor' }).success, true)
  for (const first of ['<script>', '1234', 'a@example.com', 'a'.repeat(81), 'A\nB']) assert.equal(progressiveIdentitySchema.safeParse({ first }).success, false)
})

test('complete identity explicitly requires given name, birth surname and gender, not patronymic', () => {
  assert.equal(completeIdentitySchema.safeParse({ first: 'Ana', last: 'Popescu', gender: 'f' }).success, true)
  for (const value of [{}, { first: 'Ana' }, { first: 'Ana', last: 'Popescu' }, { first: 'Ana', last: ' ', gender: 'f' }]) assert.equal(completeIdentitySchema.safeParse(value).success, false)
})

test('nominal fragments stay unavailable until their actual name prerequisites exist', () => {
  assert.equal(canCalculateNameFragment('vocation', {}), false)
  assert.equal(canCalculateNameFragment('vocation', { first: 'Ana' }), true)
  assert.equal(canCalculateNameFragment('familyTask', { first: 'Ana' }), false)
  assert.equal(canCalculateNameFragment('familyTask', { last: 'Popescu' }), true)
  assert.equal(canCalculateNameFragment('personalFinancialFlow', { last: 'Popescu' }), false)
  assert.equal(canCalculateNameFragment('personalFinancialFlow', { last: 'Popescu', first: 'Ana' }), true)
  assert.deepEqual(missingIdentityFields({ first: '<script>', gender: 'unknown' }, ['first', 'last', 'gender']), ['first', 'last', 'gender'])
})

test('payment email cannot be omitted or bypassed with whitespace', () => {
  for (const value of [undefined, null, '', ' ', 'invalid', 'user@', 'user\n@example.com']) assert.equal(checkoutEmailSchema.safeParse(value).success, false)
  assert.equal(checkoutEmailSchema.parse(' user@example.com '), 'user@example.com')
})
