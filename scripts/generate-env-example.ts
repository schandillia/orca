import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

const ROOT = process.cwd()
const SOURCES = [".env", ".env.local"].map((f) => join(ROOT, f))
const OUTPUT = join(ROOT, ".env.example")

const found = SOURCES.filter(existsSync)

if (found.length === 0) {
  console.error("✗ Neither .env nor .env.local found. Nothing to do.")
  process.exit(1)
}

found.forEach((f) => {
  console.log(`↳  Reading ${relative(ROOT, f)}`)
})

// Keeping comments and blank lines as their own block type (instead of just
// dropping them) is what lets the output preserve the original file's
// section headers and spacing, rather than collapsing into one flat list
// of keys with no structure.
type Block =
  | { type: "structural"; content: string }
  | { type: "entry"; key: string }

function buildBlocks(content: string): Block[] {
  return content.split("\n").map((line) => {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) {
      return { type: "structural", content: line }
    }
    const eqIndex = line.indexOf("=")
    if (eqIndex !== -1) {
      return { type: "entry", key: line.slice(0, eqIndex).trim() }
    }
    // No "=" on a non-comment, non-blank line means we can't treat it as
    // a key — pass it through unchanged rather than guessing.
    return { type: "structural", content: line }
  })
}

// .env takes priority over .env.local when both exist and define the same
// key — .env.local entries only get merged in where .env hasn't already
// claimed that key.
const [primaryPath, ...rest] = found
const primaryContent = readFileSync(primaryPath, "utf-8")
const primaryBlocks = buildBlocks(primaryContent)

const primaryKeys = new Set(
  primaryBlocks.flatMap((b) => (b.type === "entry" ? [b.key] : [])),
)

const additionalBlocks: Block[] = []

for (const sourcePath of rest) {
  const content = readFileSync(sourcePath, "utf-8")
  const filename = relative(ROOT, sourcePath)
  let addedCount = 0

  const blocks = buildBlocks(content)
  for (const block of blocks) {
    if (block.type === "entry" && !primaryKeys.has(block.key)) {
      if (addedCount === 0) {
        // Only stamp this header the first time a given source file
        // actually contributes a new key — a source that adds nothing
        // shouldn't leave an empty, unexplained section behind.
        additionalBlocks.push({ type: "structural", content: "" })
        additionalBlocks.push({
          type: "structural",
          content: `# From ${filename}`,
        })
      }
      primaryKeys.add(block.key)
      additionalBlocks.push(block)
      addedCount++
    }
  }
}

const allBlocks = [...primaryBlocks, ...additionalBlocks]

// Values are intentionally stripped here — .env.example exists to document
// which keys a deployment needs, not to leak whatever real secrets happen
// to be sitting in a developer's local .env files.
const rendered = allBlocks
  .map((block) => {
    if (block.type === "structural") return block.content
    return `${block.key}=`
  })
  .join("\n")

if (existsSync(OUTPUT)) {
  unlinkSync(OUTPUT)
  console.log("↺  Existing .env.example removed.")
}

writeFileSync(OUTPUT, rendered, "utf-8")
console.log(`✓  .env.example generated from ${found.length} file(s).`)
