import test from 'node:test'
import assert from 'node:assert/strict'
import { campaignFromUrl, captureSocialTouch, readSocialAttribution, signSocialAttribution, safePublicPath, trackingExcluded, SOCIAL_TTL } from './social-attribution'
import { selectSocialFunnel, SOCIAL_FUNNELS, validateSocialSettings } from './social-funnels'
import { minorToMajor } from './money'

const visitor = 'a'.repeat(32)
const now = Date.now()
const url = (content = 'reel_a') => new URL(`https://numerolog.life/ru?utm_source=instagram&utm_medium=social&utm_campaign=september&utm_content=${content}`)

test('first source is retained while a different post becomes the last source', () => {
  const first = captureSocialTouch(null, url(), visitor, 'https://instagram.com/profile?private=value', now)!
  const second = captureSocialTouch(first, url('reel_b'), visitor, null, now + 1000)!
  assert.equal(first.first.content, 'reel_a')
  assert.equal(first.last.referrer, 'https://instagram.com')
  assert.deepEqual(second.first, first.first)
  assert.equal(second.last.content, 'reel_b')
  assert.notEqual(second.last.id, first.last.id)
  assert.equal(first.last.content, 'reel_a')
})
test('direct visits, internal navigation and language changes do not refresh the attribution window', () => {
  const first = captureSocialTouch(null, url(), visitor, null, now)!
  for (const path of ['/ru', '/ru/numerologie', '/ro', '/ro/numerologie', '/ru/despre']) {
    assert.equal(captureSocialTouch(first, new URL(`https://numerolog.life${path}`), visitor, null, now + 1000), first)
  }
  assert.equal(captureSocialTouch(first, url(), visitor, null, now + 1000), first)
})
test('cookies reject tampering and expire at 30 days', async () => {
  const attribution = captureSocialTouch(null, url(), visitor, null, now)!
  const signed = await signSocialAttribution(attribution)
  assert.deepEqual(await readSocialAttribution(signed, now + 1000), attribution)
  assert.equal(await readSocialAttribution(signed, now + SOCIAL_TTL), null)
  assert.equal(await readSocialAttribution(`${signed}x`, now), null)
  assert.equal(await readSocialAttribution(null), null)
  assert.equal(await readSocialAttribution('invalid.cookie'), null)
})
test('invalid campaign codes and personal data are rejected', () => {
  assert.equal(campaignFromUrl(url('name%40example.com')), null)
  assert.equal(campaignFromUrl(url('a'.repeat(81))), null)
  assert.equal(campaignFromUrl(new URL('https://numerolog.life/ru?utm_source=instagram')), null)
  assert.equal(safePublicPath('/ru/admin/experiments'), null)
  assert.equal(safePublicPath('/api/geo'), null)
  assert.equal(safePublicPath('/ru/name@example.com'), null)
  assert.equal(safePublicPath('/ru/numerologie/cristalul-raport/secret?email=name@example.com'), '/ru/numerologie/cristalul-raport/:report')
  assert.equal(safePublicPath('/ru/grani/raport/secret'), '/ru/grani/raport/:report')
})
test('privacy signals and design inspections are excluded, test traffic remains marked', () => {
  assert.equal(trackingExcluded(new URL('https://numerolog.life/ru?fv=example')), true)
  assert.equal(trackingExcluded(url(), new Headers({ dnt: '1' })), true)
  assert.equal(trackingExcluded(url(), new Headers({ 'sec-gpc': '1' })), true)
  const marked = url(); marked.searchParams.set('analytics_test', '1')
  const first = captureSocialTouch(null, marked, visitor, null, now)!
  assert.equal(first.test, true)
  assert.equal(captureSocialTouch(first, url('reel_b'), visitor, null, now + 1000)!.test, true)
})
test('026 is the fallback without activating any general experiment', () => {
  const before = JSON.stringify(SOCIAL_FUNNELS)
  assert.equal(selectSocialFunnel(visitor, []).key, 'standard-grani-v1')
  assert.equal(validateSocialSettings([{ key: 'standard-grani-v1', active: false, percentage: 0 }]), true)
  assert.equal(validateSocialSettings([{ key: 'standard-grani-v1', active: true, percentage: 100 }]), true)
  assert.equal(validateSocialSettings([{ key: 'standard-grani-v1', active: true, percentage: 80 }]), false)
  assert.equal(validateSocialSettings([{ key: 'standard-grani-v1', active: false, percentage: 100 }]), false)
  assert.equal(validateSocialSettings([{ key: 'unknown', active: true, percentage: 100 }]), false)
  assert.equal(JSON.stringify(SOCIAL_FUNNELS), before)
})
test('revenue converts minor units independently per currency', () => {
  assert.equal(minorToMajor(1499, 'eur'), 14.99)
  assert.equal(minorToMajor(1000, 'jpy'), 1000)
  assert.equal(minorToMajor(2900, 'byn'), 29)
})
