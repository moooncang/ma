#!/usr/bin/env python3
"""Generate full-composition responsive derivatives of existing site artwork.

Run: python3 _build/site-thumbnails.py
Requires Pillow with WebP support. Only images/thumbs is written.
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
from pathlib import Path
import string

from PIL import Image, features


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "images/thumbs"
QUALITY = 90
METHOD = 6


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def derivative(source, width, group, code):
    with Image.open(source) as original:
        source_size = original.size
        height = round(original.height * width / original.width)
        # A direct full-frame resize preserves every edge of the composition.
        # No ImageOps.fit, crop, cover, sharpening, or color manipulation.
        resized = original.resize((width, height), Image.Resampling.LANCZOS, reducing_gap=3.0)
        target = OUT / group / f"{code}-{width}.webp"
        target.parent.mkdir(parents=True, exist_ok=True)
        resized.save(target, format="WEBP", quality=QUALITY, method=METHOD)
    with Image.open(target) as check:
        if check.size != (width, height):
            raise RuntimeError(f"Unexpected derivative dimensions: {target}")
        check.load()
    return {
        "file": str(target.relative_to(ROOT)),
        "width": width,
        "height": height,
        "bytes": target.stat().st_size,
        "sha256": sha256(target),
        "source": str(source.relative_to(ROOT)),
        "source_width": source_size[0],
        "source_height": source_size[1],
        "source_sha256": sha256(source),
    }


def expression_mapping():
    """Read the existing expression labels without changing or duplicating them."""
    spec = importlib.util.spec_from_file_location("site_data", ROOT / "_build/data.py")
    data = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(data)
    expressions = data.표정
    if len(expressions) != 10 or len({number for number, _ in expressions}) != 10:
        raise RuntimeError("Expected ten distinct expressions from _build/data.py")
    joy = [number for number, label in expressions if label == "기쁨"]
    if len(joy) != 1:
        raise RuntimeError("Expected one 기쁨 expression for the active hero image")
    return expressions, joy[0]


def main():
    if not features.check("webp"):
        raise RuntimeError("This Pillow installation needs WebP support")
    people = [(code, ROOT / "images/CS" / f"{code}_1.webp") for code in string.ascii_uppercase[:12]]
    places = [(path.stem, path) for path in sorted((ROOT / "images/B").glob("*.webp"))]
    expression_labels, joy = expression_mapping()
    active = [(f"{code}-active", ROOT / "images/CS" / f"{code}_{joy}.webp") for code in string.ascii_uppercase[:12]]
    expressions = [
        (f"{code}-{number}", ROOT / "images/CS" / f"{code}_{number}.webp")
        for code in string.ascii_uppercase[:12] for number, _ in expression_labels
    ]
    if len(places) != 36:
        raise RuntimeError(f"Expected 36 existing panoramas, found {len(places)}")
    inputs = [source for _, source in people + places + active + expressions]
    source_hashes = {source: sha256(source) for source in inputs}
    records = []
    batches = [
        ("people", people, (480, 960), (1856, 1280)),
        ("places", places, (640, 1280), (3200, 640)),
        ("people", active, (480, 960), None),
        ("expressions", expressions, (320,), None),
    ]
    for group, sources, widths, expected in batches:
        batch_records = []
        for code, source in sources:
            with Image.open(source) as image:
                if expected and image.size != expected:
                    raise RuntimeError(f"Unexpected source size for {source}: {image.size}; expected {expected}")
            for width in widths:
                batch_records.append(derivative(source, width, group, code))
        records.extend(batch_records)
        for width in widths:
            matching = [item for item in batch_records if item["width"] == width]
            label = "people active" if sources is active else group
            print(f"{label} {width}w: {len(matching)} images, {sum(item['bytes'] for item in matching):,} bytes")
    if any(sha256(source) != before for source, before in source_hashes.items()):
        raise RuntimeError("A source image changed during generation")
    manifest = {
        "format": "WebP",
        "quality": QUALITY,
        "method": METHOD,
        "resize": "Lanczos, full frame, nearest integer height, reducing_gap=3.0",
        "pillow_version": Image.__version__,
        "libwebp_version": features.version("webp"),
        "active_expression": {"number": joy, "label": "기쁨", "mapping_source": "_build/data.py"},
        "expression_mapping": [{"number": number, "label": label} for number, label in expression_labels],
        "images": records,
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Total: {len(records)} images, {sum(item['bytes'] for item in records):,} bytes; all source hashes unchanged")


if __name__ == "__main__":
    main()
