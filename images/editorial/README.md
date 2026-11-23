# Editorial artwork

Created with OpenAI image generation on 2026-11-24 for this website. These are
decorative fictional illustrations, not photographs of a real academy. Existing
site wording, named locations, character artwork, and setting data remain intact.

| Artwork | Use | Full-size / mobile |
| --- | --- | --- |
| `conservatory-dusk` | Academy introduction and world chapter: warm limestone colonnade, lake and Alpine foothills at blue hour | 1536 × 1024 / 768 × 512 |
| `conservatory-still-life` | Lottery chapter and admission introduction: violin, piano, score and unlabelled envelope in a quiet music room | 1536 × 1024 / 768 × 512 |

Both images were commissioned in a restrained midnight-blue, warm ivory and aged
brass palette, without interface lettering or character portraits. The original
1536 × 1024 PNGs remain in the shared workspace:

- `/workspace/generated_images/exec-da3e417a-a435-4249-ae20-2da3fb8435cb.png` (dusk)
- `/workspace/generated_images/exec-a92cf009-e156-448e-b7f3-0c843eb19166.png` (still life)

The delivered WebP images preserve the complete compositions. Their only build
operations are encoding and responsive resizing. Example regeneration:

```sh
ffmpeg -i original.png -frames:v 1 -c:v libwebp -quality 88 -compression_level 6 artwork.webp
ffmpeg -i original.png -vf scale=768:-1 -frames:v 1 -c:v libwebp -quality 88 -compression_level 6 artwork-768.webp
```

The full-size pair totals about 646 KiB; the mobile pair about 196 KiB. All new
editorial pictures use explicit dimensions, responsive source candidates, lazy
loading and asynchronous decoding. Existing salon/choice panoramas are reused
from `images/B` and decoded on demand; none of these images replace the hero or
load as part of the entrance rendering pipeline.
