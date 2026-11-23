"""Prepare six CC0 VSCO 2 CE recordings. Requires Python 3 and ffmpeg."""
from pathlib import Path
import hashlib
import os
import struct
import subprocess
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/entry/audio'
CACHE = Path(os.environ.get('ENTRY_AUDIO_CACHE', '/tmp/ma-audio-sources'))
REVISION = '440300901dfe9275fd84e0b7763af1f8443ae62e'
BASE = f'https://raw.githubusercontent.com/sgossner/VSCO-2-CE/{REVISION}/'
SOURCES = [
    ('violin', 'Strings/Solo Violin/Arco Vib/LLVln_ArcoVib_A4_p.wav', '0d05607b46b78690893006d5aa7923ac304c7fb497df1e96536dc88ac5ac487f', 0, .55),
    ('cello', 'Strings/Cello Section/susvib/susvib_D2_v1_1.wav', 'e8640dec9febc6e39fcf06b19d2c95a85d5ff8c38f13c9879e69f551eaf38ab8', 0, .5),
    ('flute', 'Woodwinds/Flute/susNV/LDFlute_susNV_E4_v1_1.wav', 'b609d37fb577e2a0f64f20800fba4bed067151375349bf713c0d4e803f862580', 0, .45),
    ('piano-d', 'Keys/Upright Piano/Player_dyn2_rr1_026.wav', '4e668e75c3922c79ef06bd46806224dbf8dbfa0be1569847a1cd17e573a967ec', 1, .7),
    ('piano-fs', 'Keys/Upright Piano/Player_dyn2_rr1_028.wav', '84fe87bd24dc93d354213f730517a29f485c40715d5959af97976b364110b70a', 1, .7),
    ('piano-a', 'Keys/Upright Piano/Player_dyn2_rr1_030.wav', '4b558995c108f7f1dcede12c7e0444caa2658205fea34a314abf485dc6b7e710', 0, .7),
]

OUT.mkdir(parents=True, exist_ok=True)
CACHE.mkdir(parents=True, exist_ok=True)
for name, path, digest, semitones, peak in SOURCES:
    source = CACHE / f'{name}.wav'
    if not source.exists():
        source.write_bytes(urllib.request.urlopen(BASE + urllib.parse.quote(path), timeout=30).read())
    if hashlib.sha256(source.read_bytes()).hexdigest() != digest:
        raise ValueError(f'Source checksum mismatch: {name}')
    filters = f'aresample=44100,asetrate={44100 * 2 ** (semitones / 12)},aresample=44100,atrim=duration=4,highpass=f=45,lowpass=f=11000'
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(source), '-af', filters, '-f', 'f32le', '-'])
    maximum = max(abs(v[0]) for v in struct.iter_unpack('<f', raw))
    filters += f',volume={peak / maximum},afade=t=in:d=0.008,afade=t=out:st=3.65:d=0.35'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(source), '-af', filters, '-codec:a', 'libmp3lame', '-b:a', '128k', '-map_metadata', '-1', str(OUT / f'{name}.mp3')], check=True)
    print(f'{name}: 4 seconds, peak {peak}, pitch shift {semitones} semitone(s)')

for source, target in [('LICENSE', 'VSCO-CC0.txt'), ('Readme.txt', 'VSCO-README.txt')]:
    text = urllib.request.urlopen(BASE + source, timeout=30).read().decode()
    (OUT / target).write_text('\n'.join(line.rstrip() for line in text.splitlines()).rstrip() + '\n')
