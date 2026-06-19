"""Reference check: compare this repo's upfirdn against scipy.signal.upfirdn.
Run:  python scripts/golden.py  (requires numpy, scipy)
Writes test/golden.json consumed by `npm run verify`."""
import json, numpy as np
from scipy.signal import upfirdn

rng = np.random.default_rng(42)
cases = []
for (up, down) in [(3, 2), (5, 3), (2, 1), (300, 500), (1, 4)]:
    x = rng.standard_normal(64).round(6)
    h = rng.standard_normal(2 * 8 * max(up, down) + 1).round(6)  # arbitrary fixed kernel
    y = upfirdn(h, x, up, down)
    cases.append({"up": up, "down": down, "x": x.tolist(), "h": h.tolist(), "y": y.tolist()})

with open("test/golden.json", "w") as f:
    json.dump(cases, f)
print(f"wrote {len(cases)} golden cases")
