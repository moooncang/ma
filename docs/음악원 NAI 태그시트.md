# 음악원(명문 음악 아카데미의 추첨 입학생) — NAI 태그시트(인물 12인) · NAI Diffusion V5 기준
2026-11-21 초안, 2026-11-22 학생 9인의 평상복을 같은 틀로 맞춤(「학생 복장 코드」) · 무대 연주(11)를 인물별 필살기 연출 통째 블록으로 바꿈 · 표정 줄 전부에 `1.5::…::`를 씌움 · 인물마다 맨 위에 배경 줄(연습실)을 두고 베이스·자연어 보강·첫등장을 통째 블록으로 합침 · 연습실 배경 줄의 피아노를 인물이 다루는 악기로 바꿈 · 2 평소와 4~10 감정 표정에서 손에 쥐는 물건을 전부 뺌(베이스에 있던 지휘봉·우산·수첩·만년필·악보는 1 첫등장·3 연주 줄로 옮김) · 마테이 11 필살기를 번개에서 밤하늘로 재구성. 외형은 「음악원 메인 프롬 초안」 #11 인물 한 줄과 같다. 그림이 나오면 그림에 맞춰 다시 정렬한다.

## 사용법
- 베이스 프롬프트 칸·UC·설정값은 「영지물 NAI 실사용 설정」 그대로 쓴다(작가님 그림체 블록). 이 시트에는 품질·인원수·nsfw·작가 태그를 넣지 않는다
- 베이스 칸에서 바꿀 곳은 배경 줄 한 곳이다. 인물 블록 맨 위에 `[배경 줄]`(연습실)을 넣어 두었고, 다른 배경은 아래 「인물 배경 프리셋」에서 고른다. 연습실 줄의 악기는 인물이 다루는 악기다 — 니콜·안토넬라 바이올린, 호세피나 첼로, 마테이 지휘대, 판 베이크 오르간, 피아노를 치는 루이제·에밀리아·송이·바질·사야카와 악기가 없는 테아·로완은 피아노. 3 연주에서 악기가 둘로 나오면 배경 줄의 악기 태그를 지운다. 구도 줄·그림체 블록·흐림 줄은 그대로 둔다
- 캐릭터 칸 = 베이스 → 빈 줄 → 자연어 보강 → 빈 줄 → 표정 한 줄. 인물마다 `[캐릭터 칸 통째 — 1 첫등장]` 블록에 셋이 합쳐져 있어 한 번에 복사해 붙인다. 표정 2~10은 그 블록의 맨 아래 줄만 바꿔 끼운다. 표정 줄은 전부 `1.5::…::`로 감싸 두었다
- 무대 연주 컷(표정 코드 11, 파일 20)은 필살기 연출이다. 인물마다 `[캐릭터 칸 통째 — 11 무대 연주]` 블록 하나에 무대 의상 베이스·자연어·표정과 동작·분위기가 다 들어 있어 한 번에 복사해 캐릭터 칸에 붙인다. 베이스 칸에서는 그 아래 `[배경 줄]` 한 줄만 바꾸고 구도 줄·그림체 블록·흐림 줄은 그대로 둔다
- 구도 태그(full body·upper body 등)는 넣지 않는다. 전신을 부르는 standing·walking·legs 계열도 쓰지 않는다
- 베이스 = 외모·의상·착용 소품만. 머리(색→길이→모양→앞머리→옆머리→장식) → 눈 → 피부·얼굴 → 체형 → 상의·장신구 → 시그니처 순. 하의·신발은 `[전신 추가]`
- 표정 한 줄 = 감정 → 눈·눈썹 → 입 → 시선 → 고개·몸 → 양손 → 소품 → 효과 순
- 2 평소와 4~10 감정 표정에는 손에 쥐는 물건(컵·악보·연필·카드·사탕·악기·지휘봉·우산·수첩)을 넣지 않는다. 손은 맨손 동작이나 몸에 걸친 것(스카프·초커·장갑·안경·모자·목걸이·가방 끈)을 만지는 동작으로만 쓴다. 손에 드는 물건은 1 첫등장·3 연주·11 무대 연주에만 나온다
- 표정 코드: 1 첫등장 / 2 평소 / 3 연주(전공 일 — 연주·노래·지휘·작곡·집필) / 4 기쁨 / 5 슬픔 / 6 눈물 / 7 당황 / 8 놀람 / 9 부끄러움 / 10 분노 / 11 무대 연주(필살기 연출). 파일 번호 대응은 맨 아래
- 7 당황은 `flustered` + 인물별 동작, 홍조 태그는 넣지 않는다(홍조가 끼면 UC에 `blush`)
- 악기는 3 연주와 11 무대 연주에서 든다. 첫등장에 악기를 드는 인물은 그 줄에 적혀 있다
- 강조는 `1.2::tag::`, 반드시 `::`로 닫는다

## 학생 복장 코드 (학생 9인 공통)
- 제복이 아니라 톤이 비슷한 사복이다. 리허설 차림(흰 상의 · 검은 하의)을 평소에도 입는 틀
- 틀: 깃 있는 흰 셔츠·블라우스 + 검은 하의(바지·롱스커트) + 겉옷 한 벌(재킷·카디건·조끼) + 포인트 하나
- 인물별 (상의 / 겉옷 / 포인트 / 하의)
  - A 루이제 — 구겨진 흰 셔츠(소매 걷음) / 없음 / 붉은 스카프 / 검은 바지
  - B 니콜 — 검은 셔츠 / 검은 블레이저 / 검은 초커 / 검은 바지 (같은 틀을 전부 검정으로)
  - C 호세피나 — 흰 셔츠 / 어깨에서 흘러내린 크림 카디건 / 등에 멘 첼로 케이스 / 검은 바지
  - D 테아 — 흰 블라우스(자보) / 붉은 크롭 재킷 / 큰 흰 리본 / 검은 바지
  - E 에밀리아 — 흰 하이넥 블라우스 / 없음 / 흰 장갑·유리병 목걸이 / 검은 롱스커트
  - F 송이 — 흰 셔츠 / 낡은 갈색 카디건 / 둥근 안경·악보 가방 / 검은 롱스커트
  - G 마테이 — 흰 셔츠(소매 걷음)·검은 넥타이 / 검은 조끼 / 지휘봉 / 검은 바지
  - H 바질 — 흰 셔츠·검은 넥타이 / 회색 벨벳 재킷·조끼 / 우산·중절모 / 회색 바지 (하의만 예외 — 늘 같은 회색 정장)
  - K 안토넬라 — 흰 블라우스·남색 목 리본 / 남색 조끼 / 사탕 / 검은 스커트
- 교수(I·J)와 평론가(L)는 이 틀 밖이다
- 통일감이 약하게 나오면 캐릭터 칸에 `white shirt`(니콜은 `black shirt`)를 한 번 더 적는다. 교복처럼 나오면 UC의 `school uniform`에 가중치를 준다(`1.5::school uniform::`)

## 공통
### 축 꼬리표 (그림체 블록 없이 뽑을 때만, 베이스 칸)
```
modern, high complexity, rich color, dramatic lighting
```

### UC 추가 (공통 UC 끝에)
```
fantasy, medieval, armor, weapon, school uniform, child, aged down
```
- 현대 배경이라 판타지 옷·갑옷이 섞이지 않게 하고, 아카데미가 교복 학원물로 읽히는 것을 막는다

---

# 학생

========================================
A. 루이제 브란트 (♀ 23) — 피아노 · 독일 · 모티브 베토벤
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실
```
indoors, practice room, upright piano, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, grey hair, medium hair, 1.2::messy hair::, wavy hair, hair between eyes, swept bangs, sidelocks, brown eyes, tsurime, long eyelashes, thick eyebrows, grey eyebrows, fair skin, slender, medium breasts, white shirt, collared shirt, wrinkled clothes, open collar, sleeves rolled up, 1.2::red scarf::

Her ash-grey hair is a wild, messy shoulder-length mane of unruly waves, with bangs falling between her eyes. A worn red scarf is loosely wrapped around her neck over a wrinkled white shirt with the sleeves rolled up to her elbows.

1.5::serious, frown, closed mouth, looking at viewer, facing viewer, crossed arms, holding sheet music, rolled paper in hand, scarf fluttering, floating hair::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
black pants, black leather shoes
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::frown, furrowed brow, closed mouth, looking at viewer, head tilt, hand on own hip::
```

**3 연주**
```
1.5::focused, furrowed brow, clenched teeth, looking down, leaning forward, playing piano, grand piano, hands on piano keys, floating hair, sweat, motion blur::
```

**4 기쁨**
```
1.5::grin, teeth, half-closed eyes, looking at viewer, chin up, clenched hand, raised fist, other hand on own hip::
```

**5 슬픔**
```
1.5::sad, furrowed brow, closed mouth, looking down, head down, hand in own hair, clutching own head::
```

**6 눈물**
```
1.5::tears, tearing up, clenched teeth, furrowed brow, looking away, head turned away, wiping tears with wrist, clenched hand::
```

**7 당황**
```
1.5::flustered, wide-eyed, wavy mouth, looking away, hand on back of head, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, raised eyebrows, parted lips, looking at viewer, leaning back, hands up::
```

**9 부끄러움**
```
1.5::blush, embarrassed, frown, closed mouth, looking away, head turned away, pulling scarf up, scarf over mouth, hand on scarf::
```

**10 분노**
```
1.5::angry, glaring, v-shaped eyebrows, clenched teeth, looking at viewer, shaded face, leaning forward, pointing at viewer, other hand clenched, floating hair::
```

**11 무대 연주 — 필살기** 온몸으로 내리치는 타건, 건반에서 튀는 불티

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, grey hair, medium hair, 1.2::messy hair::, wavy hair, hair between eyes, swept bangs, sidelocks, brown eyes, tsurime, long eyelashes, thick eyebrows, grey eyebrows, fair skin, slender, medium breasts, 1.2::black dress::, evening gown, halterneck, bare shoulders, bare arms, backless dress, 1.2::red ribbon choker::

Her ash-grey hair is still a wild shoulder-length mane even on stage, with bangs falling between her eyes. She wears a plain black halterneck evening gown that leaves her shoulders and back bare, and a thin red ribbon tied around her neck in place of her scarf. She strikes the keys with her whole body, and embers and sparks scatter from the piano with every chord.

1.5::playing piano, grand piano, leaning forward, one hand on piano keys, other hand raised high, fingers spread, intense, furrowed brow, clenched teeth, looking down, dynamic pose, foreshortening, motion blur, motion lines, light trail, floating hair, sweat, spotlight, backlighting, lens flare, embers, sparks, fire particles, red glow::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 대극장
```
indoors, concert hall, stage, stage lights, dark audience seats, red curtains
```

[무대 전신 추가] 전신 컷에서만
```
long dress, side slit, black high heels
```

- ※ 시그니처 = 붉은 스카프(무대에서는 붉은 리본 초커)
- ※ 찌푸린 얼굴이 기본값. 4 기쁨도 이긴 사람의 웃음이다
- ※ 9 부끄러움 = 스카프를 끌어올려 입을 가린다

[소품] sheet music / pencil / pocket notebook / coffee mug / metronome
[인물 네거티브]
```
long hair, straight hair, neat hair, glasses, large breasts
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

========================================
B. 니콜 페이건 (♀ 22) — 바이올린 · 미국 · 모티브 파가니니
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실(바이올린)
```
indoors, practice room, violin on chair, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, red hair, dark red hair, very long hair, wavy hair, parted bangs, long sidelocks, yellow eyes, tsurime, long eyelashes, thin eyebrows, pale skin, red lips, lipstick, tall female, slender, long fingers, medium breasts, 1.2::black choker::, black shirt, collared shirt, open collar, collarbone, black jacket, blazer, open jacket, long sleeves, silver ring

Her deep crimson hair falls in long loose waves to her waist, parted in the middle with long sidelocks framing her pale face and golden eyes. She dresses entirely in black: a tailored blazer over a black collared shirt with the collar open, and a thin black choker at her throat.

1.5::smirk, half-closed eyes, closed mouth, looking at viewer, head tilt, holding violin, violin under arm, holding bow (music), bow resting on own shoulder, floating hair::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
black pants, black ankle boots
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::smug, smile, half-closed eyes, looking at viewer, finger to own mouth, index finger raised, other hand on own hip::
```

**3 연주**
```
1.5::grin, teeth, half-closed eyes, looking at viewer, playing violin, violin on shoulder, chin on violin, holding bow (music), dynamic pose, floating hair, motion blur::
```

**4 기쁨**
```
1.5::laughing, open mouth, teeth, closed eyes, head back, hand on own forehead, other hand on own hip::
```

**5 슬픔**
```
1.5::sad, expressionless, half-closed eyes, closed mouth, looking down, head down, arms at sides::
```

**6 눈물**
```
1.5::tears, bitter smile, half-closed eyes, looking away, head turned away, hand over own eye::
```

**7 당황**
```
1.5::flustered, wide-eyed, wavy mouth, looking at viewer, hands up, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, raised eyebrows, parted lips, looking at viewer, leaning forward, hand on own chin::
```

**9 부끄러움**
```
1.5::blush, embarrassed, closed mouth, looking away, sideways glance, touching choker, hand on own neck::
```

**10 분노**
```
1.5::cold stare, narrowed eyes, expressionless, closed mouth, looking at viewer, shaded face, chin up, crossed arms::
```

**11 무대 연주 — 필살기** 줄 셋이 끊어진 채 한 줄로 켜는 웃는 얼굴, 떨어지는 검은 깃털

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, red hair, dark red hair, very long hair, wavy hair, parted bangs, long sidelocks, yellow eyes, tsurime, long eyelashes, thin eyebrows, pale skin, red lips, lipstick, tall female, slender, long fingers, medium breasts, 1.2::black dress::, evening gown, strapless dress, bare shoulders, collarbone, 1.2::black choker::, silver ring

Her deep crimson hair falls in long loose waves to her waist, parted in the middle, against pale skin and golden eyes. On stage she wears a strapless black evening gown and the same thin black choker, with nothing else to distract from the violin. Three strings of her violin have snapped and curl in the air; she plays on the single remaining string with a devilish grin as black feathers fall around her.

1.5::playing violin, violin on shoulder, chin on violin, holding bow (music), bow arm stretched out, grin, teeth, half-closed eyes, looking at viewer, dynamic pose, foreshortening, motion blur, motion lines, light trail, floating hair, spotlight, backlighting, lens flare, black feathers, falling feathers, dark aura, red glow::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 암전(핀 조명)
```
dark background, black background, stage, light beam
```

[무대 전신 추가] 전신 컷에서만
```
long dress, side slit, black high heels
```

- ※ 시그니처 = 검은 옷만 + 검은 초커
- ※ 웃는 얼굴이 기본값. 웃음이 꺼지는 5·6·10이 이 인물의 진폭이다
- ※ 11 필살기 = 줄 셋이 끊어진 채 남은 한 줄로 켠다. 끊어진 줄이 안 나오면 자연어 문장을 캐릭터 칸 맨 앞으로 옮긴다

[소품] violin / bow / playing cards / coin / violin case
[인물 네거티브]
```
short hair, straight hair, white clothes, colorful clothes, glasses, large breasts
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

========================================
C. 호세피나 에레디아 (♀ 27) — 첼로 · 아르헨티나 · 모티브 하이든
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실(첼로)
```
indoors, practice room, cello leaning against wall, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, 1.2::tan::, blonde hair, long hair, wavy hair, low ponytail, hair over shoulder, swept bangs, hair scrunchie, aqua eyes, tareme, long eyelashes, thick eyebrows, curvy, wide hips, large breasts, white shirt, collared shirt, open collar, collarbone, cream cardigan, open cardigan, off shoulder, hoop earrings, bead bracelet, 1.2::cello case::, instrument case on back

Her wavy honey-blonde hair is gathered in a loose low ponytail that drapes over one shoulder, with side-swept bangs, against warm tan skin. She wears a white collared shirt with the collar open under a loose cream cardigan that has slipped off her shoulders, and carries a large cello case on her back.

1.5::grin, teeth, one eye closed, looking at viewer, head tilt, waving, hand up, other hand on case strap::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
black pants, white sneakers
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::smile, closed mouth, looking at viewer, facing viewer, hand on own hip, other hand on case strap::
```

**3 연주**
```
1.5::gentle smile, closed eyes, head tilt, playing cello, cello, holding bow (music), hand on fingerboard, floating hair::
```

**4 기쁨**
```
1.5::laughing, open mouth, closed eyes, head back, hand on own stomach::
```

**5 슬픔**
```
1.5::sad smile, half-closed eyes, closed mouth, looking down, head down, hand on own chest, clutching own clothes::
```

**6 눈물**
```
1.5::tears, tearing up, sad smile, looking away, wiping tears with finger::
```

**7 당황**
```
1.5::flustered, awkward smile, raised eyebrows, looking away, sideways glance, scratching cheek, index finger on cheek, other hand waving, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, open mouth, looking at viewer, leaning back, hand over own mouth::
```

**9 부끄러움**
```
1.5::blush, embarrassed, smile, looking away, twirling own hair, playing with ponytail, other hand on own cheek::
```

**10 분노**
```
1.5::smile, closed eyes, shaded face, anger vein, hands on own hips, leaning forward::
```

**11 무대 연주 — 필살기** 크게 긋는 활, 햇살 같은 금가루

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, 1.2::tan::, blonde hair, long hair, wavy hair, low ponytail, hair over shoulder, swept bangs, hair flower, white flower, aqua eyes, tareme, long eyelashes, thick eyebrows, curvy, wide hips, large breasts, 1.2::gold dress::, satin dress, evening gown, off-shoulder dress, bare shoulders, collarbone, hoop earrings

Her wavy honey-blonde hair is gathered in a low ponytail over one shoulder with a small white flower pinned at the tie, against warm tan skin. She wears a gold satin off-shoulder evening gown that leaves her shoulders bare. She leans into her cello with a wide, joyful sweep of the bow, golden dust rising around her like sunlight.

1.5::playing cello, cello, holding bow (music), hand on fingerboard, bow drawn wide, leaning into cello, smile, open mouth, half-closed eyes, looking up, dynamic pose, foreshortening, motion blur, light trail, floating hair, sweat, spotlight, backlighting, lens flare, golden particles, glitter, yellow glow, sunbeam::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 리사이틀홀
```
indoors, recital hall, small stage, wooden stage, wooden wall, stage lights, dark audience seats
```

[무대 전신 추가] 전신 컷에서만
```
long dress, gold high heels
```

- ※ 시그니처 = 등에 멘 첼로 케이스
- ※ 웃는 얼굴이 기본값. 10 분노 = 웃으면서 화낸다

[소품] cello / bow / paper cup / chamber music score / cello case
[인물 네거티브]
```
pale skin, short hair, straight hair, twintails, glasses, small breasts
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

========================================
D. 테아 모저 (♀ 20) — 소프라노 · 오스트리아 · 모티브 모차르트
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실
```
indoors, practice room, upright piano, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, light pink hair, short hair, wavy hair, bob cut, swept bangs, 1.2::white hair bow::, large bow, blue eyes, light blue eyes, tareme, long eyelashes, pink eyebrows, fair skin, slender, medium breasts, 1.2::red jacket::, cropped jacket, velvet jacket, gold buttons, white blouse, frilled collar, jabot

Her light pink hair is a wavy chin-length bob with curled ends and side-swept bangs, tied with a large white bow at the back of her head. She is a grown woman of twenty, wearing a short red velvet jacket with gold buttons over a white blouse with a frilled jabot.

1.5::grin, teeth, looking at viewer, leaning forward, head tilt, hand cupped to own ear, other hand on own hip::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
black pants, high-waist pants, ankle boots
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::smile, humming, closed mouth, looking at viewer, head tilt, index finger raised, other hand behind back, musical note::
```

**3 연주**
```
1.5::singing, open mouth, closed eyes, head tilted up, hand on own chest, other arm outstretched, musical note, floating hair::
```

**4 기쁨**
```
1.5::laughing, open mouth, teeth, closed eyes, arms up, both hands raised, sparkle::
```

**5 슬픔**
```
1.5::sad, pout, furrowed brow, looking down, head down, fidgeting, playing with own jabot, both hands::
```

**6 눈물**
```
1.5::crying, tears, streaming tears, open mouth, closed eyes, rubbing eyes, both hands::
```

**7 당황**
```
1.5::flustered, wide-eyed, wavy mouth, looking at viewer, waving hands, both hands up, flying sweatdrops::
```

**8 놀람**
```
1.5::surprised, wide-eyed, :o, looking at viewer, leaning back, hands on own cheeks::
```

**9 부끄러움**
```
1.5::blush, embarrassed, looking at viewer, covering own face, peeking through fingers, both hands::
```

**10 분노**
```
1.5::pout, puffy cheeks, v-shaped eyebrows, looking at viewer, leaning forward, hands on own hips::
```

**11 무대 연주 — 필살기** 가장 높은 음에서 젖힌 고개, 터지는 음표와 별

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, light pink hair, short hair, wavy hair, bob cut, swept bangs, 1.2::white hair bow::, large bow, blue eyes, light blue eyes, tareme, long eyelashes, pink eyebrows, fair skin, slender, medium breasts, 1.2::red dress::, evening gown, off-shoulder dress, bare shoulders, white lace trim, pearl necklace, white elbow gloves

Her light pink hair is a wavy chin-length bob with a large white bow at the back. On stage she wears a red off-shoulder evening gown trimmed with white lace, long white gloves and a string of pearls. She throws her head back on the highest note with one arm flung wide, as glowing musical notes and sparkles burst around her.

1.5::singing, open mouth, smile, half-closed eyes, head tilted up, looking up, hand on own chest, other arm outstretched, fingers spread, dynamic pose, foreshortening, floating hair, floating clothes, wind, spotlight, backlighting, lens flare, light particles, musical note, sparkle, confetti, pink glow::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 대극장
```
indoors, concert hall, stage, stage lights, dark audience seats, red curtains
```

[무대 전신 추가] 전신 컷에서만
```
long dress, red high heels
```

- ※ 시그니처 = 붉은 재킷 + 큰 흰 리본
- ※ 최연소(20세)지만 어려 보이면 안 된다. 키·체형 태그는 보통으로 두었고 인물 네거티브를 꼭 붙인다. 어리게 나오면 `mature female`에 1.2
- ※ 감정 진폭이 가장 큰 인물. 6 눈물은 소리 내어 운다

[소품] sheet music / bird cage / billiard cue / candy / music stand
[인물 네거티브]
```
child, aged down, loli, petite, flat chest, twintails, long hair, straight hair
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

========================================
E. 에밀리아 볼스카 (♀ 24) — 피아노 · 폴란드 · 모티브 쇼팽
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실
```
indoors, practice room, upright piano, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, light purple hair, very long hair, straight hair, parted bangs, long sidelocks, white hairband, grey eyes, tareme, long eyelashes, thin eyebrows, pale skin, slender, narrow waist, medium breasts, white blouse, high collar, frilled shirt, long sleeves, 1.2::white gloves::, 1.2::vial necklace::, glass vial pendant, silver chain

Her straight lavender hair falls to her waist with parted bangs, long sidelocks and a white hairband. She always wears thin white gloves, and a tiny glass vial filled with dark soil hangs from a silver chain at her chest over a high-collared white blouse.

1.5::expressionless, half-closed eyes, closed mouth, sideways glance, looking at viewer, head turned away, hand on own chest, holding pendant, floating hair::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
long skirt, black skirt, black pantyhose, black flats
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::expressionless, closed mouth, looking away, own hands together::
```

**3 연주**
```
1.5::gentle expression, closed eyes, parted lips, head tilt, playing piano, grand piano, hands on piano keys, gloves removed, bare hands, light particles::
```

**4 기쁨**
```
1.5::light smile, closed eyes, closed mouth, head tilt, gloved hand to own mouth, covering own mouth::
```

**5 슬픔**
```
1.5::sad, half-closed eyes, closed mouth, looking down, head down, holding pendant, both hands at chest::
```

**6 눈물**
```
1.5::tears, streaming tears, closed eyes, closed mouth, head down, clutching pendant, both hands at chest::
```

**7 당황**
```
1.5::flustered, wide-eyed, closed mouth, looking away, fidgeting, adjusting gloves, hands together, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, parted lips, looking at viewer, leaning back, hand on own chest::
```

**9 부끄러움**
```
1.5::blush, embarrassed, closed mouth, looking away, head turned away, covering own mouth, gloved hand over mouth::
```

**10 분노**
```
1.5::cold stare, narrowed eyes, expressionless, closed mouth, looking at viewer, shaded face, chin up, adjusting gloves, pulling on glove::
```

**11 무대 연주 — 필살기** 건반에 닿을 듯 말 듯한 맨손, 촛불 속에 내리는 꽃잎

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, light purple hair, very long hair, straight hair, parted bangs, long sidelocks, white hairband, grey eyes, tareme, long eyelashes, thin eyebrows, pale skin, slender, narrow waist, medium breasts, 1.2::light blue dress::, evening gown, long sleeves, see-through sleeves, lace, collarbone, 1.2::vial necklace::, glass vial pendant, silver chain

Her straight lavender hair falls to her waist with parted bangs and a white hairband. She wears a pale blue evening gown with sheer lace sleeves, the small glass vial of soil still hanging at her chest, and her hands are bare without her usual gloves. Her bare fingers barely touch the keys, and pale violet petals drift down around the piano in the candlelight.

1.5::playing piano, grand piano, hands on piano keys, bare hands, closed eyes, parted lips, calm, head tilt, foreshortening, light trail, floating hair, spotlight, backlighting, light particles, falling petals, purple petals, purple glow, candlelight::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 살롱의 밤
```
indoors, salon, chandelier, velvet curtains, candlelight, gilded mirror, dark room
```

[무대 전신 추가] 전신 컷에서만
```
long dress, silver high heels
```

- ※ 시그니처 = 흰 장갑 + 흙이 든 유리병 목걸이
- ※ 장갑은 건반 앞에서만 벗는다(3 연주, 11 무대 연주)
- ※ 감정 진폭이 작은 인물. 6 눈물에서 처음 무너진다

[소품] white gloves / glass vial pendant / teacup / sheet music / candle
[인물 네거티브]
```
short hair, wavy hair, ponytail, tan, glasses, large breasts
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

========================================
F. 서송이 (♀ 25) — 반주(협업 피아노) · 한국 · 모티브 슈베르트
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실
```
indoors, practice room, upright piano, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, brown hair, short hair, curly hair, bob cut, swept bangs, brown eyes, tareme, thick eyebrows, 1.2::round eyewear::, glasses, fair skin, slender, medium breasts, white shirt, collared shirt, brown cardigan, oversized clothes, open cardigan, 1.2::tote bag::, shoulder bag

Her brown hair is a short curly bob with soft side-swept bangs, and she wears large round glasses. A worn, oversized brown cardigan hangs open over a plain white collared shirt, and a canvas tote bag stuffed with sheet music is slung over her shoulder.

1.5::awkward smile, closed mouth, looking at viewer, head tilt, waving, hand up, holding sheet music, sheet music against chest::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
long skirt, black skirt, white sneakers
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::smile, closed mouth, looking at viewer, adjusting eyewear, hand on eyewear, other hand on bag strap::
```

**3 연주**
```
1.5::focused, light smile, closed mouth, looking to the side, playing piano, hands on piano keys, sheet music, music stand::
```

**4 기쁨**
```
1.5::happy, smile, open mouth, closed eyes, ^_^, clapping, own hands together::
```

**5 슬픔**
```
1.5::sad smile, closed mouth, looking down, head down, both hands on bag strap::
```

**6 눈물**
```
1.5::tears, tearing up, wavy mouth, lifting eyewear, wiping tears under glasses::
```

**7 당황**
```
1.5::flustered, wide-eyed, wavy mouth, looking at viewer, hands up, crooked eyewear, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, raised eyebrows, open mouth, looking at viewer, both hands on eyewear::
```

**9 부끄러움**
```
1.5::blush, embarrassed, looking down, covering own mouth, sleeves past wrists, both hands::
```

**10 분노**
```
1.5::annoyed, pout, furrowed brow, looking at viewer, opaque glasses, clenched hands, arms at sides::
```

**11 무대 연주 — 필살기** 옆을 보며 치는 반주, 날아오르는 악보

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, brown hair, short hair, curly hair, bob cut, swept bangs, brown eyes, tareme, thick eyebrows, 1.2::round eyewear::, glasses, fair skin, slender, medium breasts, 1.2::blue dress::, dark blue dress, simple dress, short sleeves, collarbone, pearl earrings

Her brown hair is a short curly bob with soft side-swept bangs, and she keeps her large round glasses on stage. She wears a simple dark blue dress with short sleeves, plainer than anyone else on stage. She plays with her eyes turned to her side, and pages of sheet music lift into the air around her like slow birds.

1.5::playing piano, grand piano, hands on piano keys, leaning forward, gentle smile, closed mouth, looking to the side, dynamic pose, foreshortening, motion blur, light trail, floating hair, sweat, spotlight, backlighting, flying paper, sheet music, fireflies, soft glow::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 리사이틀홀
```
indoors, recital hall, small stage, wooden stage, wooden wall, stage lights, dark audience seats
```

[무대 전신 추가] 전신 컷에서만
```
long dress, black flats
```

- ※ 시그니처 = 둥근 안경 + 악보 가방
- ※ 키가 작은 인물이지만 키 태그는 넣지 않았다(어려 보이는 것을 막으려고). 상반신 구도라 티가 나지 않는다
- ※ 11 무대 연주의 의상 = 반주자의 수수한 드레스

[소품] sheet music / tote bag / music folder / instant coffee / pencil
[인물 네거티브]
```
long hair, straight hair, child, aged down, large breasts
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

========================================
G. 마테이 칼리나 (♂ 27) — 지휘 · 체코 · 모티브 말러
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실(지휘대)
```
indoors, practice room, conductor's podium, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature male, attractive male, black hair, medium hair, slicked back hair, grey eyes, tsurime, thin eyebrows, 1.2::rimless eyewear::, round eyewear, glasses, pale skin, sharp jawline, tall, lean, white shirt, collared shirt, sleeves rolled up, black necktie, black vest, buttoned vest

His black hair is combed straight back and reaches the nape of his neck, and he wears thin round rimless glasses on a sharp, lean face. He wears a white shirt with the sleeves rolled up, a black necktie and a buttoned black vest.

1.5::serious, closed mouth, looking at viewer, chin up, baton (conducting), holding baton, adjusting eyewear, hand on eyewear::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
black pants, black shoes
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::expressionless, closed mouth, looking at viewer, straight posture, arms behind back::
```

**3 연주**
```
1.5::furrowed brow, open mouth, conducting, baton (conducting), holding baton, arm raised, other hand outstretched, floating hair, sweat, motion blur::
```

**4 기쁨**
```
1.5::light smile, closed eyes, closed mouth, head tilt, crossed arms::
```

**5 슬픔**
```
1.5::tired, sigh, half-closed eyes, looking down, head down, hand on own forehead::
```

**6 눈물**
```
1.5::single tear, expressionless, closed mouth, looking away, head turned away, loosening necktie, hand on necktie::
```

**7 당황**
```
1.5::flustered, raised eyebrows, closed mouth, looking away, adjusting eyewear, pushing up glasses, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, raised eyebrow, parted lips, looking at viewer, arm up, open hand::
```

**9 부끄러움**
```
1.5::embarrassed, light blush, looking away, head turned away, clearing throat, hand to own mouth, clenched hand::
```

**10 분노**
```
1.5::angry, glaring, furrowed brow, clenched teeth, looking at viewer, shaded face, opaque glasses, pointing at viewer::
```

**11 무대 연주 — 필살기** 양팔을 활짝 벌린 총주, 홀 천장에 열리는 밤하늘

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature male, attractive male, black hair, medium hair, slicked back hair, grey eyes, tsurime, thin eyebrows, 1.2::rimless eyewear::, round eyewear, glasses, pale skin, sharp jawline, tall, lean, 1.2::black tailcoat::, white dress shirt, white vest, white bow tie, baton (conducting)

His black hair is combed straight back, and thin round rimless glasses sit on his sharp, lean face. He wears a black tailcoat with a white vest and white bow tie. At the climax he throws both arms wide open with his head tilted back, a thin white baton held lightly in his right hand and his left hand open toward the sky, while the ceiling of the hall opens into a vast starry night sky and stardust drifts down around him.

1.5::conducting, outstretched arms, spread arms, holding baton, open hand, fingers spread, head back, looking up, intense, furrowed brow, parted lips, sweat, dynamic pose, floating hair, floating clothes, coattails, wind, spotlight, backlighting, starry sky, milky way, shooting star, stardust, light particles::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 대극장(밤하늘)
```
indoors, concert hall, stage, dark audience seats, night sky, starry sky
```

[무대 전신 추가] 전신 컷에서만
```
black pants, black shoes
```

- ※ 시그니처 = 무테 안경 + 지휘봉(지휘봉은 1 첫등장·3 연주·11 무대 연주에만 든다)
- ※ 감정 진폭이 작은 인물. 3 연주(지휘)에서만 크게 움직인다
- ※ 11 필살기 = 연출은 지휘봉이 아니라 하늘에서 나온다. 지휘봉은 가늘게만 보이면 된다. 빛나는 막대로 나오면 UC에 `glowing weapon, lightsaber, electricity`를 넣는다

[소품] baton / orchestral score / pencil / metronome / hiking boots
[인물 네거티브]
```
long hair, beard, muscular, thick-framed eyewear
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

========================================
H. 바질 소렐 (♂ 26) — 작곡 · 프랑스 · 모티브 사티
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실
```
indoors, practice room, upright piano, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature male, brown hair, medium hair, messy hair, goatee, brown eyes, tareme, thin eyebrows, 1.2::pince-nez::, thin, 1.2::bowler hat::, black headwear, grey jacket, velvet jacket, grey vest, white shirt, black necktie

His messy brown hair pokes out from under a black bowler hat, and he wears a small pince-nez and a short goatee. He always wears the same grey velvet jacket and vest.

1.5::expressionless, closed mouth, looking at viewer, head tilt, tipping hat, hand on headwear, black umbrella, holding umbrella, closed umbrella::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
grey pants, black shoes
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::expressionless, closed mouth, looking up, hand on own chin::
```

**3 연주**
```
1.5::focused, closed mouth, looking down, writing, holding pencil, sheet music, other hand on piano keys, upright piano::
```

**4 기쁨**
```
1.5::light smile, closed eyes, closed mouth, tipping hat, hand on headwear::
```

**5 슬픔**
```
1.5::expressionless, half-closed eyes, closed mouth, looking down, head down, hands in pockets::
```

**6 눈물**
```
1.5::single tear, expressionless, closed mouth, looking up, hand on own cheek::
```

**7 당황**
```
1.5::flustered, wide-eyed, wavy mouth, looking away, tilted headwear, eyewear falling, hands up, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, raised eyebrows, parted lips, looking at viewer, adjusting eyewear::
```

**9 부끄러움**
```
1.5::embarrassed, light blush, closed mouth, looking away, pulling hat down, hat over eyes, hand on headwear::
```

**10 분노**
```
1.5::annoyed, narrowed eyes, frown, looking at viewer, index finger raised, pointing up::
```

**11 무대 연주 — 필살기** 무표정한 연주, 실내에 내리는 비와 공중에 펴진 우산

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature male, brown hair, medium hair, messy hair, goatee, brown eyes, tareme, thin eyebrows, 1.2::pince-nez::, thin, 1.2::bowler hat::, black headwear, grey jacket, velvet jacket, grey vest, white shirt, black bow tie, boutonniere, white flower, 1.2::black umbrella::, open umbrella

He wears the very same grey velvet jacket and vest on stage, with only a black bow tie and a white flower on his chest added. His messy brown hair pokes out from under the bowler hat. He plays without expression while soft rain falls inside the hall, his black umbrella hanging open in the air above the piano.

1.5::playing piano, grand piano, hands on piano keys, expressionless, half-closed eyes, closed mouth, looking down, foreshortening, light trail, spotlight, backlighting, light particles, rain, water drops, ripples, grey mist::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 살롱의 밤
```
indoors, salon, chandelier, velvet curtains, candlelight, gilded mirror, dark room
```

[무대 전신 추가] 전신 컷에서만
```
grey pants, black shoes
```

- ※ 시그니처 = 검은 우산 + 회색 재킷(우산은 1 첫등장·11 무대 연주에만 나온다)
- ※ 무대에서도 같은 재킷이다(나비넥타이와 꽃만 더한다). 11 필살기에서는 우산이 펴진 채 피아노 위에 떠 있다

[소품] umbrella / pencil / sheet music / bowler hat / coffee cup
[인물 네거티브]
```
clean-shaven, full beard, long hair, muscular, colorful clothes
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

========================================
K. 안토넬라 사르티 (♀ 26) — 바이올린 · 이탈리아 · 모티브 살리에리
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실(바이올린)
```
indoors, practice room, violin on chair, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, dark blue hair, long hair, straight hair, 1.2::half updo::, blunt bangs, sidelocks, blue hair ribbon, green eyes, tareme, long eyelashes, thin eyebrows, fair skin, slender, narrow waist, large breasts, white blouse, collared shirt, long sleeves, neck ribbon, blue ribbon, 1.2::blue vest::, buttoned vest

Her straight navy-blue hair falls to the middle of her back, the top half gathered and tied behind her head with a dark blue ribbon, with neat blunt bangs. She wears a spotless white blouse with a blue neck ribbon under a fitted navy vest.

1.5::gentle smile, closed mouth, looking at viewer, head tilt, holding violin case, both hands, case in front::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
black skirt, pencil skirt, black pantyhose, black high heels
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::smile, closed eyes, closed mouth, head tilt, own hands together::
```

**3 연주**
```
1.5::focused, closed mouth, looking down, playing violin, violin on shoulder, chin on violin, holding bow (music), straight posture::
```

**4 기쁨**
```
1.5::soft smile, half-closed eyes, looking down, hand on own chest::
```

**5 슬픔**
```
1.5::sad, half-closed eyes, biting own lip, looking down, head down, holding own arm::
```

**6 눈물**
```
1.5::crying, tears, streaming tears, clenched teeth, furrowed brow, looking down, trembling, clenched hands::
```

**7 당황**
```
1.5::flustered, wide-eyed, wavy mouth, looking away, index fingers together, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, parted lips, looking at viewer, hand to own mouth::
```

**9 부끄러움**
```
1.5::blush, embarrassed, wavy mouth, looking away, twirling own hair, other hand on own cheek::
```

**10 분노**
```
1.5::jealous, forced smile, shaded face, narrowed eyes, sideways glance, looking to the side, biting own thumb, other hand clenched::
```

**11 무대 연주 — 필살기** 미소가 사라진 얼굴, 활을 타고 흐르는 푸른 불꽃

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, dark blue hair, long hair, straight hair, 1.2::half updo::, blunt bangs, sidelocks, green hair ribbon, green eyes, tareme, long eyelashes, thin eyebrows, fair skin, slender, narrow waist, large breasts, 1.2::green dress::, dark green dress, satin dress, evening gown, sleeveless dress, bare shoulders, collarbone, pearl necklace

Her straight navy-blue hair falls to the middle of her back in a neat half updo, tied with a dark green ribbon that matches her dress. She wears a sleeveless dark green satin evening gown and a string of pearls. Her flawless smile is gone; she plays with her teeth clenched and her green eyes burning, as cold blue flames run along the bow.

1.5::playing violin, violin on shoulder, chin on violin, holding bow (music), bow arm stretched out, intense, furrowed brow, clenched teeth, glaring, looking down, dynamic pose, foreshortening, motion blur, motion lines, light trail, floating hair, sweat, spotlight, backlighting, lens flare, blue fire, glowing eyes, green glow::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 대극장
```
indoors, concert hall, stage, stage lights, dark audience seats, red curtains
```

[무대 전신 추가] 전신 컷에서만
```
long dress, green high heels
```

- ※ 시그니처 = 남색 리본 하프업(사탕은 표정 컷에 넣지 않는다)
- ※ 2 평소 = 빈틈없는 미소(눈을 감고 웃는다). 웃지 않는 5·6·10이 속마음이다
- ※ 10 분노 = 질투. 미소를 유지한 채 곁눈질하고 엄지를 깨문다
- ※ 4 기쁨 = 혼자 있을 때의 얼굴

[소품] violin / bow / wrapped candy / lollipop / violin case
[인물 네거티브]
```
short hair, twintails, messy hair, wavy hair, glasses, small breasts
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

---

# 교수

========================================
I. 쿠라모토 사야카 (♀ 38) — 실내악 교수(피아노) · 일본 · 모티브 클라라 슈만
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실
```
indoors, practice room, upright piano, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, black hair, long hair, 1.2::low bun::, single hair bun, parted bangs, sidelocks, black eyes, tsurime, long eyelashes, thin eyebrows, pale skin, mole under mouth, tall female, curvy, narrow waist, large breasts, black dress, high collar, long sleeves, 1.2::cameo::, brooch, pearl earrings

Her black hair is parted in the center and gathered into a neat low bun at the nape of her neck, with a few loose sidelocks. She always wears a black high-collared long-sleeved dress fastened at the throat with an oval cameo brooch.

1.5::serious, closed mouth, looking at viewer, facing viewer, chin up, holding notebook, black notebook, notebook against chest, other hand holding pencil::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
long dress, black high heels
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::expressionless, half-closed eyes, closed mouth, looking at viewer, crossed arms::
```

**3 연주**
```
1.5::focused, closed mouth, looking down, playing piano, grand piano, hands on piano keys, straight posture::
```

**4 기쁨**
```
1.5::light smile, closed eyes, closed mouth, head tilt, hand on own chest::
```

**5 슬픔**
```
1.5::sad, half-closed eyes, closed mouth, looking down, touching brooch, hand at own collar::
```

**6 눈물**
```
1.5::single tear, tear on cheek, expressionless, closed mouth, looking away, head turned away, hand on own chest::
```

**7 당황**
```
1.5::flustered, raised eyebrows, closed mouth, looking away, clearing throat, hand to own mouth::
```

**8 놀람**
```
1.5::surprised, wide-eyed, raised eyebrows, parted lips, looking at viewer, leaning back, hand on own chest::
```

**9 부끄러움**
```
1.5::blush, embarrassed, closed mouth, looking away, head turned away, hand on own cheek, touching own sidelock::
```

**10 분노**
```
1.5::cold stare, narrowed eyes, furrowed brow, closed mouth, looking at viewer, shaded face, crossed arms::
```

**11 무대 연주 — 필살기** 눈을 감은 암보 연주, 찬 조명 속의 흰 꽃잎

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature female, black hair, long hair, 1.2::low bun::, single hair bun, parted bangs, sidelocks, black eyes, tsurime, long eyelashes, thin eyebrows, pale skin, mole under mouth, tall female, curvy, narrow waist, large breasts, 1.2::black dress::, evening gown, velvet dress, off-shoulder dress, bare shoulders, collarbone, long sleeves, lace sleeves, 1.2::cameo::, choker, pearl earrings

Her black hair is parted in the center and gathered into a neat low bun. On stage she wears a black velvet off-shoulder evening gown with lace sleeves, her shoulders bare for once, and the oval cameo worn on a black ribbon choker at her throat. She plays from memory with her eyes closed and her back perfectly straight, white petals falling through a single cold spotlight.

1.5::playing piano, grand piano, hands on piano keys, straight posture, closed eyes, closed mouth, calm, foreshortening, light trail, spotlight, backlighting, lens flare, light particles, white petals, falling petals, white glow, silver particles::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 리사이틀홀
```
indoors, recital hall, small stage, wooden stage, wooden wall, stage lights, dark audience seats
```

[무대 전신 추가] 전신 컷에서만
```
long dress, black high heels
```

- ※ 시그니처 = 가르마 쪽머리 + 카메오 브로치
- ※ 38세. `mature female`을 지우지 말 것. 어리게 나오면 1.2로 올린다
- ※ 11 무대 연주의 의상 = 평소 목까지 잠근 옷과 달리 어깨가 드러난다(카메오는 초커로)
- ※ 감정 진폭이 작은 인물

[소품] black notebook / pencil / chamber music score / teacup / metronome
[인물 네거티브]
```
short hair, hair down, blunt bangs, colorful clothes, aged down, small breasts
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

========================================
J. 얀 판 베이크 (♂ 71) — 오르간·쳄발로 교수 · 네덜란드 · 모티브 바흐
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실(오르간)
```
indoors, practice room, pipe organ, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
old man, 1.2::wrinkles::, aged skin, nasolabial folds, white hair, medium hair, curly hair, swept back hair, thick eyebrows, white eyebrows, blue eyes, big nose, stout, broad shoulders, 1.2::semi-rimless eyewear::, reading glasses, white shirt, sleeves rolled up, brown vest, buttoned vest, pocket watch

His white hair is a thick mass of curls swept back from his forehead down to his collar, above heavy white eyebrows and a deeply lined face. Half-rim reading glasses sit low on his nose, and he wears a buttoned brown vest over a white shirt with the sleeves rolled up.

1.5::calm, closed mouth, looking at viewer, looking over eyewear, holding coffee mug, other hand holding sheet music::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
brown pants, brown leather shoes
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::stern, closed mouth, looking at viewer, hand on own chin::
```

**3 연주**
```
1.5::focused, closed mouth, looking down, playing organ, pipe organ, organ keyboard, hands on keys, organ pipes::
```

**4 기쁨**
```
1.5::laughing, open mouth, closed eyes, head back, hand on own belly::
```

**5 슬픔**
```
1.5::sad, sigh, closed eyes, head down, own hands together::
```

**6 눈물**
```
1.5::tears, closed eyes, closed mouth, head down, wiping tears with hand::
```

**7 당황**
```
1.5::flustered, raised eyebrows, wavy mouth, looking away, scratching head, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, raised eyebrows, open mouth, looking over eyewear, leaning forward, adjusting eyewear::
```

**9 부끄러움**
```
1.5::embarrassed, sheepish grin, light blush, looking away, rubbing back of head, hand on back of head::
```

**10 분노**
```
1.5::angry, stern, furrowed brow, v-shaped eyebrows, closed mouth, looking at viewer, shaded face, crossed arms::
```

**11 무대 연주 — 필살기** 온 체중을 싣는 건반, 스테인드글라스의 빛기둥

[캐릭터 칸 통째 — 11 무대 연주] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
old man, 1.2::wrinkles::, aged skin, nasolabial folds, white hair, medium hair, curly hair, swept back hair, thick eyebrows, white eyebrows, blue eyes, big nose, stout, broad shoulders, 1.2::semi-rimless eyewear::, reading glasses, black suit, black jacket, black vest, white shirt, black necktie, pocket watch

His white hair is a thick mass of curls swept back from his forehead, above heavy white eyebrows and a deeply lined face. He wears a plain black suit and vest with his reading glasses low on his nose. He bears down on the keyboards with his whole weight, and shafts of colored light pour through the stained glass onto the towering pipes.

1.5::playing organ, pipe organ, organ keyboard, both hands on keys, leaning forward, organ pipes, intense, furrowed brow, closed mouth, looking down, dynamic pose, foreshortening, motion blur, light trail, floating hair, sweat, backlighting, lens flare, light rays, stained glass, dust particles::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 성당(오르간)
```
indoors, church, pipe organ, organ pipes, stained glass, stone pillars, light rays
```

[무대 전신 추가] 전신 컷에서만
```
black pants, black shoes
```

- ※ 시그니처 = 흰 곱슬머리 + 커피잔(커피잔은 1 첫등장에만 든다)
- ※ 노년 유지: `wrinkles, aged skin`을 지우지 말 것. 젊게 나오면 가중치를 올린다

[소품] coffee mug / old score / pocket watch / organ shoes / quill
[인물 네거티브]
```
young, bald, long beard, thin, smooth skin
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

---

# 바깥

========================================
L. 로완 셔먼 (♂ 44) — 평론가 · 영국 · 모티브 슈만
========================================
[배경 줄] 베이스 칸의 배경 줄에 붙인다 — 연습실
```
indoors, practice room, upright piano, music stand, metronome, sheet music, window, daylight
```

[캐릭터 칸 통째 — 1 첫등장] 베이스 · 자연어 보강 · 첫등장이 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature male, attractive male, brown hair, medium hair, wavy hair, parted bangs, stubble, grey eyes, tareme, bags under eyes, thin eyebrows, tall, thin, brown jacket, tweed jacket, grey vest, white shirt, grey scarf, 1.2::single glove::, black gloves

His wavy brown hair is parted and falls just over his ears, with faint stubble and tired grey eyes. He wears a brown tweed jacket with a grey scarf, and a single black leather glove on his right hand only; his left hand is bare.

1.5::expressionless, closed mouth, looking at viewer, holding notebook, holding fountain pen, pen to own chin::
```

[전신 추가] 전신·H 컷에서만 첫 문단(베이스) 뒤에
```
grey pants, brown shoes
```

[표정] 2~10 — 통째 블록의 맨 아래 줄과 바꿔 끼운다

**2 평소**
```
1.5::expressionless, half-closed eyes, closed mouth, looking at viewer, adjusting glove, hand on own wrist::
```

**3 연주**
```
1.5::focused, furrowed brow, closed mouth, looking afar, writing, holding fountain pen, open notebook, theater seat::
```

**4 기쁨**
```
1.5::light smile, closed eyes, closed mouth, hand on own chin::
```

**5 슬픔**
```
1.5::sad, half-closed eyes, closed mouth, looking down, looking at own hand, gloved hand raised::
```

**6 눈물**
```
1.5::single tear, closed eyes, closed mouth, head down, gloved hand over own face::
```

**7 당황**
```
1.5::flustered, raised eyebrows, closed mouth, looking away, adjusting scarf, hand on scarf, sweatdrop::
```

**8 놀람**
```
1.5::surprised, wide-eyed, parted lips, looking at viewer, leaning forward, hand to own mouth::
```

**9 부끄러움**
```
1.5::embarrassed, light blush, looking away, head turned away, hand on own neck::
```

**10 분노**
```
1.5::cold stare, narrowed eyes, closed mouth, looking at viewer, shaded face, chin up, hands in pockets::
```

**11 객석** 무대 연주가 없는 인물 — 객석에서 박수 치는 컷

[캐릭터 칸 통째 — 11 객석] 베이스 · 자연어 · 표정 · 분위기가 한 블록이다. 그대로 복사해 캐릭터 칸에 붙인다
```
mature male, attractive male, brown hair, medium hair, wavy hair, parted bangs, stubble, grey eyes, tareme, bags under eyes, thin eyebrows, tall, thin, black suit, black jacket, black vest, white shirt, grey scarf, 1.2::single glove::, black gloves

His wavy brown hair is parted and falls just over his ears, with faint stubble and tired grey eyes. In the audience he wears a black suit with the same grey scarf, applauding with one gloved hand and one bare hand.

1.5::light smile, closed mouth, looking at viewer, clapping, theater seat::
```

[배경 줄] 베이스 칸에서 바꿀 곳은 이 한 줄 — 객석
```
indoors, theater, red velvet seats, balcony, dim lighting
```

[무대 전신 추가] 전신 컷에서만
```
black pants, black shoes
```

- ※ 시그니처 = 오른손에만 낀 검은 장갑 + 수첩(수첩·만년필은 1 첫등장·3 연주에만 든다)
- ※ 장갑이 양손에 나오면 자연어 문장을 캐릭터 칸 맨 앞으로 옮긴다
- ※ 3 연주 = 객석에서 받아 적는 얼굴. 11 = 무대에 서는 사람이 아니라 객석 컷(검은 정장)

[소품] notebook / fountain pen / concert program / ticket stub / newspaper
[인물 네거티브]
```
full beard, long hair, muscular, young
```
[배경] 평소 = 맨 위 [배경 줄](연습실) / 11 = 11의 [배경 줄]

---

## 인물 배경 프리셋
베이스 칸의 배경 줄에 넣는다. 장소를 특정하지 않는 일반 배경, 태그 6~8개. 인물이 배경에 묻히면 뒤쪽 태그부터 지운다

**연습실**
```
indoors, practice room, upright piano, music stand, metronome, sheet music, window, daylight
```

**레슨실**
```
indoors, music room, grand piano, bookshelf, sheet music, tall window, wooden floor, daylight
```

**살롱**
```
indoors, salon, chandelier, velvet curtains, grand piano, armchair, gilded mirror, candlelight
```

**오케스트라 연습실**
```
indoors, rehearsal hall, rows of chairs, music stands, timpani, wooden floor, high ceiling
```

**카페**
```
indoors, cafe, wooden tables, coffee cups, large window, hanging lights, upright piano
```

**중정**
```
outdoors, courtyard, stone building, arched windows, ivy, fountain, trees, blue sky
```

**성당(오르간)**
```
indoors, church, pipe organ, organ pipes, stained glass, stone pillars, light rays
```

**객석**
```
indoors, theater, red velvet seats, balcony, dim lighting
```

**대극장** 무대 연주용
```
indoors, concert hall, stage, stage lights, dark audience seats, red curtains
```

**리사이틀홀** 무대 연주용
```
indoors, recital hall, small stage, wooden stage, wooden wall, stage lights, dark audience seats
```

**살롱의 밤** 무대 연주용
```
indoors, salon, chandelier, velvet curtains, candlelight, gilded mirror, dark room
```

**암전(핀 조명)** 무대 연주용 — 연출이 가장 세게 보인다
```
dark background, black background, stage, light beam
```

**무대(리허설)** 예비
```
indoors, concert hall, stage, empty seats, music stand, work lights
```

**호숫가** 예비
```
outdoors, lakeside, promenade, lake, mountains, street lamps, benches, sunset
```

---

## 파일 코드 · 경로
- 인물 주소: `https://cjivip.uk/MU/CS/{코드}_{번호}.webp` — 작품 코드 `MU`는 가정이다(메인 프롬 #3과 같은 값)
- 인물당 20장 × 12인 = 240장
- 표정 코드(이 시트의 태그 세트 번호) → 파일 번호
  - 1 첫등장 → 1
  - 2 평소 → 2·3 / 3 연주 → 4·5 / 4 기쁨 → 6·7 / 5 슬픔 → 8·9 / 6 눈물 → 10·11
  - 7 당황 → 12·13 / 8 놀람 → 14·15 / 9 부끄러움 → 16·17 / 10 분노 → 18·19
  - 11 무대 연주 → 20
- 해상도(영지물과 같게): 첫등장·무대 연주 1856×1280 / 표정 2304×960
- H씬 태그는 아직 없다. 메인 프롬 #3③의 번호(♀21~30, ♂21~25)는 영지물과 같은 틀로 잡아 둔 것이다

## 운용 팁
- 머리 길이는 태그가 네 칸뿐이라 자연어 보강(통째 블록의 둘째 문단)에 어디까지 오는지(턱·어깨·허리)를 적어 고정했다
- 포즈가 안 먹으면 그 손 태그 하나만 자연어 반 문장으로 바꾼다(예: `violin under arm` → `she tucks the violin under her arm`)
- 악기가 엉뚱하게 나오면 표정 줄 맨 앞에 악기 태그를 한 번 더 둔다(`violin`, `cello`, `grand piano`)
- 시그니처는 인물마다 하나. 베이스에 든 시그니처 태그는 표정 컷에서도 지우지 않는다
- 히로인 8인 머리색(겹치지 않게): 은회(루이제) / 진홍(니콜) / 금(호세피나) / 연분홍(테아) / 연보라(에밀리아) / 밤색(송이) / 남색(안토넬라) / 흑(사야카)
- 인물별 색: 루이제 `grey, white, red` / 니콜 `crimson, black` / 호세피나 `honey blonde, tan, cream, white` / 테아 `pink, red, white` / 에밀리아 `lavender, white` / 송이 `brown, white` / 마테이 `black, white` / 바질 `grey, black` / 안토넬라 `navy, white, green eyes` / 사야카 `black` / 판 베이크 `white hair, brown` / 로완 `brown tweed, grey`
- 외형은 그림이 기준. 뽑은 뒤 외모 검수표로 키워드북·메인 프롬·이 시트를 함께 맞춘다
