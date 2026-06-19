// Compares src/upfirdn against scipy golden vectors (test/golden.json from scripts/golden.py).
import { readFileSync } from "node:fs";
import { upfirdn } from "../src/upfirdn.ts";

const cases = JSON.parse(readFileSync(new URL("./golden.json", import.meta.url)));
let maxErr = 0;
for (const c of cases) {
  const y = upfirdn(c.h, c.x, c.up, c.down);
  if (y.length !== c.y.length) throw new Error(`length mismatch ${y.length} vs ${c.y.length}`);
  for (let i = 0; i < y.length; i++) maxErr = Math.max(maxErr, Math.abs(y[i] - c.y[i]));
}
console.log(`cases: ${cases.length}  max abs error vs scipy: ${maxErr.toExponential(3)}`);
if (maxErr > 1e-12) { console.error("FAIL: error above 1e-12"); process.exit(1); }
console.log("PASS");
