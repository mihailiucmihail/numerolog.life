import { NextRequest, NextResponse } from 'next/server'
import { and, eq, gte, count } from 'drizzle-orm'
import { socialDb } from '@/lib/experiments/social-db'
import { socialEvents } from '@/lib/experiments/social-schema'
import { captureSocialTouch, readSocialAttribution, signSocialAttribution, safePublicPath, SOCIAL_COOKIE, SOCIAL_TTL, UUID, trackingExcluded } from '@/lib/experiments/social-attribution'
import { persistSocialTouch } from '@/lib/experiments/social-server'
import { EXPERIMENT_COOKIE, readAssignment } from '@/lib/experiments/assignment'

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin || request.headers.get('sec-fetch-site') === 'cross-site') return new NextResponse(null, { status: 403 })
  if (Number(request.headers.get('content-length') || 0) > 4000) return new NextResponse(null, { status: 413 })
  try {
    const raw = await request.text()
    if (raw.length > 4000) return new NextResponse(null, { status: 413 })
    const body = JSON.parse(raw)
    if (!UUID.test(body.id || '') || typeof body.url !== 'string') return new NextResponse(null, { status: 400 })
    const url = new URL(body.url, request.nextUrl.origin)
    if (url.origin !== request.nextUrl.origin || trackingExcluded(url, request.headers) || /bot|crawler|spider|preview/i.test(request.headers.get('user-agent') || '')) return new NextResponse(null, { status: 204 })
    const path = safePublicPath(url.pathname)
    if (!path) return new NextResponse(null, { status: 204 })
    const previous = await readSocialAttribution(request.cookies.get(SOCIAL_COOKIE)?.value)
    const assignment = await readAssignment(request.cookies.get(EXPERIMENT_COOKIE)?.value)
    const a = captureSocialTouch(previous, url, previous?.visitorId || assignment?.visitorId || crypto.randomUUID().replaceAll('-', ''), request.headers.get('referer'))
    if (!a) return new NextResponse(null, { status: 204 })
    const [recent] = await socialDb.select({ n: count() }).from(socialEvents).where(and(eq(socialEvents.visitorId, a.visitorId), eq(socialEvents.event, 'page_view'), gte(socialEvents.createdAt, new Date(Date.now() - 60000))))
    if (recent.n >= 60) return new NextResponse(null, { status: 429 })
    await persistSocialTouch(a)
    await socialDb.insert(socialEvents).values({ touchId: a.last.id, visitorId: a.visitorId, event: 'page_view', path, previousPath: safePublicPath(body.previous), dedupKey: `${a.visitorId}|page|${body.id}` }).onConflictDoNothing()
    const response = new NextResponse(null, { status: 204 })
    if (a !== previous) response.cookies.set(SOCIAL_COOKIE, await signSocialAttribution(a), { path: '/', maxAge: Math.floor(SOCIAL_TTL / 1000), httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })
    return response
  } catch (error) { console.error('[social] page event unavailable', error); return new NextResponse(null, { status: 204 }) }
}
