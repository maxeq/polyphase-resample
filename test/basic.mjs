// Self-contained correctness tests (no scipy needed). Hand-verifiable upfirdn cases.
import { upfirdn } from "../src/upfirdn.ts";
const eq = (a, b, t = 1e-12) =>
  a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= t);
const cases = [
  { h: [1, 1],     x: [1, 2, 3], up: 1, down: 1, y: [1, 3, 5, 3] }, // convolution
  { h: [1],        x: [1, 2, 3], up: 2, down: 1, y: [1, 0, 2, 0, 3] }, // upsample x2
  { h: [0.5, 0.5], x: [1, 2, 3], up: 1, down: 2, y: [0.5, 2.5] },   // filter + decimate
];
let ok = true;
for (const c of cases) {
  const y = upfirdn(c.h, c.x, c.up, c.down);
  const pass = eq(y, c.y);
  ok &&= pass;
  console.log(`${pass ? "PASS" : "FAIL"} up=${c.up} down=${c.down} -> [${y.join(", ")}]`);
}
console.log(ok ? "ALL PASS" : "FAILED");
process.exit(ok ? 0 : 1);
