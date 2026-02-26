import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const TOP_N = parseInt(process.argv[2] ?? '30', 10)
const THRESHOLD = parseInt(process.argv[3] ?? '300', 10)
const ROOT = join(import.meta.dirname, '..', 'app')

function walkFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '.nuxt' || entry.name === 'node_modules') continue
      files.push(...walkFiles(full))
    } else if (entry.isFile() && /\.(vue|ts)$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

function countLines(filepath: string): number {
  const content = readFileSync(filepath, 'utf-8')
  return content.split('\n').length
}

const results = walkFiles(ROOT)
  .map((f) => ({ file: f.replace(ROOT + '/', 'app/'), lines: countLines(f) }))
  .sort((a, b) => b.lines - a.lines)
  .slice(0, TOP_N)

const flagged = results.filter((r) => r.lines >= THRESHOLD)
const rest = results.filter((r) => r.lines < THRESHOLD)

console.log(`\nTop ${TOP_N} files by line count  (threshold: ${THRESHOLD} lines)\n`)

if (flagged.length) {
  console.log(`  ⚠  Files over ${THRESHOLD} lines (${flagged.length}):`)
  for (const { file, lines } of flagged) {
    console.log(`     ${String(lines).padStart(5)}  ${file}`)
  }
  console.log()
}

console.log(`  Files under ${THRESHOLD} lines:`)
for (const { file, lines } of rest) {
  console.log(`     ${String(lines).padStart(5)}  ${file}`)
}
console.log()
