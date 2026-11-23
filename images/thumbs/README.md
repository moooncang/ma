# Responsive artwork derivatives

These are technical size reductions of the existing site artwork. Source images
are unchanged. Each derivative preserves the complete original composition with
no crop, retouching, recoloring, added details, or sharpening. Any layout cropping
is applied separately by the browser's CSS.

| Derivatives | Existing sources | Output dimensions |
| --- | --- | --- |
| `people/{A…L}-480.webp` | `images/CS/{A…L}_1.webp` (1856 × 1280) | 480 × 331 |
| `people/{A…L}-960.webp` | Same | 960 × 662 |
| `places/{code}-640.webp` | All 36 `images/B/*.webp` panoramas (3200 × 640) | 640 × 128 |
| `places/{code}-1280.webp` | Same | 1280 × 256 |
| `people/{A…L}-active-480.webp` | `images/CS/{A…L}_6.webp` (2304 × 960) | 480 × 200 |
| `people/{A…L}-active-960.webp` | Same | 960 × 400 |
| `expressions/{A…L}-{number}-320.webp` | Only the 10 expression indices from `_build/data.py` | 320px wide, proportional height |

The panorama derivatives retain the original 5:1 ratio exactly. People image
heights are rounded to the nearest pixel when preserving the original ratio.
All images use WebP quality **90**, encoding method **6**, and Lanczos resizing.

The active hero uses the **기쁨** expression, read directly from `D.표정` in
`_build/data.py`. That mapping currently identifies **index 6**. It is not index 3.
The generator reads all 10 expression names and indices from the same data file
without modifying them, producing 120 expression strip thumbnails. These source
images have varying aspect ratios, so expression thumbnail heights vary too.
Normal hero derivatives continue to use the original index 1 image.

Active hero and expression thumbnails are interaction assets. Load them only as
needed on the corresponding main-site view; do not preload them during entry.

To regenerate from the repository root:

```sh
python3 -m pip install 'Pillow==13.0.0'
python3 _build/site-thumbnails.py
```

The original build used Pillow 13.0.0 with libwebp 1.6.0. Matching those versions
reproduces the encoding; other WebP versions may produce different bytes.
`manifest.json` records actual dimensions, file sizes, checksums, source paths,
and source checksums. The script verifies every output decodes and checks that
every source remains unchanged. It only writes under `images/thumbs/`.

For responsive markup, pair the matching 480/960 or 640/1280 files in `srcset`.
Set `sizes` to reflect the rendered image width, accounting for additional image
width needed by CSS `object-fit: cover` when cropping a panorama into a taller
tile. Use the original full-size artwork for full-screen views.
