import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const projectRoot = process.cwd()
const activePath = path.join(projectRoot, "public", "grani-live.html")
const archiveDir = path.join(projectRoot, "public", "grani-versions")
const sourcePath = process.argv[2]

if (!sourcePath) {
  console.error("Utilizare: node scripts/update-grani.mjs <cale-către-noul-raport.html>")
  process.exit(1)
}

await mkdir(archiveDir, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, "-")
await copyFile(activePath, path.join(archiveDir, `grani-live-${stamp}.html`))

let html = await readFile(sourcePath, "utf8")
html = html
  .replace(/color-scheme:\s*dark\s+only\s*;/g, "color-scheme: normal;")
  .replace(/background:\s*radial-gradient[\s\S]*?var\(--ink\);/g, "background: transparent !important;")
  .replace(/\.facets\{display:grid;grid-template-columns:1fr;gap:16px;\}\s*@media \(min-width:620px\)\{\.facets\{grid-template-columns:1fr 1fr;\}\}/g, ".facets{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;}")

await writeFile(activePath, html, "utf8")
console.log(`Raport actualizat și versiunea anterioară arhivată: ${path.basename(activePath)}`)

if (html.includes("�")) {
  console.error("Atenție: raportul conține caractere Unicode corupte (�).")
  process.exitCode = 1
}
