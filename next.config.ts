import { assertExtractionRuntime } from "./src/lib/server/runtime.mjs";
import type { NextConfig } from "next";
import { createRequire, isBuiltin } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

assertExtractionRuntime();

// The native worker is intentionally outside Turbopack's worker runtime.
// Include its installed dependency closure so traced deployments keep nested
// dependencies and optional platform binaries, not just the four entry packages.
const parserFiles = new Set([
  "./src/lib/server/extract-worker.mjs",
  "./src/lib/server/runtime.mjs",
]);
function traceParser(name: string, from = process.cwd(), optional = false) {
  if (isBuiltin(name)) return;
  const require = createRequire(path.join(from, "package.json"));
  const directory = require.resolve
    .paths(name)
    ?.map((base) => path.join(base, name))
    .find((base) => existsSync(path.join(base, "package.json")));
  if (!directory) {
    if (optional) return;
    throw new Error(`Parser package missing: ${name}`);
  }
  const glob = `./${path.relative(process.cwd(), directory).split(path.sep).join("/")}/**`;
  if (parserFiles.has(glob)) return;
  parserFiles.add(glob);
  const pkg = JSON.parse(
    readFileSync(path.join(directory, "package.json"), "utf8"),
  );
  for (const dependency of Object.keys(pkg.dependencies ?? {}))
    traceParser(dependency, directory);
  for (const dependency of Object.keys(pkg.optionalDependencies ?? {}))
    traceParser(dependency, directory, true);
}

for (const name of ["pdfjs-dist", "mammoth", "yauzl", "fast-xml-parser"])
  traceParser(name);

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/api/extract": [...parserFiles] },
  serverExternalPackages: ["pdfjs-dist", "mammoth", "yauzl", "fast-xml-parser"],
  turbopack: { root: process.cwd() },
};
export default nextConfig;
