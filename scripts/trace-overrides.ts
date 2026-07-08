import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const packageJsonPath = join(root, "package.json")

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
  overrides?: Record<string, string>
  "overrides-rationale"?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

const overrides = Object.keys(packageJson.overrides ?? {})

if (overrides.length === 0) {
  console.log("No overrides found in package.json.")
  process.exit(0)
}

const directDeps = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
])

// Collect every installed package name, including scoped ones (@org/pkg)
function getAllInstalledPackages(): string[] {
  const nmDir = join(root, "node_modules")
  const names: string[] = []

  for (const entry of readdirSync(nmDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) continue

    if (entry.name.startsWith("@")) {
      const scopeDir = join(nmDir, entry.name)
      for (const scoped of readdirSync(scopeDir, { withFileTypes: true })) {
        if (scoped.isDirectory()) {
          names.push(`${entry.name}/${scoped.name}`)
        }
      }
    } else {
      names.push(entry.name)
    }
  }

  return names
}

// Forward dep map: pkg → its immediate production dependencies only.
// devDependencies listed inside node_modules packages are never actually
// installed by bun/npm for transitive packages — including them creates
// false edges that make everything appear to depend on everything.
const forwardDeps = new Map<string, Set<string>>()

for (const name of getAllInstalledPackages()) {
  try {
    const raw = JSON.parse(
      readFileSync(join(root, "node_modules", name, "package.json"), "utf-8"),
    ) as {
      dependencies?: Record<string, string>
      peerDependencies?: Record<string, string>
    }
    forwardDeps.set(
      name,
      new Set([
        ...Object.keys(raw.dependencies ?? {}),
        ...Object.keys(raw.peerDependencies ?? {}),
      ]),
    )
  } catch {
    forwardDeps.set(name, new Set())
  }
}

// Compute everything a package depends on, recursively, using production
// deps only. Cached so each package is only walked once.
const closureCache = new Map<string, Set<string>>()

function getTransitiveClosure(pkg: string): Set<string> {
  const cached = closureCache.get(pkg)
  if (cached) return cached

  const closure = new Set<string>()
  const visited = new Set<string>([pkg])
  const queue: string[] = [pkg]

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current) break
    for (const dep of forwardDeps.get(current) ?? []) {
      if (!visited.has(dep)) {
        visited.add(dep)
        closure.add(dep)
        queue.push(dep)
      }
    }
  }

  closureCache.set(pkg, closure)
  return closure
}

const updatedRationale: Record<string, string> = {}

for (const pkg of overrides) {
  console.log(`\n=== ${pkg} ===`)

  const pkgJsonPath = join(root, "node_modules", pkg, "package.json")

  if (!existsSync(pkgJsonPath)) {
    console.log("  (not installed — override may be orphaned)")
    updatedRationale[pkg] = "⚠️ not installed — consider removing this override"
    continue
  }

  const { version } = JSON.parse(readFileSync(pkgJsonPath, "utf-8")) as {
    version: string
  }
  console.log(`  installed: ${version}`)

  // Every one of your direct deps whose production transitive tree contains pkg
  const responsible = [...directDeps]
    .filter((dep) => getTransitiveClosure(dep).has(pkg))
    .sort()

  if (responsible.length === 0) {
    console.log("  ⚠️  no dependents found — override may be orphaned")
    updatedRationale[pkg] =
      "⚠️ no dependents found — consider removing this override"
  } else {
    console.log(`  watch: ${responsible.join(", ")}`)
    updatedRationale[pkg] = `watch: ${responsible.join(", ")}`
  }
}

packageJson["overrides-rationale"] = updatedRationale
writeFileSync(
  packageJsonPath,
  `${JSON.stringify(packageJson, null, 2)}\n`,
  "utf-8",
)
console.log("\n✔ overrides-rationale updated in package.json")
