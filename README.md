# polyphase-resample
n![CI](https://github.com/maxeq/polyphase-resample/actions/workflows/ci.yml/badge.svg) ![license](https://img.shields.io/badge/license-MIT-blue.svg)

Bit-exact, cross-platform **polyphase rational resampling** (`upfirdn`) for signal & on-device-ML preprocessing.

Resample a 1-D signal by a rational factor `L/M` — upsample by `L`, FIR-filter, downsample by `M` — with output that is **identical down to float64 on every runtime** (TypeScript, Python, Kotlin, Swift) given the same kernel, and that matches `scipy.signal.upfirdn` to float64 precision.

## Why this exists — the multi-port problem

On-device ML breaks *silently* when preprocessing differs between platforms. A model trained on signals resampled in Python (say **500 Hz → 300 Hz**) but run on a watch / phone / desktop that resamples even slightly differently sees a shifted input distribution — and accuracy quietly drops. Floating-point drift between a NumPy/SciPy training pipeline and a hand-written mobile resampler is a classic, painful source of **train/serve skew**.

The fix: implement the resampler **once**, with a single explicit accumulation order, so the same `(kernel, x, up, down)` yields the **same samples on every platform and on the training pipeline** — no drift, no skew. Watch (Kotlin), iOS (Swift), and desktop/browser (TypeScript) all agree with NumPy/SciPy.

## Usage
```ts
import { upfirdn, resamplePoly } from "./src/upfirdn";

// Resample 500 Hz -> 300 Hz  (gcd(500,300)=100 -> up=3, down=5)
const out = resamplePoly(signal, 3, 5, firKernel); // firKernel = your shared FIR taps
```
`upfirdn(h, x, up, down)` has the same semantics as `scipy.signal.upfirdn`.

## Determinism & verification
- **Cross-platform:** one fixed accumulation order → bit-identical float64 output on any IEEE-754 runtime.
- **Vs SciPy:** `scripts/golden.py` runs `scipy.signal.upfirdn` on random inputs and writes golden vectors; `npm run verify` checks **max abs error < 1e-12**.

```bash
python scripts/golden.py   # needs numpy + scipy
npm run verify             # compares TS output against the golden vectors
```

> Note on "bit-exact": within this implementation the output is exact and identical across platforms (fixed op order). Against SciPy the agreement is to ~1e-12 — SciPy's internal polyphase accumulation order differs; the algorithm and result are otherwise the same. Share the FIR kernel across platforms (as JSON) and every port produces the same numbers.

## Why FIR kernel is caller-provided
So the resampler is fully deterministic: ship one kernel (e.g. a Kaiser-windowed sinc) as data across all platforms instead of re-designing the filter per language. Same data + same algorithm = same output everywhere.

## License
MIT
