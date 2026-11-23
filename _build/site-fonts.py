#!/usr/bin/env python3
"""Build OFL-licensed web-font subsets for the site's existing Korean/Latin copy.

Install: python3 -m pip install 'fonttools[woff]==4.68.0' 'brotli==1.2.1'
Run after the HTML build: python3 _build/site-fonts.py
Only assets/fonts is written. Sources are cached outside the repository.
"""

from __future__ import annotations

import ast
import hashlib
import json
import os
from html.parser import HTMLParser
from pathlib import Path
import tempfile
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets/fonts"
CACHE = Path(os.environ.get("SITE_FONT_CACHE", Path(tempfile.gettempdir()) / "ma-font-sources"))
NOTO_REV = "9b0f1436e455d902de067a2501422e5dc71ad16b"  # Serif2.003
CORMORANT_REV = "06bfe0d62a98375cb09c942fa18e68bd32cff057"
SOURCES = [
    {
        "name": "NotoSerifCJK-Regular.ttc",
        "url": f"https://raw.githubusercontent.com/notofonts/noto-cjk/{NOTO_REV}/Serif/OTC/NotoSerifCJK-Regular.ttc",
        "sha256": "5d9c31a059600193c9d7968a998bde886ccdc77e934006ad243b41794c496a7d",
        "system": "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
        "face": 1,
        "output": "noto-serif-kr-regular.woff2",
        "weight": 400,
    },
    {
        "name": "NotoSerifCJK-Bold.ttc",
        "url": f"https://raw.githubusercontent.com/notofonts/noto-cjk/{NOTO_REV}/Serif/OTC/NotoSerifCJK-Bold.ttc",
        "sha256": "1505ee3b9c0890fae6302ee0e9c6fd74d690f4a55a6ace1d9944f3f6352d622d",
        "system": "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc",
        "face": 1,
        "output": "noto-serif-kr-bold.woff2",
        "weight": 700,
    },
    {
        "name": "CormorantGaramond.ttf",
        "url": f"https://raw.githubusercontent.com/google/fonts/{CORMORANT_REV}/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf",
        "sha256": "b20b7d9626dd956b2c5e558692ad328b1f19e3275e2782db4fa07670d83f35e0",
        "output": "cormorant-garamond.woff2",
        "weight": [300, 700],
    },
]


class VisibleCopy(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ignored = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self.ignored += 1
        for key, value in attrs:
            if value and (key in {"alt", "title", "placeholder", "aria-label"} or key.startswith("data-")):
                self.parts.append(value)

    def handle_endtag(self, tag):
        if tag in {"script", "style"} and self.ignored:
            self.ignored -= 1

    def handle_data(self, data):
        if not self.ignored:
            self.parts.append(data)


def copy_characters():
    parser = VisibleCopy()
    html_files = sorted([*ROOT.glob("*.html"), *(ROOT / "char").glob("*.html")])
    for path in html_files:
        parser.feed(path.read_text(encoding="utf-8"))
    data = ast.parse((ROOT / "_build/data.py").read_text(encoding="utf-8"))
    parser.parts.extend(node.value for node in ast.walk(data) if isinstance(node, ast.Constant) and isinstance(node.value, str))
    characters = {ord(c) for c in "".join(parser.parts) if not c.isspace()}
    # Keep Latin punctuation/numerals and music accidentals for dynamic UI labels.
    characters.update(range(0x20, 0x100))
    characters.update(range(0x2000, 0x2070))
    characters.update(map(ord, "♭♮♯"))
    return sorted(characters), [str(p.relative_to(ROOT)) for p in html_files] + ["_build/data.py"]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def source_file(spec):
    candidates = [CACHE / spec["name"]]
    if spec.get("system"):
        candidates.insert(0, Path(spec["system"]))
    for candidate in candidates:
        if candidate.is_file() and digest(candidate) == spec["sha256"]:
            return candidate
    CACHE.mkdir(parents=True, exist_ok=True)
    target = CACHE / spec["name"]
    with urllib.request.urlopen(spec["url"], timeout=90) as response:
        data = response.read()
    if hashlib.sha256(data).hexdigest() != spec["sha256"]:
        raise RuntimeError(f"Source checksum mismatch: {spec['name']}")
    target.write_bytes(data)
    return target


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    characters, inputs = copy_characters()
    manifest = {"inputs": inputs, "requested_codepoints": len(characters), "fonts": []}
    for spec in SOURCES:
        font = TTFont(source_file(spec), fontNumber=spec.get("face", -1), recalcTimestamp=False)
        supported = set(font.getBestCmap())
        selected = supported.intersection(characters)
        expected_hangul = {c for c in characters if 0xAC00 <= c <= 0xD7A3}
        if "face" in spec and not expected_hangul.issubset(selected):
            raise RuntimeError("The Korean source font is missing required Hangul syllables")
        options = subset.Options()
        options.recalc_timestamp = False
        # Preserve font attribution, copyright, licensing, and variation names.
        options.name_IDs = ["*"]
        options.name_legacy = True
        options.name_languages = ["*"]
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(unicodes=sorted(selected))
        subsetter.subset(font)
        font.flavor = "woff2"
        output = OUT / spec["output"]
        font.save(output)
        font.close()
        with TTFont(output) as check:
            if not selected.issubset(check.getBestCmap()):
                raise RuntimeError(f"Subset lost glyphs: {output.name}")
        manifest["fonts"].append({
            "file": output.name,
            "source": spec["url"],
            "source_sha256": spec["sha256"],
            "sha256": digest(output),
            "bytes": output.stat().st_size,
            "weight": spec["weight"],
            "codepoints": len(selected),
        })
        print(f"{output.name}: {output.stat().st_size:,} bytes, {len(selected)} codepoints")
    manifest["total_bytes"] = sum(font["bytes"] for font in manifest["fonts"])
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Total web fonts: {manifest['total_bytes']:,} bytes")


if __name__ == "__main__":
    main()
