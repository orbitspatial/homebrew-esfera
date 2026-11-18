import { test } from "node:test";
import assert from "node:assert/strict";
import { formulaVersion, installableVersion, renderFormula } from "./bump.mjs";

test("renders the tarball URL, sha256, licence and npm install", () => {
  const rb = renderFormula({ version: "1.2.3", sha256: "a".repeat(64) });
  assert.match(rb, /url "https:\/\/registry\.npmjs\.org\/@esfera\/cli\/-\/cli-1\.2\.3\.tgz"/);
  assert.match(rb, new RegExp(`sha256 "${"a".repeat(64)}"`));
  assert.match(rb, /license "Apache-2\.0"/);
  assert.match(rb, /depends_on "node"/);
  assert.match(rb, /system "npm", "install", \*std_npm_args/);
  assert.equal(formulaVersion(rb), "1.2.3");
});

test("refuses a bad version or hash", () => {
  assert.throws(() => renderFormula({ version: "latest", sha256: "a".repeat(64) }));
  assert.throws(() => renderFormula({ version: "1.2.3", sha256: "nothex" }));
});

test("waits until the latest release is over a day old", () => {
  const now = Date.parse("2026-11-19T12:00:00Z");
  const pk = (t) => ({ "dist-tags": { latest: "0.3.1" }, time: { "0.3.1": t } });
  assert.equal(installableVersion(pk("2026-11-19T00:00:00Z"), now), null);
  assert.equal(installableVersion(pk("2026-11-18T10:00:00Z"), now), "0.3.1");
  assert.equal(installableVersion({}, now), null);
});
