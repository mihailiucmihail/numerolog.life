#!/usr/bin/env node
// Gardian permanent împotriva caracterelor corupte (U+FFFD, semnul de întrebare în romb).
// Rulează automat înainte de `next build` (script "prebuild") și oprește build-ul
// dacă găsește U+FFFD sau separatoare box-drawing (===) care se corup la re-salvare.
// Utilizare manuală: node scripts/check-mojibake.mjs [--fix-separators]

import { execSync } from "node:child_process"
import { readFileSync, writeFileSync, readdirSync } from "node:fs"
import { join, relative } from "node:path"

const TEXT_EXT = /\.(tsx?|jsx?|mjs|cjs|json|css|scss|html|md|mdx|py|sql|txt|yml|yaml|svg)$/i
const IGNORE = [
  /^public\/(grani|cristalul)-versions\//, // arhive de upload-uri, nu se servesc
  /^data\//,
  /^node_modules\//,
  /^\.next\//,
  /^v0_/,
]

const REPLACEMENT = "\uFFFD"
const BOX_DRAWING = /[\u2500-\u257F]{3,}/g

// `vercel deploy` din CLI încarcă fișierele FĂRĂ directorul .git → `git ls-files` eșuează.
// În acest caz parcurgem sistemul de fișiere (aceleași reguli de excludere).
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".vercel", "data", "v0_memories", "v0_plans"])
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name), out)
    } else if (entry.isFile()) {
      out.push(relative(process.cwd(), join(dir, entry.name)))
    }
  }
  return out
}
function listFiles() {
  try {
    return execSync("git ls-files", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n")
  } catch {
    return walk(process.cwd())
  }
}

const files = listFiles().filter((f) => f && TEXT_EXT.test(f) && !IGNORE.some((re) => re.test(f)))

const fixSeparators = process.argv.includes("--fix-separators")
const problems = []

for (const file of files) {
  let text
  try {
    text = readFileSync(file, "utf8")
  } catch {
    continue
  }

  // În documentația Markdown tabelele box-drawing sunt legitime; în cod se corup la re-salvare.
  const checkSeparators = !/\.mdx?$/i.test(file)

  if (fixSeparators && checkSeparators && BOX_DRAWING.test(text)) {
    BOX_DRAWING.lastIndex = 0
    text = text.replace(BOX_DRAWING, (m) => "=".repeat(Math.min(m.length, 40)))
    writeFileSync(file, text)
  }
  BOX_DRAWING.lastIndex = 0
  const lines = text.split("\n")
  lines.forEach((line, i) => {
    if (line.includes(REPLACEMENT)) {
      problems.push(`${file}:${i + 1}: caracter corupt U+FFFD -> ${line.trim().slice(0, 90)}`)
    }
    if (checkSeparators && BOX_DRAWING.test(line)) {
      BOX_DRAWING.lastIndex = 0
      problems.push(`${file}:${i + 1}: separator box-drawing (se corupe la re-salvare) -> folosește ====`)
    }
    BOX_DRAWING.lastIndex = 0
  })
}

if (problems.length) {
  console.error(`\n[check-mojibake] ${problems.length} problemă(e) găsită(e):\n`)
  for (const p of problems) console.error("  " + p)
  console.error("\nRepară textul (scrie litera corectă) sau rulează: node scripts/check-mojibake.mjs --fix-separators\n")
  process.exit(1)
}

console.log(`[check-mojibake] OK - ${files.length} fișiere verificate, fără caractere corupte.`)
