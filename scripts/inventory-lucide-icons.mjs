import fs from "fs";
import path from "path";

/**
 * Recursively collect all files matching the given extensions under a directory.
 */
function collectFiles(dir, exts, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, exts, results);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Extract named lucide-react imports from a source string.
 *
 * Handles:
 *   import { X, Calendar } from "lucide-react";
 *   import { Calendar as CalendarIcon } from 'lucide-react';
 *   Multi-line import blocks.
 *
 * Returns an array of { imported, local } objects.
 */
function extractLucideImports(source) {
  const results = [];

  // Match the full import statement for lucide-react (handles multi-line)
  const importPattern =
    /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/gs;

  for (const match of source.matchAll(importPattern)) {
    const specifiers = match[1];
    // Split on commas, then parse each specifier
    for (const raw of specifiers.split(",")) {
      const trimmed = raw.trim();
      if (!trimmed) continue;

      // Handle "Foo as Bar" alias — use word boundary to handle any whitespace around "as"
      const asParts = trimmed.split(/\s+as\b/);
      const imported = asParts[0].trim();
      const local = asParts.length > 1 ? asParts[1].trim() : imported;

      if (imported) {
        results.push({ imported, local });
      }
    }
  }

  return results;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function run() {
  const srcDir = path.resolve("src");
  const exts = [".js", ".jsx", ".ts", ".tsx"];

  const files = collectFiles(srcDir, exts);

  /** @type {Record<string, Array<{ imported: string; local: string }>>} */
  const byFile = {};
  /** @type {Set<string>} */
  const localNames = new Set();

  for (const file of files) {
    const source = fs.readFileSync(file, "utf-8");
    const imports = extractLucideImports(source);
    if (imports.length === 0) continue;

    const relPath = path.relative(process.cwd(), file).replace(/\\/g, "/");
    byFile[relPath] = imports;
    for (const { local } of imports) {
      localNames.add(local);
    }
  }

  ensureDir("reports");

  const sortedLocalNames = Array.from(localNames).sort((a, b) =>
    a.localeCompare(b)
  );

  fs.writeFileSync(
    path.join("reports", "lucide-icons.json"),
    JSON.stringify(sortedLocalNames, null, 2) + "\n",
    "utf-8"
  );

  const byFileSorted = Object.fromEntries(
    Object.keys(byFile)
      .sort((a, b) => a.localeCompare(b))
      .map((k) => [k, byFile[k]])
  );

  fs.writeFileSync(
    path.join("reports", "lucide-icons-by-file.json"),
    JSON.stringify(byFileSorted, null, 2) + "\n",
    "utf-8"
  );

  console.log(
    `Lucide inventory complete — icons: ${sortedLocalNames.length}, files: ${Object.keys(byFileSorted).length}`
  );
  console.log(
    `Reports written to: reports/lucide-icons.json, reports/lucide-icons-by-file.json`
  );
}

try {
  run();
} catch (err) {
  console.error("Failed to generate Lucide inventory:", err);
  process.exitCode = 1;
}