"""Re-engrave real, public-domain compositions. Tool: verovio==6.4.1.

Input encodings and provenance: score-sources/ and assets/entry/README.md.
No invented repeated note patterns and no runtime font / score service.
"""
from pathlib import Path
import zipfile
import xml.etree.ElementTree as ET
import verovio

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / 'assets/entry'
SCORES = [
    ('bach-prelude.mxl', 'Prelude I', 'J. S. Bach'),
    ('mozart-sonata.mxl', 'Sonata K. 545', 'W. A. Mozart'),
    ('beethoven-quartet.mxl', 'Quartet Op. 18, No. 1', 'L. van Beethoven'),
    ('mozart-quartet.mxl', 'Quartet K. 458', 'W. A. Mozart'),
    ('clara-polonaise.mxl', 'Polonaise Op. 1, No. 1', 'Clara Schumann'),
    ('chopin-mazurka.krn', 'Mazurka Op. 6, No. 2', 'F. Chopin'),
    ('beethoven-pathetique.krn', 'Sonata Op. 13', 'L. van Beethoven'),
]

number = 0
for i, (filename, title, composer) in enumerate(SCORES):
    source = ROOT / 'score-sources' / filename
    if source.suffix == '.mxl':
        with zipfile.ZipFile(source) as archive:
            name = next(n for n in archive.namelist() if n.endswith('.xml') and not n.startswith('META-INF'))
            data = archive.read(name).decode()
        doc = ET.fromstring(data)
        # Use the actual bibliographic title for the engraved header.
        movement = doc.find('movement-title')
        if movement is None:
            movement = ET.SubElement(doc, 'movement-title')
        movement.text = title
        identification = doc.find('identification')
        if identification is None:
            identification = ET.SubElement(doc, 'identification')
        creator = identification.find('creator[@type="composer"]')
        if creator is None:
            creator = ET.SubElement(identification, 'creator', type='composer')
        creator.text = composer
        data = ET.tostring(doc, encoding='unicode')
    else:
        data = source.read_text()
    toolkit = verovio.toolkit()
    toolkit.setOptions({
        'pageWidth':2100, 'pageHeight':2970, 'scale':40,
        'pageMarginLeft':125, 'pageMarginRight':125,
        'pageMarginTop':110, 'pageMarginBottom':110,
        'font':'Bravura', 'breaks':'auto', 'header':'auto', 'footer':'none',
        'spacingSystem':7, 'spacingStaff':9, 'justifyVertically':True,
        'svgViewBox':True, 'xmlIdSeed':71,
    })
    if not toolkit.loadData(data):
        raise RuntimeError(f'Could not engrave {filename}')
    for page in range(1, min(2, toolkit.getPageCount()) + 1):
        if number >= 12:
            break
        svg = toolkit.renderToSVG(page)
        # SVG textures need explicit intrinsic dimensions for WebGL uploads.
        svg = svg.replace('<svg ', '<svg width="840" height="1188" ', 1)
        # Neutral paper, not uniformly yellow parchment. Runtime adds fibres and light.
        opening = svg.index('>') + 1
        shade = ['#f6f2e8', '#faf8f0', '#f0eadc', '#f8f6ee', '#f2eee3', '#f7f3e8', '#f9f6ed'][i]
        svg = svg[:opening] + f'<rect width="100%" height="100%" fill="{shade}"/>' + svg[opening:]
        number += 1
        target = OUT / f'score-{number}.svg'
        target.write_text(svg)
        print(target.name, title, 'page', page)
