# 입장 에셋

## 악보 12쪽

반복 패턴이 아니라 실제 곡의 기보 데이터를 Verovio 6.4.1로 새로 조판했다. 작품과 페이지는 다음과 같다.

| 파일 | 곡 | 페이지 |
|---|---|---|
| score-1, 2.svg | 바흐, 평균율 1권 전주곡 1번 BWV 846 | 1, 2 |
| score-3.svg | 모차르트, 피아노 소나타 K.545 1악장 제시부 | 1 |
| score-4, 5.svg | 베토벤, 현악 사중주 Op.18 No.1 1악장 | 1, 2 |
| score-6, 7.svg | 모차르트, 현악 사중주 K.458 1악장 | 1, 2 |
| score-8, 9.svg | 클라라 슈만, 폴로네즈 Op.1 No.1 | 1, 2 |
| score-10, 11.svg | 쇼팽, 마주르카 Op.6 No.2 | 1, 2 |
| score-12.svg | 베토벤, 피아노 소나타 Op.13 2악장 | 1 |

- 작곡 저작권이 만료된 곡을 사용했다. 역사적 판본의 사진 복사본이 아니라 새 조판이며, 사이트의 시각 연출용이다.
- 1~11쪽의 기보 자료: [music21 10.5.2 corpus](https://github.com/cuthbertLab/music21/tree/master/music21/corpus). 원본 파일과 배포 고지를 `_build/score-sources/`에 보존했다. `CORPUS-LICENSE.txt`는 기보 자료의 배포 조건, `MUSIC21-LICENSE.txt`는 music21 소프트웨어의 조건이다.
- 12쪽: [Craig Stuart Sapp의 베토벤 소나타 디지털 판](https://github.com/craigsapp/beethoven-piano-sonatas/blob/master/kern/sonata08-2.krn). 원전은 Paul Dukas 편집, Durand 1915년 판. 원본 Humdrum 파일의 편집자·인코더·출처 기록을 보존했다.
- 음악 글리프: Steinberg의 **Bravura**, SIL Open Font License 1.1. `BRAVURA-LICENSE.txt` 동봉. SVG 안에 글리프가 들어 있어 외부 음악 폰트 요청은 없다.
- `_build/entry-scores.py`로 재생성한다. 입력 파일을 바꾸지 않는 한 같은 곡의 같은 페이지를 얻는다. 기존 MusicXML의 일부 연결선에 대한 가져오기 경고가 있어 연주용 원전 대신 장식용 조판으로 사용한다.

## 빛 입자 음표

금속 PNG를 제거하고 `entry-notes.js`의 직접 그린 곡선에서 추출한 같은 630개 빛점 좌표를 `cache/note-points.bin`에 보관해 첫 방문에서 다시 계산하지 않는다. `entry-particles.js`가 은백색·옅은 청색·보랏빛 입자, 작은 별빛, 떠오르는 잔광을 실시간으로 그린다. 클릭하면 가운데 음표가 흩어지고 악기 순서에 맞춰 네 위치에서 다른 음표가 모였다 사라진다. Canvas를 쓸 수 없거나 동작 줄이기 설정이면 같은 곡선의 점선 SVG를 표시한다.

## 실제 악기 녹음

[음원 출처·가공 내역](audio/README.md). VSCO 2 Community Edition의 CC0 녹음 4개를 로컬 MP3로 보관한다. 바이올린·첼로 섹션·플루트 각 1개, 피아노 1개다. 악기 모사 발진음은 사용하지 않는다. `entry-audio.js`에서 실제 녹음을 재생하고 건조한 원음에 짧은 선행 지연과 스테레오 홀 잔향을 더한다. 각 음표가 나타날 때 해당 악기의 단음이 한 번만 울린다. 피아노 아르페지오·마지막 합주·중복 재생은 없다. 클릭 전에 AudioContext를 만들거나 소리를 재생하지 않는다.

## 런타임

- Three.js 0.170.0은 `assets/vendor/`에 로컬로 보관한다. MIT 라이선스 동봉.
- `entry-scene.js`는 Worker를 연결하고, `entry-paper-renderer.js`에서 종이 섬유·양면 재질·곡면·페이지끼리의 그림자를 그린다. Worker를 쓸 수 없으면 같은 렌더러를 본 스레드에서 사용한다. 긴 방향의 굽힘을 적분해 길이를 보존하고, 끝단의 비틀림을 별도로 적용한다.
- `entry-particles.js`: 음표 자체를 이루는 빛점과 주변의 궤적·반짝임. 동작 줄이기 설정에서는 애니메이션 캔버스를 만들지 않는다.
- 런타임에 music21·Verovio·이미지 서비스나 CDN 연결은 필요 없다.

## 품질을 유지하는 캐시

- `_build/entry-assets.cjs`로 SVG를 원래 렌더 크기인 840×1188에 조판해 lossless WebP로 저장한다. PNG 원본과 RGBA 픽셀 일치를 검사한다. SVG 원본은 그대로 보관한다.
- 종이 질감 생성과 3D 계산은 지원 브라우저에서 별도 Worker로 이동한다. 종이 수·곡면 분할·광원·그림자 해상도·픽셀 비율은 낮추지 않는다.
- 빛 입자는 광채와 중심점을 작은 스프라이트에 미리 합쳐 재사용한다. 대기 중에는 음표와 주변 빛이 차지하는 영역만 갱신하며, 같은 수의 입자와 같은 픽셀 비율을 유지한다.

- 본문은 음표에 마우스를 올리거나 초점을 주거나 입장할 때 준비한다. 모든 연출을 마치기 전에 실제 첫 화면과 대표 이미지의 준비를 확인한다.
