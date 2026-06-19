/**
 * Polyphase rational resampling — upsample (L), FIR filter (h), downsample (M).
 * Semantics identical to scipy.signal.upfirdn(h, x, up, down).
 *
 * The accumulation order is fixed and explicit, so the same (h, x, up, down)
 * produces identical float64 output on any IEEE-754 runtime (JS / Python / JVM / Swift).
 */
export function upfirdn(h: number[], x: number[], up = 1, down = 1): number[] {
  if (up < 1 || down < 1) throw new Error("up and down must be >= 1");
  const upLen = (x.length - 1) * up + 1;       // length after zero-insertion
  const convLen = upLen + h.length - 1;        // length after FIR convolution
  const outLen = Math.ceil(convLen / down);    // length after decimation
  const out = new Array<number>(outLen).fill(0);

  for (let k = 0; k < outLen; k++) {
    const center = k * down;                   // index into the convolved signal
    const jStart = Math.max(0, center - (upLen - 1));
    const jEnd = Math.min(h.length - 1, center);
    let acc = 0;
    for (let j = jStart; j <= jEnd; j++) {
      const m = center - j;                     // index into the upsampled signal
      if (m % up === 0) acc += h[j] * x[m / up]; // non-zero only at multiples of `up`
    }
    out[k] = acc;
  }
  return out;
}

/** Rational resample by L/M using a caller-provided FIR kernel (so it stays deterministic). */
export function resamplePoly(x: number[], up: number, down: number, kernel: number[]): number[] {
  return upfirdn(kernel, x, up, down);
}
