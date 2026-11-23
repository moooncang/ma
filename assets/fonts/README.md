# Site typography

These WOFF2 files are locally served, Unicode subsets of freely licensed fonts.
They contain the site's generated HTML copy, strings in `_build/data.py`, basic
Latin characters, punctuation, and the music accidentals supported by the sources.
No private or proprietary fonts are used. Both font families use the SIL Open Font
License 1.1. The complete license texts are included alongside this file and the
fonts retain their original copyright, license and naming records.

## Noto Serif CJK KR

- Original family: **Noto Serif CJK KR**, version **2.003**, Korean face (index 1)
  of `NotoSerifCJK-Regular.ttc` and `NotoSerifCJK-Bold.ttc`.
- Embedded copyright: **© 2017-2024 Adobe (http://www.adobe.com/).**
- Upstream: <https://github.com/notofonts/noto-cjk>, `Serif2.003`, pinned commit
  `9b0f1436e455d902de067a2501422e5dc71ad16b`.
- License: [NotoSerif-OFL.txt](NotoSerif-OFL.txt), obtained from upstream
  `Serif/LICENSE` at the same release.
- `noto-serif-kr-regular.woff2` is the genuine regular **400** face;
  `noto-serif-kr-bold.woff2` is the genuine bold **700** face. The browser matches
  requested intermediate/heavier weights to the available faces. These are not
  advertised as distinct 600 or 900 source weights.
- The CSS alias `Noto Serif KR` preserves this site's existing family selection;
  the underlying font name records identify the original Noto Serif CJK KR family.

## Cormorant Garamond

- Original family: **Cormorant Garamond**, upright variable font, real weight axis
  **300–700** (preserved in the subset).
- Copyright: **Copyright 2015 the Cormorant Project Authors
  (github.com/CatharsisFonts/Cormorant)**.
- Source: Google Fonts `ofl/cormorantgaramond/CormorantGaramond[wght].ttf`,
  pinned commit `06bfe0d62a98375cb09c942fa18e68bd32cff057`.
- License: [CormorantGaramond-OFL.txt](CormorantGaramond-OFL.txt), from that same
  pinned Google Fonts directory.

## Rebuild

Run from the repository root after rebuilding HTML:

```sh
python3 -m pip install 'fonttools[woff]==4.68.0' 'brotli==1.2.1'
python3 _build/site-fonts.py
```

The script verifies SHA-256 hashes of source fonts before subsetting. It uses a
matching system Noto collection if available; otherwise it downloads the pinned
upstream source. Sources are cached at `/tmp/ma-font-sources` by default. Set
`SITE_FONT_CACHE` to use a different cache directory. Sources are not shipped in
the website. `manifest.json` records exact source URLs, hashes and output sizes.

The page includes `assets/css/fonts.css`; no runtime request to Google Fonts is
needed. `font-display: swap` keeps copy visible while loading. If new Korean copy
is added, rerun this script so its additional syllables use the same typography.
Characters outside the subset use the page's normal fallback font stack.
