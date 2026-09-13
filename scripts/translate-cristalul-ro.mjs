import { readFile, writeFile } from 'node:fs/promises'
import { gzipSync, gunzipSync } from 'node:zlib'
import { generateText, Output } from 'ai'
import { z } from 'zod'

const SOURCE_PATH = 'public/cristalul-versions/cristalul-destinului-v3-entry-upload.html'
const UI_SOURCE_PATH = 'scripts/cristalul-ui-ru-strings.json'
const CACHE_PATH = 'scripts/cristalul-ro-translation-cache.json'
const DB_BLOB_PATH = 'scripts/cristalul-data-blob-ro.txt'
const UI_MAP_PATH = 'scripts/cristalul-ui-ro-translations.json'
const MODEL = 'anthropic/claude-sonnet-5'
const TRANSLATION_ENDPOINT = process.env.CRYSTAL_TRANSLATION_ENDPOINT
const CYRILLIC = /[А-Яа-яЁё]/
const MAX_BATCH_CHARS = 18_000
const CONCURRENCY = 3

function extractDatabase(html) {
  const match = html.match(/<script id="data-blob" type="text\/plain">([\s\S]*?)<\/script>/)
  if (!match) throw new Error('Nu am găsit data-blob în sursa Cristalului.')
  return JSON.parse(gunzipSync(Buffer.from(match[1].trim(), 'base64')).toString('utf8'))
}

function collectRussianValues(value, output = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectRussianValues(item, output)
  } else if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectRussianValues(item, output)
  } else if (typeof value === 'string' && CYRILLIC.test(value)) {
    output.push(value)
  }
  return output
}

function translateDatabase(value, translations) {
  if (Array.isArray(value)) return value.map((item) => translateDatabase(item, translations))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, translateDatabase(item, translations)]),
    )
  }
  if (typeof value === 'string' && CYRILLIC.test(value)) return translations[value] ?? value
  return value
}

function normalizeUiText(text) {
  let index = 0
  return text
    .replace(/Andrei/g, () => `{{${index++}}}`)
    .replace(/\d+(?:[.,]\d+)?/g, () => `{{${index++}}}`)
}

function createBatches(strings) {
  const batches = []
  let current = []
  let chars = 0
  for (const source of strings) {
    if (current.length && chars + source.length > MAX_BATCH_CHARS) {
      batches.push(current)
      current = []
      chars = 0
    }
    current.push(source)
    chars += source.length
  }
  if (current.length) batches.push(current)
  return batches
}

async function translateBatch(sources, batchIndex, totalBatches) {
  const entries = sources.map((source, id) => ({ id, source }))
  const schema = z.object({
    translations: z.array(
      z.object({
        id: z.number().int().min(0).max(entries.length - 1),
        text: z.string(),
      }),
    ).length(entries.length),
  })

  console.log(`[translate-ro] Lot ${batchIndex + 1}/${totalBatches}: ${entries.length} texte`)
  let output

  if (TRANSLATION_ENDPOINT) {
    const response = await fetch(TRANSLATION_ENDPOINT, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.NEWSLETTER_ADMIN_PASSWORD}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ entries }),
    })
    if (!response.ok) {
      throw new Error(`Endpoint Claude: ${response.status} ${await response.text()}`)
    }
    output = await response.json()
  } else {
    const result = await generateText({
      model: MODEL,
      output: Output.object({ schema }),
      system: `Ești un traducător literar român și redactor expert în numerologie. Tradu fiecare text din rusă în română nativă, elegantă și clară, cu diacritice corecte (ă, â, î, ș, ț).

Reguli absolute:
- Păstrează exact sensul, intensitatea, persoana gramaticală și structura fiecărui text.
- Nu rezuma, nu elimina și nu adăuga idei.
- Păstrează intacte tagurile HTML, atributele, marcajele, secvențele de formatare și tokenurile de forma {{0}}, {{1}}.
- Nu afișa surse, autori sau disclaimere.
- Folosește terminologia numerologică firească în limba română: Arcană, Cristalul Destinului, linie ancestrală, destin, karmă.
- Pentru adresarea directă folosește un ton cald, premium, la persoana a doua singular.
- Returnează toate elementele, cu același id.`,
      prompt: JSON.stringify({ entries }),
      maxOutputTokens: 24_000,
      temperature: 0.15,
    })
    output = result.output
  }

  if (!output || output.translations.length !== entries.length) {
    throw new Error(`Lotul ${batchIndex + 1} nu conține toate traducerile.`)
  }

  const byId = new Map(output.translations.map((item) => [item.id, item.text]))
  return entries.map(({ id, source }) => [source, byId.get(id)])
}

async function main() {
  const html = await readFile(SOURCE_PATH, 'utf8')
  const database = extractDatabase(html)
  const uiTexts = JSON.parse(await readFile(UI_SOURCE_PATH, 'utf8'))
  const normalizedUiTexts = uiTexts.map(normalizeUiText)
  const sourceStrings = [
    ...new Set([
      ...collectRussianValues(database),
      ...normalizedUiTexts.filter((text) => CYRILLIC.test(text)),
    ]),
  ]

  let cache = {}
  try {
    cache = JSON.parse(await readFile(CACHE_PATH, 'utf8'))
  } catch {}

  const pending = sourceStrings.filter((source) => !cache[source])
  const batches = createBatches(pending)
  console.log(`[translate-ro] ${sourceStrings.length} texte totale; ${pending.length} de tradus; ${batches.length} loturi.`)

  for (let cursor = 0; cursor < batches.length; cursor += CONCURRENCY) {
    const group = batches.slice(cursor, cursor + CONCURRENCY)
    const results = await Promise.all(
      group.map((batch, offset) => translateBatch(batch, cursor + offset, batches.length)),
    )
    for (const result of results) {
      for (const [source, translated] of result) cache[source] = translated
    }
    await writeFile(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`)
  }

  const missing = sourceStrings.filter((source) => !cache[source])
  if (missing.length) throw new Error(`Lipsesc ${missing.length} traduceri.`)

  const translatedDatabase = translateDatabase(database, cache)
  const translatedJson = JSON.stringify(translatedDatabase)
  const remainingDbCyrillic = (translatedJson.match(/[А-Яа-яЁё]/g) ?? []).length
  if (remainingDbCyrillic) {
    throw new Error(`Baza română mai conține ${remainingDbCyrillic} caractere chirilice.`)
  }

  const blob = gzipSync(Buffer.from(translatedJson), { level: 9 }).toString('base64')
  await writeFile(DB_BLOB_PATH, `${blob}\n`)

  const uiMap = Object.fromEntries(
    [...new Set(normalizedUiTexts)]
      .filter((source) => CYRILLIC.test(source))
      .map((source) => [source, cache[source]]),
  )
  await writeFile(UI_MAP_PATH, `${JSON.stringify(uiMap, null, 2)}\n`)

  console.log(`[translate-ro] Gata: ${Object.keys(cache).length} traduceri, blob ${blob.length} caractere, ${Object.keys(uiMap).length} reguli UI.`)
}

main().catch((error) => {
  console.error('[translate-ro]', error)
  process.exitCode = 1
})
