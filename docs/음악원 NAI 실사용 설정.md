# 음악원 — NAI 실사용 설정
인물 240장(2026-11-22, 작가님 생성)의 PNG 파일에 저장된 생성 정보에서 뽑은 실제 값이다. 새 그림을 같은 그림체로 뽑을 때 이 값을 그대로 쓴다. 인물 태그는 「음악원 NAI 태그시트」, 파일별 seed는 「음악원 이미지 라벨 대응표.tsv」. 여성 H씬 80장(2026-11-23)의 값은 6절.

## 1. 설정값 (240장 전부 같음)
- 모델: NovelAI Diffusion V5 (파일 표기 `NovelAI Diffusion V5 0ADF9AB7`)
- Sampler: Euler Ancestral / Noise Schedule: karras / Steps: 20 / Prompt Guidance: 6.5 / Prompt Guidance Rescale: 0.2
- 해상도: 첫등장·무대 연주 1856×1280 / 표정 2304×960
- 캐릭터 프롬프트 1칸, 위치 지정 없음

## 2. 베이스 프롬프트 칸
① 구도 줄 → ② 그림체 블록 → ③ 배경 줄 → ④ 흐림 줄 순서다. 240장 모두 ①·④가 같았고, 컷마다 바꾼 곳은 ③ 배경 줄뿐이다.

[① 구도 줄] 첫등장·표정·무대 연주 전부 같은 줄
```
1.5::close-up, face focus, duch angle, dynamic pose, dynamic angle, upper body, from above::,
```

[② 그림체 블록] 작가님 그림체. 고치지 않는다
```
1.3::artist: terasu MC::,
0.85::artist: ie (raarami)::,
0.8::artist: mituyota_76 ::,
0.5::artist: wlop::,  
0.6::artist: akipeko::,
1.35::artist: gorgeous_mushroom::,
1.1::artist:solipsist::, 
1.1::artist:sparrowl::
0.5::artist: blade (galaxist)::,
0.3::artist: ebora::, 
0.3::artist: himemura saki::,  
0.4::artist: xipa::,
0.5::artist: healthyman::,
0.4::artist: baffu::, 
0.75::artist: stopu::,
0.5::artist: sos adult::,
1.5::artist: shinjiro::,
0.7::artist: Ruppu::,
1.2::artist: gogalking::,

year 2025, year 2026, nsfw, 1girl, 2d, 2.5d, volumetric illustration, -3::official art::, -3::official style::, 

2::depthness::, 2::hard shading::, 2::soft-edged::, 2::soft lighting::,

1.35::masterpiece::, 1.35::best quality::, 1.35::amazing quality::, 1.35::very aesthetic::, 1.35::best illustration::, 1.35::newest::, 1.35::highres::, 3::iligne claire::, 1.35::hyper detail::, 

2::detailed body::, 10::detailed skin::, -3::realistic skin::, 

3.5::supple skin::, 3.5::smooth skin::, -3::rough skin::, -3::dirty skin::, -3::bumpy skin::, -3::skin pores::, 3::shiny skin::, -3::glossy skin::, -3::wet skin::, -3::reflective skin::,

-2::multiple views::, -2::censored::, -2::artist collaboration::, -2::nsfw::, 
```
- `realistic skin` 가중치만 다르게 뽑힌 그림이 있다: `-3` 213장 / `-5` 26장(로완 20장, 판 베이크 6장) / `3` 1장(루이제 1장). 나머지는 글자까지 같다

[③ 배경 줄] 인물별로 실제 쓴 줄
- 평소(첫등장·표정 2~19) = 연습실. 피아노 자리에 인물이 다루는 악기가 들어간다
 ·루이제·테아·에밀리아·송이·바질·사야카: `indoors, practice room, upright piano, music stand, metronome, sheet music, window, daylight`
 ·니콜(표정)·안토넬라: `indoors, practice room, violin on chair, music stand, metronome, sheet music, window, daylight` — 니콜의 첫등장 1장만 `upright piano` 줄로 뽑혔다
 ·호세피나: `indoors, practice room, cello leaning against wall, music stand, metronome, sheet music, window, daylight`
 ·마테이: `indoors, practice room, conductor's podium, music stand, metronome, sheet music, window, daylight`
 ·판 베이크: `indoors, practice room, pipe organ, music stand, metronome, sheet music, window, daylight`
 ·로완만 살롱: `indoors, salon, chandelier, velvet curtains, grand piano, armchair, gilded mirror, candlelight`
- 무대 연주(20번)
 ·대극장(루이제·테아·마테이·안토넬라): `indoors, concert hall, stage, stage lights, dark audience seats, red curtains`
 ·리사이틀홀(호세피나·송이·사야카): `indoors, recital hall, small stage, wooden stage, wooden wall, stage lights, dark audience seats`
 ·살롱의 밤(에밀리아·바질): `indoors, salon, chandelier, velvet curtains, candlelight, gilded mirror, dark room`
 ·암전(니콜): `dark background, black background, stage, light beam`
 ·성당(판 베이크): `indoors, church, pipe organ, organ pipes, stained glass, stone pillars, light rays`
 ·객석(로완): `indoors, theater, red velvet seats, balcony, dim lighting`

[④ 흐림 줄] 전부 같은 줄
```
1.3::blurry background, depth of field::, -2::upscaled, blurry::,
```

## 3. UC (240장 전부 같음)
```
lowres, artistic error, film grain, scan artifacts, worst quality, bad quality, jpeg artifacts, very displeasing, chromatic aberration, dithering, halftone, screentone, multiple views, logo, too many watermarks, negative space, blank page, blank page, text, logo, watermark, too many watermarks, signature, artist name, subtitles, captions, dated, reference, multiple views, out of frame, badly cropped, chibi, clitoris, artist:xinzoruo, artist:milkpanda, artist:kurukurumagical, artist collaboration, one-hour drawing challenge, worst quality, bad quality, displeasing, very displeasing, unsatisfactory, inadequate, deficient, subpar, poor, lowres, blurry, pixelation, jpeg artifacts, compression artifacts, scan artifacts, aliasing, film grain, heavy film grain, dithering, chromatic aberration, digital dissolve, halftone, screentone, unfinished, incomplete, amateur drawing, childish drawing, poorly drawn, rough sketch, scribble, doodle, ms paint, low effort, messy details, fewer details, messy lineart, jagged lines, overexposed, underexposed, oversaturated, washed out colors, muddy colors, disorganized colors, unrealistic colors, color bleed, blotchy, smudged, distorted composition, bad perspective, duplicate, artistic error, bad portrait, bad illustration, anatomical nonsense, bad anatomy, bad proportions, wrong body proportions, gross proportions, unrealistic proportions, disproportionate body, distorted body, asymmetrical body, twisted body, twisted torso, broken spine, short torso, overly long torso, uneven shoulders, long neck, wrong head size, giant head, tiny head, mutated, deformed, disfigured, ugly, hideous, grotesque, uncanny valley, chubby, chubby ugly, awkward, unnatural pose, awkward pose, stiff pose, bad posture, unnatural hair, bad face, poorly drawn face, distorted face, blurred face, indistinct face, cloned face, mob face, faceless, bad eyes, empty eyes, extra eyes, lazy eye, cross-eyed, bad limbs, missing limbs, missing arms, missing legs, amputee, extra limbs, extra arms, extra legs, third arm, third leg, floating limbs, disconnected limbs, twisted limbs, merged limbs, fused limbs, merged bodies, conjoined, melting body, melting skin, flesh merge, dislocated joints, broken joints, extra joints, wrong joints, backwards knees, broken legs, bad arm, bad leg, bad hands, poorly drawn hands, mutated hands, malformed hands, mangled hands, wrong hands, backwards hands, claw hands, bad hand structure, extra digits, fewer digits, extra fingers, missing fingers, fused fingers, polydactyly, syndactyly, six fingers, four fingers, three fingers, mutated fingers, twisted fingers, broken fingers, long fingers, stubby fingers, bad feet, poorly drawn feet, mutated feet, twisted feet, extra toes, missing toes, fused toes, sepia, yellow tint, warm lighting, monochrome, muted colors, faded, retro artstyle, vintage, emoji, emoticon, chibi inset
```

## 4. 캐릭터 프롬프트 칸
- `[베이스]` → 빈 줄 → `[자연어 보강]` → 빈 줄 → `1.5::[표정 한 줄]::`. 태그시트의 「캐릭터 칸 통째」 블록이 이 모양 그대로다
- 표정 2~10은 통째 블록의 맨 아래 줄만 바꿔 끼운다. 무대 연주는 「캐릭터 칸 통째 — 11 무대 연주」 블록을 쓴다

## 5. 지금 태그시트와 다르게 뽑힌 컷
240장 가운데 185장은 지금 태그시트의 줄과 글자까지 같다. 나머지 55장은 대응표의 「현재 태그시트와 같은 줄」 칸에 ✕(54장) 또는 「표정 줄만 같음」(1장)으로 표시했다. 다른 곳은 전부 캐릭터 칸 맨 아래의 표정 줄이고, 베이스와 자연어 문단은 지금 태그시트와 같다(마테이 1장만 `mature male` 자리에 `man`).
- 손에 쥐는 물건을 빼기 전 줄로 뽑힌 컷: 루이제 6~9·12~15·18·19(악보·연필) / 니콜 2·8~12·16·17(카드·바이올린·활) / 호세피나 7·8·10·11·14(첼로·활). 지금 태그시트는 2 평소와 4~10 감정 표정에 손에 쥐는 물건을 넣지 않는다
- 작가님이 표정 줄에서 태그를 덜어 내고 뽑은 컷: 니콜 3·6·7·14·15·18·19 / 호세피나 6·9 / 테아 2·3 / 송이 8·9 / 마테이 15·19 / 바질 12~14 / 판 베이크 6~9·12·14. 그중 `smile`·`sad`·`flustered, wide-eyed`처럼 한두 단어만 남긴 컷이 C_6·C_9·J_6~J_9·H_12·H_13·G_15다
- 루이제 1(첫등장)은 캐릭터 칸의 문단 구성이 지금 통째 블록과 달랐다. 루이제·호세피나 2·3은 손 태그 표기만 다르다
- H_20(바질 무대 연주)은 평소 재킷 차림이다. G_20(마테이 무대 연주)은 배경 줄이 대극장 프리셋이고 밤하늘은 캐릭터 칸의 태그에서 나왔다

## 6. H씬 80장 (여성 8인 × 10종, 2026-11-23 작가님 생성)
작가님이 가림 처리를 해서 다시 저장한 파일이라 PNG의 글자 정보는 지워져 있다(1장만 남아 있다). 생성 정보가 그림의 알파 채널에 남아 있어 거기서 뽑았다. 인물 태그는 「음악원 NAI H씬 태그」, 올리기용 webp는 `H씬\`.
- 설정값: 1절과 같다. 해상도는 80장 전부 1856×1280
- ① 구도 줄: 80장 전부 아래 줄
```
1.5::upper body::,
```
- ② 그림체 블록: 2절과 같고 `realistic skin` 가중치만 80장 전부 `-5`다
- ③ 배경 줄: 침실. 끝의 달빛 태그만 세 가지로 뽑혔다
 ·`indoors, bedroom, night, bed, white bed sheet, pillow, blanket, bedside lamp, curtains, window, -4::moonlight::` — 51장(C_28, 테아·에밀리아·송이·안토넬라·사야카 전부). 마지막에 쓰신 줄이라 H씬 태그 문서의 배경 줄을 이것으로 맞췄다
 ·끝에 달빛 태그 없이 — 27장(A_23~A_30, 니콜 전부, C_21~C_27·C_29·C_30)
 ·끝에 `moonlight` — 2장(A_21·A_22)
- ④ 흐림 줄: 2절과 같다
- UC: 3절과 글자까지 같다. H씬 태그 문서의 [UC 추가]는 쓰지 않았다
- 캐릭터 칸: `[H 베이스]` → 빈 줄 → `[H 자연어]` → 빈 줄 → `1.5::[체위 한 줄]::`. 80장 모두 지금 「NAI H씬 태그」의 줄과 글자까지 같다. E_21만 베이스의 앞머리 태그가 `parted bangs`다(E_22부터 `wispy bangs`)
