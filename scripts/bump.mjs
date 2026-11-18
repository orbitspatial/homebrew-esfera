#!/usr/bin/env node
// Brings Formula/esfera.rb up to the latest published @esfera/cli.
//   node scripts/bump.mjs            check npm, rewrite the formula if newer
//   node scripts/bump.mjs 0.3.1      render a specific version
// Writes changed=true|false and version=<v> to $GITHUB_OUTPUT when set.
import { createHash } from "node:crypto";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FORMULA = join(root, "Formula", "esfera.rb");
const TEMPLATE = join(root, "scripts", "esfera.rb.tmpl");
const VERSION_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

export const tarballUrl = (v) => `https://registry.npmjs.org/@esfera/cli/-/cli-${v}.tgz`;

export function renderFormula({ version, sha256 }, template = readFileSync(TEMPLATE, "utf8")) {
  if (!VERSION_RE.test(version)) throw new Error(`not a version: ${version}`);
  if (!/^[0-9a-f]{64}$/.test(sha256)) throw new Error(`not a sha256: ${sha256}`);
  return template.replaceAll("{{version}}", version).replaceAll("{{sha256}}", sha256);
}

export function formulaVersion(rb) {
  return rb.match(/cli-(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)\.tgz/)?.[1] ?? null;
}

// Homebrew installs npm formulae with --min-release-age 1: a dependency published
// less than a day ago cannot be installed. @esfera/sdk is released just before the
// CLI, so a CLI version is only safe to point at once it is over a day old.
export const MIN_AGE_MS = 25 * 60 * 60 * 1000;

export function installableVersion(packument, now = Date.now()) {
  const latest = packument["dist-tags"]?.latest;
  const published = Date.parse(packument.time?.[latest] ?? "");
  if (!latest || Number.isNaN(published)) return null;
  return now - published >= MIN_AGE_MS ? latest : null;
}

async function latestVersion() {
  const res = await fetch("https://registry.npmjs.org/@esfera/cli", { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status} reading @esfera/cli`);
  return installableVersion(await res.json());
}

// npm can list a version minutes before its tarball downloads; wait for it.
async function sha256Of(url) {
  for (let i = 0; i < 40; i++) {
    const res = await fetch(url);
    if (res.ok) return createHash("sha256").update(Buffer.from(await res.arrayBuffer())).digest("hex");
    if (res.status !== 404) throw new Error(`HTTP ${res.status} fetching ${url}`);
    await new Promise((r) => setTimeout(r, 15_000));
  }
  throw new Error(`${url} still missing after 10 minutes`);
}

function output(changed, version) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\nversion=${version}\n`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const wanted = process.argv[2] ?? (await latestVersion());
  let current = null;
  try { current = formulaVersion(readFileSync(FORMULA, "utf8")); } catch {}
  if (!wanted) { console.log("The latest @esfera/cli is under a day old; waiting"); output(false, current ?? ""); }
  else if (current === wanted) { console.log(`Formula already at ${wanted}`); output(false, wanted); }
  else {
    writeFileSync(FORMULA, renderFormula({ version: wanted, sha256: await sha256Of(tarballUrl(wanted)) }));
    console.log(`Formula ${current ?? "(none)"} -> ${wanted}`);
    output(true, wanted);
  }
}
