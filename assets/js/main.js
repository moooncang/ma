// 음악원 소개 사이트 공용 동작. 쪽마다 다른 코드는 없고, html의 data-* 표시를 보고 붙는다.
//   data-tabs    > data-tab / data-panel   : 단추를 누르면 그 판만 보인다
//   data-picker  > data-pick / data-out    : 단추의 data-set-이름 값을 data-out="이름" 자리에 넣는다(그림은 src, 링크는 href)
//   data-react   > data-r / data-state     : 연주를 고르면 살롱 넷의 반응이 바뀐다
//   data-filters > data-filter / data-group: 묶음으로 명단을 거른다
//   data-notepad                            : 유저노트 초안
//   data-arrows                             : 좌우 화살표로 고른다
(() => {
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  // 안쪽에 같은 장치가 또 들어 있어도 제 것만 고른다
  const own = (box, attr, sel) => $$(sel, box).filter(n => n.closest(`[${attr}]`) === box);
  const press = (list, on) => list.forEach(b => b.setAttribute('aria-pressed', String(b === on)));

  function showTab(box, key) {
    own(box, 'data-tabs', '[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === key)));
    own(box, 'data-tabs', '[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== key; });
  }

  function pick(btn) {
    const box = btn.closest('[data-picker]');
    press(own(box, 'data-picker', '[data-pick]'), btn);
    for (const [k, v] of Object.entries(btn.dataset)) {
      if (!k.startsWith('set')) continue;
      own(box, 'data-picker', `[data-out="${k.slice(3).toLowerCase()}"]`).forEach(o => {
        if (o.tagName === 'IMG') o.src = v;
        else if (o.tagName === 'A') o.href = v;
        else { o.textContent = v; o.hidden = !v; }
      });
    }
  }

  document.addEventListener('click', e => {
    const tab = e.target.closest('[data-tab]');
    if (tab) return showTab(tab.closest('[data-tabs]'), tab.dataset.tab);

    const p = e.target.closest('[data-pick]');
    if (p) return pick(p);

    const r = e.target.closest('[data-r]');
    if (r) {
      const box = r.closest('[data-react]'), names = JSON.parse(box.dataset.names), states = r.dataset.r.split(',');
      press($$('[data-r]', box), r);
      $$('[data-state]', box).forEach((el, i) => { el.dataset.state = states[i]; el.textContent = names[states[i]]; });
      box.querySelector('[data-react-note]').textContent = r.dataset.note;
      return;
    }

    const f = e.target.closest('[data-filter]');
    if (f) {
      const box = f.closest('[data-filters]');
      press($$('[data-filter]', box), f);
      $$('[data-group]', box).forEach(el => { el.hidden = !!f.dataset.filter && el.dataset.group !== f.dataset.filter; });
    }
  });

  // 주소 끝의 #이름이 단추나 판을 가리키면 그것을 연다 (characters.html#b, start.html#mode-1)
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.closest('[data-tabs]')) showTab(target.closest('[data-tabs]'), target.dataset.tab || target.dataset.panel);

  // 키: 숫자는 쪽 이동, Q·E는 앞뒤 인물, 좌우 화살표는 고르기
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.matches?.('input, textarea, select')) return;
    const link = document.querySelector(`a[data-key="${e.key.toLowerCase()}"]`);
    if (link) return link.click();
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    const box = step && document.querySelector('[data-arrows]');
    if (!box) return;
    const list = own(box, 'data-picker', '[data-pick]');
    const next = list[(list.findIndex(b => b.getAttribute('aria-pressed') === 'true') + step + list.length) % list.length];
    pick(next);
    next.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    e.preventDefault();
  });

  // 유저노트 초안. 적은 전공은 기억해 두었다가 정보창 견본에 넣는다
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const note = document.querySelector('[data-notepad]');
  if (note) {
    const out = note.querySelector('[data-note-out]'), fields = $$('[name]', note), copy = note.querySelector('[data-copy]');
    const major = fields.find(f => f.name === '전공');
    major.value = store.get('mu-major') || '';
    const render = () => {
      out.textContent = fields.filter(f => f.value.trim()).map(f => `[${f.dataset.label}] ${f.value.trim()}`).join('\n');
      store.set('mu-major', major.value.trim());
    };
    note.addEventListener('input', render);
    // 위에서 고른 시작 모드를 초안에도 맞춘다
    const mode = fields.find(f => f.name === '모드');
    const sync = () => { const on = document.querySelector('.slots [data-tab][aria-pressed="true"]'); if (on) mode.selectedIndex = +on.dataset.tab; render(); };
    document.addEventListener('click', e => { if (e.target.closest('.slots [data-tab]')) sync(); });
    sync();
    const label = copy.textContent;
    copy.addEventListener('click', () => navigator.clipboard.writeText(out.textContent).then(() => {
      copy.textContent = copy.dataset.done;
      setTimeout(() => { copy.textContent = label; }, 1600);
    }));
  }
  const major = store.get('mu-major');
  if (major) $$('[data-major]').forEach(el => { el.textContent = major; });
})();
