# 음악원 소개 사이트 생성기. `python _build/build.py` → 저장소 최상단의 html을 다시 쓴다.
# 문구와 데이터는 data.py, 쪽의 틀은 이 파일, 모양은 assets/css/style.css, 동작은 assets/js/main.js.
# html을 손으로 고치지 않는다(다시 만들면 사라진다). index.html(입장)만 손으로 쓴 파일이다.
import html
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import data as D

ROOT = pathlib.Path(__file__).resolve().parent.parent
E = html.escape
사람 = {p["코드"]: p for p in D.인물}


def card(c): return f"images/card/{c}_1.webp"
def face(c, n): return f"images/CS/{c}_{n}.webp"
def place(c): return f"images/B/{c}.webp"
def charpage(c): return f"char/{c.lower()}.html"


def hd(ko, en):
    """섹션 제목 줄: 한글 제목, 선, 영문 라벨."""
    return f'<h2 class="hd"><span>{E(ko)}</span><i></i><em>{E(en)}</em></h2>'


def ps(lines):
    return "".join(f"<p>{E(t)}</p>" for t in lines)


def menu():
    items = list(D.메뉴)
    if D.음악:
        items.append(("music.html", "음악"))
    return items


def page(file, title, body, cls=""):
    root = "../" * file.count("/")
    full = D.제목 if not title else f"{title} · {D.제목}"
    nav = "".join(
        f'<a href="{root}{href}" data-key="{i}"{" aria-current=\"page\"" if href == file else ""}><b>{i}</b>{E(name)}</a>'
        for i, (href, name) in enumerate(menu(), 1))
    foot = "".join(f'<a href="{root}{href}">{E(name)}</a>' for href, name in menu())
    out = f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(full)}</title>
<link rel="stylesheet" href="{root}assets/css/fonts.css?v=site-1">
<link rel="stylesheet" href="{root}assets/css/style.css?v=site-1">
<link rel="stylesheet" href="{root}assets/css/pages.css?v=site-1">
<link rel="stylesheet" href="{root}assets/css/motion.css?v=site-1">
<script src="{root}assets/js/main.js?v=site-1" defer></script>
</head>
<body>
<a class="skip" href="#main">본문으로</a>
<header class="top">
  <a class="brand" href="{root}home.html">{E(D.영문)}</a>
  <nav aria-label="쪽 이동">{nav}</nav>
</header>
<main id="main" class="{cls}">
{body}
</main>
<footer class="foot">
  <span>{E(D.영문)}</span>
  <nav aria-label="쪽 이동">{foot}</nav>
</footer>
</body>
</html>
"""
    (ROOT / file).parent.mkdir(exist_ok=True)
    (ROOT / file).write_text(out, encoding="utf-8", newline="\n")
    return file


# ── 여러 쪽에서 쓰는 조각 ─────────────────────────────────────────
def stages(root=""):
    """무대 급을 고르면 그 무대가 보인다. 홀은 리허설과 본공연을 바꿔 본다."""
    tabs, panels = [], []
    for i, s in enumerate(D.무대):
        tabs.append(f'<button type="button" data-tab="{i}" aria-pressed="{str(i == 0).lower()}">{E(s["이름"])}</button>')
        imgs = s["그림"]
        if len(imgs) == 2:
            fig = (f'<figure data-picker><img data-out="img" src="{root}{place(imgs[0])}" alt="{E(s["이름"])}" loading="lazy" width="3200" height="640">'
                   f'<figcaption class="seg">'
                   f'<button type="button" data-pick data-set-img="{root}{place(imgs[0])}" aria-pressed="true">리허설</button>'
                   f'<button type="button" data-pick data-set-img="{root}{place(imgs[1])}" aria-pressed="false">본공연</button>'
                   f'</figcaption></figure>')
        else:
            fig = f'<figure><img src="{root}{place(imgs[0])}" alt="{E(s["이름"])}" loading="lazy" width="3200" height="640"></figure>'
        panels.append(f'<div data-panel="{i}"{"" if i == 0 else " hidden"}>{fig}'
                      f'<p class="en">{E(s["영문"])}</p><h3>{E(s["이름"])}</h3><p>{E(s["글"])}</p></div>')
    return (f'<div class="stages" data-tabs><div class="steps" role="group" aria-label="무대">{"".join(tabs)}</div>'
            f'{"".join(panels)}</div><p class="note">{E(D.무대_맺음)}</p>')


def calendar():
    """학기를 고르고 주차를 누르면 그 주의 일정이 나온다."""
    tabs, panels = [], []
    for i, term in enumerate(D.학기):
        tabs.append(f'<button type="button" data-tab="{i}" aria-pressed="{str(i == 0).lower()}">{E(term["이름"])}</button>')
        weeks = []
        for w in range(1, 16):
            name, text = term["주"].get(w, D.매주)
            weeks.append(f'<button type="button" data-pick class="{"ev" if w in term["주"] else ""}" aria-pressed="{str(w == 1).lower()}" '
                         f'data-set-week="{w}주차" data-set-name="{E(name)}" data-set-text="{E(text)}">{w}</button>')
        name, text = term["주"].get(1, D.매주)
        panels.append(f'<div data-panel="{i}" data-picker{"" if i == 0 else " hidden"}>'
                      f'<div class="weeks" role="group" aria-label="{E(term["이름"])} 주차">{"".join(weeks)}</div>'
                      f'<div class="weekout"><p class="en" data-out="week">1주차</p><h3 data-out="name">{E(name)}</h3><p data-out="text">{E(text)}</p></div></div>')
    return (f'<p>{E(D.학사력_머리)}</p><div class="cal" data-tabs><div class="seg" role="group" aria-label="학기">{"".join(tabs)}</div>'
            f'{"".join(panels)}</div><p class="note">{E(D.여름)}</p>')


def salon_demo():
    """연주를 고르면 네 살롱이 따로 반응한다."""
    rows = "".join(f'<li><b>{E(s["이름"])}</b><span class="en">{E(s["영문"])}</span><em data-state="0">{D.반응_이름[0]}</em></li>' for s in D.살롱)
    btns = "".join(f'<button type="button" data-r="{",".join(map(str, c["반응"]))}" data-note="{E(c["글"])}" aria-pressed="false">{E(c["이름"])}</button>' for c in D.연주)
    names = E(json.dumps({str(k): v for k, v in D.반응_이름.items()}, ensure_ascii=False))
    return (f'<div class="react" data-react data-names="{names}"><ul class="salonrows">{rows}</ul>'
            f'<div class="choices" role="group" aria-label="연주">{btns}</div>'
            f'<p class="note" data-react-note aria-live="polite">{E(D.연주_안내)}</p></div><p class="note">{E(D.연주_맺음)}</p>')


def mode_cards(root=""):
    return '<div class="modes">' + "".join(
        f'<a class="mode" href="{root}start.html#mode-{i}"><span class="mark">{m["기호"]}</span><h3>{E(m["이름"])}</h3>'
        f'<p class="en">{E(m["영문"])}</p><p>{E(m["한줄"])}</p></a>' for i, m in enumerate(D.모드)) + "</div>"


# ── 쪽 ───────────────────────────────────────────────────────────
def home():
    figs = "".join(
        f'<a class="fig" href="{charpage(c)}"><img src="{card(c)}" alt="" width="1856" height="1280">'
        f'<span>{E(사람[c]["줄"])}</span><b>{E(사람[c]["이름"])}</b></a>' for c in D.첫화면_인물)
    cast = "".join(
        f'<a class="slide" href="{charpage(p["코드"])}"><img src="{card(p["코드"])}" alt="" loading="lazy" width="1856" height="1280">'
        f'<span>{E(p["줄"])}</span><b>{E(p["이름"])}</b></a>' for p in D.인물)
    go = (f'<a class="play" href="{E(D.크랙_주소)}">PLAY</a>' if D.크랙_주소 else '') + '<a class="more" href="start.html">시작 안내</a>'
    body = f"""<section class="hero">
  <p class="en">{E(D.영문)}</p>
  <h1>{E(D.제목)}</h1>
  <p class="genre">{E(D.장르)}</p>
  <div class="figs">{figs}</div>
</section>
<section class="say">{ps(D.소개)}</section>
<section class="section-stages">{hd("무대", "THE STAGES")}{stages()}</section>
<section class="section-salons">{hd("살롱 넷", "FOUR SALONS")}<p>{E(D.살롱_머리)}</p>{salon_demo()}</section>
<section class="section-cast">{hd("사람들", "THE CAST")}<div class="slides">{cast}</div><p class="note"><a href="characters.html">열두 사람 모두 보기</a></p></section>
<section class="section-calendar">{hd("학사력", "THE CALENDAR")}{calendar()}</section>
<section class="section-beginnings">{hd("세 가지 시작", "BEGINNINGS")}<p>{E(D.모드_머리)}</p>{mode_cards()}</section>
<section class="end">{go}</section>"""
    return page("home.html", "", body, "home")


def world():
    first = D.장소[0]["곳"][0]
    groups = ""
    for g in D.장소:
        btns = "".join(
            f'<button type="button" data-pick data-set-img="{place(c)}" data-set-cap="{E(g["묶음"])} · {E(n)}" '
            f'aria-pressed="{str((c, n) == first).lower()}">{E(n)}</button>' for c, n in g["곳"])
        groups += f'<div class="placegroup"><p class="en">{E(g["영문"])}</p><h3>{E(g["묶음"])}</h3><div class="chips">{btns}</div></div>'
    prose = "".join(f'<section>{hd(s["이름"], s["영문"])}{ps(s["글"])}</section>' for s in D.세계_글)
    body = f"""<section class="head">{hd("세계", "THE WORLD")}<p>{E(D.세계_머리)}</p></section>
<section class="atlas" data-picker data-arrows>
  <figure><img data-out="img" src="{place(first[0])}" alt="" width="3200" height="640">
  <figcaption data-out="cap">{E(D.장소[0]["묶음"])} · {E(first[1])}</figcaption></figure>
  <p class="note">{E(D.장소_머리)}</p>
  <div class="placegroups">{groups}</div>
</section>
{prose}"""
    return page("world.html", "세계", body, "world")


def academy():
    def names(codes):
        return " · ".join(f'<a href="{charpage(c)}">{E(사람[c]["이름"])}</a>' for c in codes)
    salons = ""
    for s in D.살롱:
        head = f'<a href="{charpage(s["수장"])}">{E(사람[s["수장"]]["이름"])}</a>' if s["수장"] else "등록 인물이 아닙니다"
        salons += (f'<article class="salon"><img src="{place(s["코드"])}" alt="" loading="lazy" width="3200" height="640">'
                   f'<p class="en">{E(s["영문"])}</p><h3>{E(s["이름"])}</h3><p>{E(s["글"])}</p>'
                   f'<dl><dt>수장</dt><dd>{head}</dd><dt>소속</dt><dd>{names(s["소속"])}</dd></dl></article>')

    def eye_col(title, codes):
        btns = "".join(
            f'<button type="button" data-pick aria-pressed="{str(c == D.시선_따가움[0]).lower()}" data-set-name="{E(사람[c]["이름"])}" '
            f'data-set-eye="{E(사람[c]["눈"])}" data-set-turn="{E(사람[c]["풀리면"] or "")}" data-set-link="{charpage(c)}">{E(사람[c]["이름"])}</button>' for c in codes)
        return f'<div><h3>{E(title)}</h3><div class="chips">{btns}</div></div>'
    p0 = 사람[D.시선_따가움[0]]
    eyes = (f'<div class="eyes" data-picker><div class="eyecols">{eye_col("따갑게 보는 여섯", D.시선_따가움)}{eye_col("그렇지 않은 여섯", D.시선_아님)}</div>'
            f'<div class="eyeout"><h3 data-out="name">{E(p0["이름"])}</h3><p data-out="eye">{E(p0["눈"])}</p>'
            f'<p class="turn" data-out="turn">{E(p0["풀리면"] or "")}</p><a data-out="link" href="{charpage(p0["코드"])}">프로필 보기</a></div></div>')

    steps = " → ".join(E(s) for s in D.관계_단계)
    worse = " → ".join(E(s) for s in D.관계_악화)
    win = E(D.정보창_견본).replace("{전공}", '<span data-major>전공</span>')
    rows = "".join(f"<dt>{E(k)}</dt><dd>{E(v)}</dd>" for k, v in D.정보창_줄)
    stage_rows = "".join(f'<dt>{E(s["이름"])}</dt><dd>{E(s["글"])}</dd>' for s in D.무대)
    body = f"""<section class="head">{hd("학사", "THE ACADEMY")}<p>{E(D.학사_머리)}</p></section>
<section>{hd("살롱 넷", "FOUR SALONS")}<p>{E(D.살롱_머리)}</p><div class="salons">{salons}</div>
  <p class="note">어느 살롱에도 들지 않은 사람: {names(D.무소속)}</p>{salon_demo()}</section>
<section>{hd("무대", "THE STAGES")}<dl class="rows">{stage_rows}</dl><p class="note">{E(D.무대_맺음)}</p></section>
<section>{hd("학사력", "THE CALENDAR")}{calendar()}</section>
<section>{hd("추첨 입학생을 보는 눈", "SIX AND SIX")}<p>{E(D.시선_머리)}</p>{eyes}</section>
<section>{hd("사건", "INCIDENTS")}{ps(D.사건_글)}</section>
<section>{hd("판정", "JUDGEMENT")}{ps(D.판정_글)}<pre class="win">{E(D.평_견본)}</pre></section>
<section>{hd("관계", "RELATIONS")}<p class="ladder">{steps}</p><p class="ladder bad">{worse}</p>{ps(D.관계_글)}</section>
<section>{hd("정보창", "STATUS")}<p>{E(D.정보창_글)}</p><pre class="win">{win}</pre><dl class="rows">{rows}</dl></section>"""
    return page("academy.html", "학사", body, "academy")


def characters():
    filters = '<button type="button" data-filter="" aria-pressed="true">전체</button>' + "".join(
        f'<button type="button" data-filter="{E(k)}" aria-pressed="false">{E(k)}</button>' for k, _ in D.묶음)
    roster, panels = "", ""
    for i, p in enumerate(D.인물):
        c = p["코드"]
        roster += (f'<button type="button" data-tab="{c}" data-group="{E(p["묶음"])}" aria-pressed="{str(i == 0).lower()}">'
                   f'<b>{E(p["이름"])}</b><span>{E(p["줄"])}</span></button>')
        panels += (f'<article data-panel="{c}" id="{c.lower()}"{"" if i == 0 else " hidden"}>'
                   f'<img src="{card(c)}" alt="{E(p["이름"])}" {"" if i == 0 else "loading=\"lazy\" "}width="1856" height="1280">'
                   f'<p class="en">{E(p["줄"])}</p><h2>{E(p["이름"])}</h2><p>{E(p["소개"])}</p>'
                   f'<dl class="rows"><dt>나이</dt><dd>{p["나이"]}세</dd><dt>유저를 부르는 말</dt><dd>{E(p["호칭"])}</dd>'
                   f'<dt>추첨 입학생에게</dt><dd>{E(p["눈"])}</dd></dl>'
                   f'<a class="more" href="{charpage(c)}">프로필 보기</a></article>')
    body = f"""<section class="head">{hd("인물", "THE CAST")}<p>{E(D.인물_머리)}</p></section>
<section class="select" data-tabs data-filters>
  <div class="rosterside">
    <div class="seg" role="group" aria-label="묶음">{filters}</div>
    <div class="roster" role="group" aria-label="인물">{roster}</div>
  </div>
  <div class="stagebox">{panels}</div>
</section>"""
    return page("characters.html", "인물", body, "characters")


def char(i):
    p = D.인물[i]
    c = p["코드"]
    prev, nxt = D.인물[i - 1], D.인물[(i + 1) % len(D.인물)]
    looks = "".join(
        f'<button type="button" data-pick data-set-img="../{face(c, n)}" data-set-cap="{E(name)}" aria-pressed="{str(k == 0).lower()}">{E(name)}</button>'
        for k, (n, name) in enumerate(D.표정))
    rows = [("나이", f'{p["나이"]}세'), ("국적", p["국적"]), ("전공", p["줄"]), ("살롱", p["살롱"]),
            ("유저를 부르는 말", p["호칭"]), ("말투", p["말투"])]
    if p["대표곡"]:
        rows.append(("대표곡", p["대표곡"]))
    rows.append(("추첨 입학생에게", p["눈"]))
    if p["풀리면"]:
        rows.append(("풀리면", p["풀리면"]))
    dl = "".join(f"<dt>{E(k)}</dt><dd>{E(v)}</dd>" for k, v in rows)
    n0, name0 = D.표정[0]
    body = f"""<nav class="pager" aria-label="인물 이동">
  <a href="{prev["코드"].lower()}.html" data-key="q"><kbd>Q</kbd>{E(prev["이름"])}</a>
  <a href="../characters.html#{c.lower()}">명단</a>
  <a href="{nxt["코드"].lower()}.html" data-key="e">{E(nxt["이름"])}<kbd>E</kbd></a>
</nav>
<section class="prof">
  <img class="poster" src="../{card(c)}" alt="{E(p["이름"])}" width="1856" height="1280">
  <div class="profbody">
    <p class="en">{E(p["줄"])}</p>
    <h1>{E(p["이름"])}</h1>
    <p class="alias">{E(p["별명"])}</p>
    <p>{E(p["소개"])}</p>
    <dl class="rows">{dl}</dl>
  </div>
</section>
<section class="looks" data-picker data-arrows>{hd("표정", "EXPRESSIONS")}
  <figure><img data-out="img" src="../{face(c, n0)}" alt="{E(p["이름"])}" width="2304" height="960">
  <figcaption data-out="cap">{E(name0)}</figcaption></figure>
  <div class="chips" role="group" aria-label="표정">{looks}</div>
</section>"""
    return page(charpage(c), p["이름"], body, "char")


def start():
    tabs, panels = "", ""
    for i, m in enumerate(D.모드):
        tabs += (f'<button type="button" data-tab="{i}" id="mode-{i}" aria-pressed="{str(i == 0).lower()}">'
                 f'<span class="mark">{m["기호"]}</span><b>{E(m["이름"])}</b><span class="en">{E(m["영문"])}</span></button>')
        panels += (f'<div data-panel="{i}"{"" if i == 0 else " hidden"}><h3>{m["기호"]} {E(m["이름"])}</h3><p>{E(m["한줄"])}</p>{ps(m["글"])}'
                   f'<dl class="rows"><dt>난이도</dt><dd>{E(m["난이도"])}</dd></dl></div>')
    opts = "".join(f'<option>{E(m["이름"])}</option>' for m in D.모드)
    fields = "".join(
        f'<label>{E(label)}<{"textarea rows=\"3\"" if key == "경력" else "input"} name="{key}" data-label="{E(label)}">{"</textarea>" if key == "경력" else ""}</label>'
        for key, label in D.노트_칸)
    how = "".join(f"<dt>{E(k)}</dt><dd>{E(v)}</dd>" for k, v in D.플레이)
    go = f'<a class="play" href="{E(D.크랙_주소)}">PLAY</a>' if D.크랙_주소 else ""
    body = f"""<section class="head">{hd("시작", "THE BEGINNING")}<p>{E(D.시작_머리)}</p></section>
<section>{hd("세 가지 시작", "BEGINNINGS")}<p>{E(D.모드_머리)}</p>
  <div class="slots" data-tabs data-hash><div class="slotbtns" role="group" aria-label="시작 모드">{tabs}</div>{panels}</div>
</section>
<section>{hd("시작 전에", "BEFORE YOU BEGIN")}<p>{E(D.노트_글)}</p>
  <form class="notepad" data-notepad onsubmit="return false">
    <label>시작 모드<select name="모드" data-label="시작 모드">{opts}</select></label>
    {fields}
    <pre class="win" data-note-out aria-live="polite"></pre>
    <button type="button" data-copy data-done="{E(D.노트_복사됨)}">{E(D.노트_단추)}</button>
  </form>
</section>
<section>{hd("플레이", "HOW IT PLAYS")}<dl class="rows">{how}</dl></section>
<section>{hd("안내", "NOTICE")}<p>{E(D.안내)}</p>{go}</section>"""
    return page("start.html", "시작", body, "start")


def music():
    tracks = "".join(
        f'<li><img src="{E(t["표지"])}" alt="" loading="lazy"><h3>{E(t["제목"])}</h3><audio controls preload="none" src="{E(t["파일"])}"></audio></li>'
        for t in D.음악)
    return page("music.html", "음악", f'<section class="head">{hd("음악", "THE MUSIC")}</section><ul class="tracks">{tracks}</ul>', "music")


# ── 검사: 만든 뒤에 돌린다. 하나라도 걸리면 실패로 끝난다 ──────────
def check(files):
    errors = []
    # 1) 화면 문구에 줄표를 쓰지 않는다
    def walk(v, where):
        if isinstance(v, str):
            if re.search("[—–]", v):
                errors.append(f"줄표: {where}: {v[:40]}")
        elif isinstance(v, dict):
            for k, x in v.items():
                walk(x, f"{where}.{k}")
        elif isinstance(v, (list, tuple)):
            for k, x in enumerate(v):
                walk(x, f"{where}[{k}]")
    for name in dir(D):
        if not name.startswith("_"):
            walk(getattr(D, name), name)
    # 2) 쪽이 가리키는 그림과 쪽이 실제로 있다
    for f in files:
        text = (ROOT / f).read_text(encoding="utf-8")
        base = (ROOT / f).parent
        refs = re.findall(r'(?:src|href|data-set-img|data-set-link)="([^"#]+)(?:#[^"]*)?"', text)
        for r in set(refs):
            if r.startswith(("http", "mailto:")):
                continue
            if not (base / r.split("?", 1)[0]).exists():
                errors.append(f"없는 파일: {f} → {r}")
    # 3) 인물 열두 사람, 여섯 대 여섯
    codes = {p["코드"] for p in D.인물}
    if len(codes) != 12 or set(D.시선_따가움) | set(D.시선_아님) != codes or len(D.시선_따가움) != 6:
        errors.append("인물 12인 또는 여섯 대 여섯 구성이 맞지 않는다")
    return errors


if __name__ == "__main__":
    files = [home(), world(), academy(), characters(), start()] + [char(i) for i in range(len(D.인물))]
    if D.음악:
        files.append(music())
    errors = check(files)
    for e in errors:
        print("오류:", e)
    print(f"{len(files)}쪽 생성" + ("" if not errors else f", 오류 {len(errors)}건"))
    sys.exit(1 if errors else 0)
