// Authored musical silhouettes, sampled into light points rather than solid objects.
const head = 'M 89 169 C 93 184 65 197 51 186 C 37 175 64 157 81 161 C 86 162 88 165 89 169 Z';
const stem = 'M 85 174 C 86 137 85 84 91 45 L 96 42 C 91 88 93 136 91 172 Z';
const flag = 'M 94 43 C 99 66 145 65 144 97 C 144 111 136 123 124 133 C 137 111 138 95 120 87 C 105 80 94 78 91 66 Z';
const shapes = {
  eighth: [head, stem, flag],
  quarter: [head, stem],
  sixteenth: [head, stem, flag, 'M 93 78 C 102 97 135 99 133 123 C 132 136 123 146 115 151 C 125 135 126 121 110 114 C 99 109 92 103 91 94 Z'],
  beamed: [
    'M 63 174 C 67 188 43 199 30 189 C 19 178 43 163 57 168 Z',
    'M 142 151 C 146 165 122 176 109 166 C 98 155 122 140 136 145 Z',
    'M 59 179 L 60 63 L 143 39 L 142 158 L 137 159 L 137 55 L 65 76 L 65 178 Z'
  ]
};

export function noteMarkup(kind = 'eighth') {
  return `<svg viewBox="0 0 180 240" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-dasharray=".25 4">${shapes[kind].map(d => `<path d="${d}"/>`).join('')}</g></svg>`;
}

export function noteCloud(kind, random) {
  const mask = document.createElement('canvas'); mask.width = 180; mask.height = 240;
  const ctx = mask.getContext('2d');
  ctx.fillStyle = 'white'; shapes[kind].forEach(d => ctx.fill(new Path2D(d)));
  const pixels = ctx.getImageData(0, 0, 180, 240).data;
  const points = [];
  for (let tries = 0; points.length < 630 && tries < 70000; tries++) {
    const x = random() * 180, y = random() * 240;
    if (pixels[(Math.floor(y) * 180 + Math.floor(x)) * 4 + 3] < 128) continue;
    points.push({x:x - 90, y:y - 120, phase:random() * Math.PI * 2, size:.35 + random() ** 3 * 1.15, drift:random(), tone:Math.floor(random() * 5)});
  }
  return points;
}
