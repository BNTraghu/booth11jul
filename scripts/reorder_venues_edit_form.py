#!/usr/bin/env python3
"""Reorder Edit Venue modal: Additional → Facilities → Bank → Photos/Docs → Extended. Drops duplicate Status block."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
path = ROOT / "src/pages/Venues.tsx"
lines = path.read_text().splitlines(keepends=True)

# 0-based slice indices (verified against Venues.tsx structure)
before = lines[:1792]
fac = lines[1792:1829]
ext = lines[1829:2039]
add = lines[2041:2153]
bank = lines[2153:2190]
photos = lines[2190:2378]
tail = lines[2396:]

new_lines = before + add + fac + bank + photos + ext + tail
path.write_text("".join(new_lines))
print("OK: reordered edit modal sections.")
