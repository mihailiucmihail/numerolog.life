import assert from 'node:assert/strict'
import test from 'node:test'
import {
  BIRTH_INPUT_ARMS, BIRTH_INPUT_EXPERIMENT, BIRTH_INPUT_TTL_MS, INITIAL_BIRTH_INPUT_SETTINGS,
  birthInputSurface, excludeBirthInputEnrollment, isBirthInputSettings,
  readBirthInputAssignment, resolveBirthInputAssignment, signBirthInputAssignment, selectBirthInputSecret,
  type BirthInputSettings,
} from './birth-input-experiment'
import { FORM_VARIANTS, PREVIEW_VARIANTS } from './catalog'

const now = Date.UTC(2026, 8, 13, 12)
const secret = 'unit-test-only-signing-secret-123456'
const visitorId = 'a'.repeat(32)
const settings: BirthInputSettings = { experiment: BIRTH_INPUT_EXPERIMENT, enabled: true, percentages: { A: 50, B: 50 } }
const context = { settings, previous: null, visitorId, url: new URL('https://numerolog.life/ru'), headers: new Headers(), now }

test('short admin passwords do not shadow a valid signing secret', async () => {
  assert.equal(selectBirthInputSecret(undefined, 'short', secret), secret)
  assert.equal(selectBirthInputSecret('', 'short', secret), secret)
  assert.equal(selectBirthInputSecret(secret, 'another-valid-secret', undefined), secret)
  assert.equal(selectBirthInputSecret(undefined, 'short', undefined), '')
  assert.equal(selectBirthInputSecret(' '.repeat(32)), '')
  const { assignment } = await resolveBirthInputAssignment(context)
  assert.ok(assignment)
  const selected = selectBirthInputSecret(undefined, 'short', secret)
  const signed = await signBirthInputAssignment(assignment, selected, now)
  assert.deepEqual(await readBirthInputAssignment(signed, selected, now), assignment)
})

test('new experiment is inactive, isolated and does not reinterpret historical IDs', () => {
  assert.deepEqual(INITIAL_BIRTH_INPUT_SETTINGS.percentages, { A: 0, B: 0 })
  assert.equal(INITIAL_BIRTH_INPUT_SETTINGS.enabled, false)
  assert.equal(isBirthInputSettings(INITIAL_BIRTH_INPUT_SETTINGS), true)
  const forms = new Set(FORM_VARIANTS.map(row => row.id))
  const previews = new Set(PREVIEW_VARIANTS.map(row => row.id))
  for (const arm of Object.values(BIRTH_INPUT_ARMS)) {
    assert.equal(forms.has(arm.form), false)
    assert.equal(previews.has(arm.preview), false)
  }
})

test('invalid configurations fail closed instead of allocating a synthetic control', async () => {
  for (const config of [null, {}, { ...settings, percentages: { A: 80, B: 0 } },
    { ...settings, percentages: { A: -10, B: 110 } }, { ...settings, percentages: { A: 50.5, B: 49.5 } },
    { ...settings, percentages: { A: '50', B: 50 } }, { ...settings, experiment: 'birth-input-v2' },
    { ...settings, enabled: false }, INITIAL_BIRTH_INPUT_SETTINGS]) {
    const result = await resolveBirthInputAssignment({ ...context, settings: config })
    assert.deepEqual(result, { assignment: null, changed: false })
  }
})

test('assignment survives navigation, UTM changes, go=1 and weight changes', async () => {
  const initial = await resolveBirthInputAssignment(context)
  assert.ok(initial.assignment)
  assert.equal(initial.changed, true)
  const { arm } = initial.assignment
  const changedWeights = { ...settings, percentages: arm === 'A' ? { A: 0, B: 100 } : { A: 100, B: 0 } }
  for (const path of ['/ru', '/ro', '/ru/numerologie', '/ro/numerologie?go=1', '/ru/numerologie?utm_source=instagram&entry=love']) {
    const result = await resolveBirthInputAssignment({ ...context, settings: changedWeights, previous: initial.assignment, url: new URL(`https://numerolog.life${path}`), now: now + 1000 })
    assert.equal(result.assignment, initial.assignment)
    assert.equal(result.assignment.firstSurface, 'home')
    assert.equal(result.changed, false)
  }
  assert.equal((await resolveBirthInputAssignment({ ...context, previous: initial.assignment, settings: INITIAL_BIRTH_INPUT_SETTINGS })).assignment, null)
})

test('new visitors follow the current weights', async () => {
  for (const arm of ['A', 'B'] as const) {
    const result = await resolveBirthInputAssignment({ ...context, settings: { ...settings, percentages: { A: arm === 'A' ? 100 : 0, B: arm === 'B' ? 100 : 0 } } })
    assert.equal(result.assignment?.arm, arm)
  }
  const totals = { A: 0, B: 0 }
  for (let index = 1; index <= 500; index++) {
    const result = await resolveBirthInputAssignment({ ...context, visitorId: index.toString(16).padStart(32, '0') })
    assert.ok(result.assignment)
    totals[result.assignment.arm]++
  }
  assert.ok(totals.A > 200 && totals.A < 300, JSON.stringify(totals))
})

test('admin previews, prefetch and privacy signals never enroll', async () => {
  for (const marker of ['ap=token', 'fv=x', 'pv=y', 'analytics_test=1']) {
    const url = new URL(`https://numerolog.life/ru/numerologie?${marker}`)
    assert.equal(excludeBirthInputEnrollment(url, new Headers()), true)
    assert.equal((await resolveBirthInputAssignment({ ...context, url })).assignment, null)
  }
  for (const [key, value] of [['purpose', 'prefetch'], ['sec-purpose', 'prefetch;prerender'], ['next-router-prefetch', '1'], ['next-router-segment-prefetch', '/'], ['dnt', '1'], ['sec-gpc', '1']]) {
    assert.equal((await resolveBirthInputAssignment({ ...context, headers: new Headers({ [key]: value }) })).assignment, null)
  }
})

test('only the homepage and Numerologie entry surface can enroll', () => {
  for (const path of ['/', '/ro', '/ru/']) assert.equal(birthInputSurface(new URL(`https://numerolog.life${path}`)), 'home')
  for (const path of ['/numerologie', '/ro/numerologie/', '/ru/numerologie?go=1']) assert.equal(birthInputSurface(new URL(`https://numerolog.life${path}`)), 'numerologie')
  for (const path of ['/ru/admin/experiments', '/api/test', '/ru/numerologie/cristalul-raport/token', '/ru/contact']) assert.equal(birthInputSurface(new URL(`https://numerolog.life${path}`)), null)
})

test('signed cookie rejects manipulation, future dates, wrong secrets and expiration', async () => {
  const { assignment } = await resolveBirthInputAssignment(context)
  assert.ok(assignment)
  const signed = await signBirthInputAssignment(assignment, secret, now)
  assert.deepEqual(await readBirthInputAssignment(signed, secret, now + 1000), assignment)
  assert.equal(await readBirthInputAssignment(signed, `${secret}-wrong`, now), null)
  assert.equal(await readBirthInputAssignment(`${signed}a`, secret, now), null)
  assert.equal(await readBirthInputAssignment(`${signed}.extra`, secret, now), null)
  assert.equal(await readBirthInputAssignment(signed, secret, now - 1), null)
  assert.equal(await readBirthInputAssignment(signed, secret, now + BIRTH_INPUT_TTL_MS), null)
  const [payload, signature] = signed.split('.')
  const forged = JSON.parse(atob(payload)); forged.arm = assignment.arm === 'A' ? 'B' : 'A'
  assert.equal(await readBirthInputAssignment(`${btoa(JSON.stringify(forged))}.${signature}`, secret, now), null)
  await assert.rejects(signBirthInputAssignment(assignment, '', now))
  assert.equal(await readBirthInputAssignment(signed, '', now), null)
})

test('separate visitors have separate enrollments, with no birth date or identity in attribution', async () => {
  const first = (await resolveBirthInputAssignment(context)).assignment!
  const second = (await resolveBirthInputAssignment({ ...context, visitorId: 'b'.repeat(32), previous: first })).assignment!
  assert.notEqual(first.enrollmentId, second.enrollmentId)
  assert.notEqual(first.visitorId, second.visitorId)
  assert.deepEqual(Object.keys(first).sort(), ['experiment', 'visitorId', 'enrollmentId', 'arm', 'firstSurface', 'assignedAt'].sort())
})
