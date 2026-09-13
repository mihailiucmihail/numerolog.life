import assert from 'node:assert/strict'
import test from 'node:test'
import { FULL_CRYSTAL_IDENTITY_REQUEST, identityCompletionSchema, mergeIdentityCompletion } from './identity-completion'

const nameOnly = identityCompletionSchema({ fields: ['first'], requireEmail: false })

test('a given-name fragment does not require surname, email or inferred gender', () => {
  assert.deepEqual(nameOnly.parse({ first: ' Ирина ' }), { first: 'Ирина' })
  assert.equal(nameOnly.safeParse({}).success, false)
  assert.equal(nameOnly.safeParse({ first: '  ' }).success, false)
  assert.equal(nameOnly.safeParse({ first: '<script>' }).success, false)
})

test('email-only checkout contract leaves identity absent', () => {
  const schema = identityCompletionSchema({ fields: [], requireEmail: true })
  assert.deepEqual(schema.parse({ email: ' user@example.com ' }), { email: 'user@example.com' })
  for (const email of ['', ' ', undefined, 'broken@']) assert.equal(schema.safeParse({ email }).success, false)
})

test('full crystal completion requires an explicit gender and valid email', () => {
  const schema = identityCompletionSchema(FULL_CRYSTAL_IDENTITY_REQUEST)
  const person = { first: 'Ștefan', last: 'Popescu', gender: 'm' as const, email: 'user@example.com' }
  assert.deepEqual(schema.parse(person), person)
  for (const field of ['first', 'last', 'gender', 'email'] as const) {
    assert.equal(schema.safeParse({ ...person, [field]: undefined }).success, false, field)
  }
  assert.equal(schema.safeParse({ ...person, middle: '' }).success, true)
})

test('successive completions retain valid existing values without mutating the original', () => {
  const current = { first: 'Ana', email: 'user@example.com' }
  const next = mergeIdentityCompletion(current, { last: ' O’Connor ' })
  assert.deepEqual(current, { first: 'Ana', email: 'user@example.com' })
  assert.deepEqual(next, { first: 'Ana', last: 'O’Connor', email: 'user@example.com' })
  assert.equal('gender' in next, false)
  assert.equal('middle' in next, false)
  assert.throws(() => mergeIdentityCompletion(current, { first: '123' }))
})

test('unknown attribution, entitlement and price fields never survive validation', () => {
  const schema = identityCompletionSchema({ fields: [], requireEmail: false })
  assert.deepEqual(schema.parse({ arm: 'A', visitorId: 'forged', paid: true, amount: 1, unlocked_grani: [1] }), {})
})
