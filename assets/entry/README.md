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

## 음표 4종

`note-eighth.png`, `note-beamed.png`, `note-quarter.png`, `note-sixteenth.png`는 직접 만든 입체 도형을 금속 재질·스튜디오 조명으로 렌더한 투명 PNG다. 480×640px. 원본 생성기는 `_build/entry-notes.cjs`다. 별도 스톡 이미지 서비스에 의존하지 않는다.

## 런타임

- Three.js 0.170.0은 `assets/vendor/`에 로컬로 보관한다. MIT 라이선스 동봉.
- `entry-scene.js`: 종이 섬유, 양면 재질, 곡면, 페이지끼리의 그림자. 긴 방향의 굽힘을 적분해 길이를 보존하고, 끝단의 비틀림을 별도로 적용한다.
- `entry-particles.js`: 음표 주변의 빛 궤적, 별 모양 반짝임, 발광 입자. 동작 줄이기 설정에서는 만들지 않는다.
- 런타임에 music21·Verovio·이미지 서비스나 CDN 연결은 필요 없다.
