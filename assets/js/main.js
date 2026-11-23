// Shared site controls. Visual motion never delays data, selection, or accessible state.
(() => {
  const main = document.querySelector('main');
  if (!main || main.dataset.siteInitialized) return;
  main.dataset.siteInitialized = 'true';
  const $$ = (selector, box = document) => [...box.querySelectorAll(selector)];
  const own = (box, attr, selector) => $$(selector, box).filter(el => el.closest(`[${attr}]`) === box);
  const press = (list, selected) => list.forEach(btn => btn.setAttribute('aria-pressed', String(btn === selected)));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const animations = new Set(), channels = new WeakMap(), imageJobs = new WeakMap(), overlays = new Set();
  const bursts = new Map(), dirtyGalleries = new Set();
  const expressions = new WeakMap(), activeExpressions = new Set();
  let frame = 0, scrollDirty = true, sleeping = false, activeCard = null, pointer = null, drag = null, weekDrag = null;
  let viewer = null, viewerImage = null, viewerOpener = null;

  function animate(el, keyframes, options = {}, channel = 'default') {
    if (!el || reduced.matches || sleeping || document.hidden || !el.animate) return null;
    const current = channels.get(el) || new Map();
    current.get(channel)?.cancel();
    const animation = el.animate(keyframes, { duration: 620, easing: ease, ...options });
    current.set(channel, animation); channels.set(el, current); animations.add(animation);
    animation.finished.catch(() => {}).finally(() => {
      animations.delete(animation);
      if (current.get(channel) === animation) current.delete(channel);
    });
    return animation;
  }

  function enterPanel(panel) {
    animate(panel, [{ opacity: .3, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }]);
    const img = panel.querySelector('img');
    animate(img, [{ clipPath: 'inset(0 0 14% 0)' }, { clipPath: 'inset(0)' }], { duration: 850 }, 'image');
  }

  function burst(control, event) {
    if (reduced.matches || sleeping || document.hidden || control.disabled) return;
    // At most three short-lived bursts, irrespective of how quickly a control is used.
    if (bursts.size >= 3) {
      const [old, timer] = bursts.entries().next().value; clearTimeout(timer); old.remove(); bursts.delete(old);
    }
    const rect = control.getBoundingClientRect(), effect = document.createElement('span');
    const x = event?.detail ? event.clientX : rect.left + rect.width / 2, y = event?.detail ? event.clientY : rect.top + rect.height / 2;
    effect.className = 'control-burst'; effect.setAttribute('aria-hidden', 'true');
    effect.style.left = `${x}px`; effect.style.top = `${y}px`;
    for (let index = 0; index < 7; index++) {
      const spark = document.createElement('i'), angle = index / 7 * Math.PI * 2, distance = 23 + index % 3 * 9;
      spark.style.setProperty('--spark-x', `${Math.cos(angle) * distance}px`);
      spark.style.setProperty('--spark-y', `${Math.sin(angle) * distance}px`);
      effect.append(spark);
    }
    document.body.append(effect);
    bursts.set(effect, setTimeout(() => { effect.remove(); bursts.delete(effect); }, 720));
  }

  function syncWeeks(box) {
    const weeks = box?.querySelector('.weeks'); if (!weeks) return;
    weeks.classList.toggle('is-overflowing', weeks.scrollWidth > weeks.clientWidth + 1);
    const list = $$('[data-pick]', weeks), index = Math.max(0, list.findIndex(button => button.getAttribute('aria-pressed') === 'true'));
    box.style.setProperty('--week-index', String(index));
    box.style.setProperty('--week-progress', String(index / Math.max(1, list.length - 1)));
    $$('[data-week-step]', box).forEach(button => { button.disabled = +button.dataset.weekStep < 0 ? index === 0 : index === list.length - 1; });
    const calendar = box.closest('[data-calendar]');
    if (calendar && !box.hidden) calendar.dataset.term = box.dataset.season || '';
  }

  function stepWeek(box, move, focus = false) {
    const list = $$('.weeks [data-pick]', box), current = list.findIndex(button => button.getAttribute('aria-pressed') === 'true');
    const index = move === 'first' ? 0 : move === 'last' ? list.length - 1 : Math.max(0, Math.min(list.length - 1, current + move));
    const next = list[index]; if (!next) return;
    pick(next);
    if (focus) next.focus({ preventScroll: true });
    // Keep keyboard focus in view without moving the document to the top of a section.
    const weeks = next.closest('.weeks');
    if (weeks.scrollWidth > weeks.clientWidth) weeks.scrollTo({ left: weeks.scrollLeft + next.getBoundingClientRect().left - weeks.getBoundingClientRect().left - (weeks.clientWidth - next.offsetWidth) / 2, behavior: reduced.matches ? 'instant' : 'smooth' });
  }

  function stepGallery(control) {
    const gallery = control.closest('[data-gallery]')?.querySelector('.slides'); if (!gallery) return;
    const cards = $$('.slide', gallery).filter(card => !card.hidden), distance = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0]?.offsetWidth || gallery.clientWidth;
    gallery.scrollBy({ left: distance * +control.dataset.galleryStep, behavior: reduced.matches ? 'instant' : 'smooth' });
  }

  function updateGallery(gallery) {
    const wrapper = gallery.closest('[data-gallery]'); if (!wrapper) return;
    const max = gallery.scrollWidth - gallery.clientWidth, progress = max > 0 ? Math.max(0, Math.min(1, gallery.scrollLeft / max)) : 0;
    wrapper.style.setProperty('--gallery-progress', String(progress));
    $$('[data-gallery-step]', wrapper).forEach(button => { button.disabled = +button.dataset.galleryStep < 0 ? gallery.scrollLeft <= 1 : gallery.scrollLeft >= max - 1; });
  }

  function showTab(box, key, motion = true, address = false) {
    if (!box) return;
    const panels = own(box, 'data-tabs', '[data-panel]');
    const next = panels.find(panel => panel.dataset.panel === key);
    if (!next) return;
    const changed = next.hidden;
    const buttons = own(box, 'data-tabs', '[data-tab]');
    const button = buttons.find(btn => btn.dataset.tab === key);
    press(buttons, button);
    panels.forEach(panel => { panel.hidden = panel !== next; });
    syncWeeks(next);
    if (changed && motion) enterPanel(next);
    if (address && (box.hasAttribute('data-hash') || box.classList.contains('select'))) {
      const id = next.id || button?.id;
      if (id) history.replaceState(null, '', `#${encodeURIComponent(id)}`);
    }
    box.dispatchEvent(new CustomEvent('site:tabchange', { bubbles: true }));
    scrollDirty = true; queueFrame();
  }

  function swapImage(img, source, direction = 0) {
    if (img.getAttribute('src') === source) return;
    const previous = imageJobs.get(img);
    const previousSource = previous?.overlay?.src || img.currentSrc || img.src;
    if (previous?.overlay) { previous.overlay.remove(); overlays.delete(previous.overlay); }
    const job = {}; imageJobs.set(img, job);
    if (!reduced.matches && (previous?.overlay || (img.complete && img.naturalWidth)) && img.offsetWidth) {
      const parent = img.parentElement, rect = img.getBoundingClientRect(), bounds = parent.getBoundingClientRect();
      const style = getComputedStyle(img), overlay = document.createElement('img');
      if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
      overlay.src = previousSource; overlay.alt = ''; overlay.setAttribute('aria-hidden', 'true');
      overlay.className = 'motion-image-copy';
      Object.assign(overlay.style, {
        left: `${rect.left - bounds.left - parent.clientLeft}px`, top: `${rect.top - bounds.top - parent.clientTop}px`,
        width: `${rect.width}px`, height: `${rect.height}px`, objectFit: style.objectFit,
        objectPosition: style.objectPosition, borderRadius: style.borderRadius
      });
      parent.append(overlay); job.overlay = overlay; overlays.add(overlay);
    }
    img.src = source;
    const decoded = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    decoded.then(() => {
      if (imageJobs.get(img) !== job) return;
      const overlay = job.overlay;
      if (overlay) {
        const transition = animate(overlay, [{ opacity: 1 }, { opacity: 0 }], { duration: 500 }, 'image');
        const clean = () => { overlay.remove(); overlays.delete(overlay); if (job.overlay === overlay) job.overlay = null; };
        if (transition) transition.finished.then(clean, clean); else clean();
      }
      const mask = direction > 0 ? 'inset(0 13% 0 0)' : direction < 0 ? 'inset(0 0 0 13%)' : 'inset(0 0 10% 0)';
      animate(img, [{ clipPath: mask }, { clipPath: 'inset(0)' }], { duration: 750 }, 'image');
      scrollDirty = true; queueFrame();
    });
  }

  function pick(button) {
    if (!button) return;
    const box = button.closest('[data-picker]');
    const list = own(box, 'data-picker', '[data-pick]'), previous = list.findIndex(item => item.getAttribute('aria-pressed') === 'true');
    const isWeek = !!button.closest('.weeks'), direction = isWeek ? Math.sign(list.indexOf(button) - previous) : 0;
    const details = button.closest('details'); if (details) details.open = true;
    press(list, button);
    if (isWeek) {
      box.style.setProperty('--selection-direction', String(direction || 1)); syncWeeks(box);
      const glint = box.querySelector('.calendar-glint');
      if (direction) animate(glint, [{ opacity: 0, translate: `${direction * -110}% 0` }, { opacity: .75, offset: .4 }, { opacity: 0, translate: `${direction * 110}% 0` }], { duration: 700 }, 'glint');
    }
    for (const [key, value] of Object.entries(button.dataset)) {
      if (!key.startsWith('set')) continue;
      own(box, 'data-picker', `[data-out="${key.slice(3).toLowerCase()}"]`).forEach(output => {
        if (output.tagName === 'IMG') swapImage(output, value, direction);
        else if (output.tagName === 'A') output.href = value;
        else {
          output.textContent = value; output.hidden = !value;
          animate(output, [{ opacity: .2, transform: direction ? `translateX(${direction * 16}px)` : 'translateY(9px)' }, { opacity: 1, transform: 'none' }], { duration: 450 });
        }
      });
    }
    scrollDirty = true; queueFrame();
  }

  function filter(button, motion = true) {
    const box = button.closest('[data-filters]');
    press($$('[data-filter]', box), button);
    const entries = $$('[data-group]', box);
    entries.forEach(el => { el.hidden = !!button.dataset.filter && el.dataset.group !== button.dataset.filter; });
    const selected = entries.find(el => el.getAttribute('aria-pressed') === 'true');
    if (selected?.hidden) {
      const first = entries.find(el => !el.hidden && el.hasAttribute('data-tab'));
      if (first) showTab(first.closest('[data-tabs]'), first.dataset.tab, motion, true);
    }
    if (motion) entries.filter(el => !el.hidden).forEach((el, index) => {
      animate(el, [{ opacity: .25, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { delay: index * 30, duration: 420 });
    });
    scrollDirty = true; queueFrame();
  }

  document.addEventListener('click', event => {
    const control = event.target.closest('[data-tab], [data-pick], [data-r], [data-filter], [data-week-step], [data-gallery-step]');
    if (control && event.isTrusted) burst(control, event);
    const weekStep = event.target.closest('[data-week-step]');
    if (weekStep) return stepWeek(weekStep.closest('[data-picker]'), +weekStep.dataset.weekStep);
    const galleryStep = event.target.closest('[data-gallery-step]');
    if (galleryStep) return stepGallery(galleryStep);
    const salon = event.target.closest('[data-salon-select]');
    if (salon) {
      burst(salon, event);
      const selected = $$('[data-r]', salon.closest('[data-react]')).find(button => button.dataset.r.split(',')[+salon.dataset.salonSelect] === '1');
      selected?.click(); return;
    }
    const tab = event.target.closest('[data-tab]');
    if (tab) return showTab(tab.closest('[data-tabs]'), tab.dataset.tab, true, true);
    const selected = event.target.closest('[data-pick]');
    if (selected) return pick(selected);
    const reaction = event.target.closest('[data-r]');
    if (reaction) {
      const box = reaction.closest('[data-react]'), names = JSON.parse(box.dataset.names), states = reaction.dataset.r.split(',');
      press($$('[data-r]', box), reaction);
      $$('[data-state]', box).forEach((el, index) => {
        el.dataset.state = states[index]; el.textContent = names[states[index]];
        const row = el.closest('li'), art = row?.querySelector('.salon-art img');
        if (row) {
          row.dataset.reaction = states[index];
          row.querySelector('[data-salon-select]')?.setAttribute('aria-pressed', String(states[index] === '1'));
        }
        animate(row || el, [{ opacity: .35, transform: 'translateY(14px) scale(.97)' }, { opacity: 1, transform: 'none' }], { delay: index * 75, duration: 650 });
        if (states[index] !== '0') animate(art, [{ opacity: .65, scale: '1.045' }, { opacity: 1, scale: '1' }], { delay: index * 75, duration: 1000 }, 'salon-art');
      });
      const note = box.querySelector('[data-react-note]');
      note.textContent = reaction.dataset.note;
      animate(note, [{ opacity: .25, transform: 'translateX(12px)' }, { opacity: 1, transform: 'none' }]);
      return;
    }
    const selectedFilter = event.target.closest('[data-filter]');
    if (selectedFilter) filter(selectedFilter);
  });

  function resolveHash(motion = true) {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = id ? document.getElementById(id) : null, box = target?.closest('[data-tabs]');
    if (!box) return;
    const key = target.dataset.tab || target.dataset.panel;
    const tab = own(box, 'data-tabs', '[data-tab]').find(button => button.dataset.tab === key);
    if (tab?.hidden) {
      const all = box.querySelector('[data-filter=""]');
      if (all) filter(all, false);
    }
    showTab(box, key, motion);
  }
  addEventListener('hashchange', () => resolveHash());

  addEventListener('keydown', event => {
    if (viewer?.open) return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.target.closest?.('input,textarea,select,[contenteditable="true"]')) return;
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    const calendar = event.target.closest('[data-calendar]');
    if (calendar && (step || event.key === 'Home' || event.key === 'End')) {
      const box = calendar.querySelector('[data-picker]:not([hidden])');
      if (box) { stepWeek(box, step || (event.key === 'Home' ? 'first' : 'last'), true); event.preventDefault(); }
      return;
    }
    const link = $$('a[data-key]').find(anchor => anchor.dataset.key === event.key.toLowerCase());
    if (link) { event.preventDefault(); link.click(); return; }
    if (!step) return;
    const gallery = event.target.closest('.slides');
    if (gallery) {
      const cards = $$('.slide', gallery).filter(card => !card.hidden), current = cards.indexOf(event.target.closest('.slide'));
      const next = cards[Math.max(0, Math.min(cards.length - 1, current < 0 ? 0 : current + step))];
      next?.focus({ preventScroll: true });
      next?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced.matches ? 'instant' : 'smooth' });
      event.preventDefault(); return;
    }
    const box = document.querySelector('[data-arrows]');
    if (!box) return;
    const list = own(box, 'data-picker', '[data-pick]');
    const next = list[(list.findIndex(button => button.getAttribute('aria-pressed') === 'true') + step + list.length) % list.length];
    pick(next); next?.focus({ preventScroll: true }); next?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); event.preventDefault();
  });

  const store = { get: key => { try { return localStorage.getItem(key); } catch { return null; } }, set: (key, value) => { try { localStorage.setItem(key, value); } catch {} } };
  const note = document.querySelector('[data-notepad]');
  if (note) {
    const output = note.querySelector('[data-note-out]'), fields = $$('[name]', note), copy = note.querySelector('[data-copy]');
    const major = fields.find(field => field.name === '전공'), mode = fields.find(field => field.name === '모드');
    major.value = store.get('mu-major') || '';
    const render = () => {
      output.textContent = fields.filter(field => field.value.trim()).map(field => `[${field.dataset.label}] ${field.value.trim()}`).join('\n');
      store.set('mu-major', major.value.trim());
    };
    note.addEventListener('input', render);
    const sync = () => { const selected = document.querySelector('.slots [data-tab][aria-pressed="true"]'); if (selected) mode.selectedIndex = +selected.dataset.tab; render(); };
    document.addEventListener('site:tabchange', event => { if (event.target.classList.contains('slots')) sync(); });
    sync();
    const label = copy.textContent; let copyTimer;
    copy.addEventListener('click', async () => {
      let copied = false;
      try { if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(output.textContent); copied = true; } } catch {}
      if (!copied) {
        const selection = getSelection(), range = document.createRange(); range.selectNodeContents(output);
        selection.removeAllRanges(); selection.addRange(range);
        try { copied = document.execCommand('copy'); } catch {}
        if (copied) selection.removeAllRanges();
      }
      if (copied) {
        clearTimeout(copyTimer); copy.textContent = copy.dataset.done;
        copyTimer = setTimeout(() => { copy.textContent = label; }, 1600);
      }
    });
  }
  const major = store.get('mu-major');
  if (major) $$('[data-major]').forEach(el => { el.textContent = major; });
  $$('.salonrows [data-state]').forEach(el => { el.closest('li').dataset.reaction = el.dataset.state; });
  resolveHash(false);

  // One native modal serves every designated image; the underlying page stays inert.
  const zoomTargets = new WeakMap();
  const zoomIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M3 3l6 6m12-6-6 6M3 21l6-6m12 6-6-6"/></svg>';
  function ensureViewer() {
    if (viewer) return;
    viewer = document.createElement('dialog'); viewer.className = 'image-viewer'; viewer.dataset.imageViewer = '';
    viewer.setAttribute('aria-label', '이미지 크게 보기');
    const stage = document.createElement('div'); stage.className = 'viewer-stage';
    viewerImage = document.createElement('img'); viewerImage.alt = ''; viewerImage.draggable = false; stage.append(viewerImage);
    const actions = document.createElement('div'); actions.className = 'viewer-actions';
    const magnify = document.createElement('button'); magnify.type = 'button'; magnify.dataset.zoomToggle = '';
    magnify.setAttribute('aria-label', '원본 크기로 보기'); magnify.setAttribute('aria-pressed', 'false'); magnify.innerHTML = zoomIcon;
    const close = document.createElement('button'); close.type = 'button'; close.dataset.zoomClose = ''; close.autofocus = true;
    close.setAttribute('aria-label', '닫기'); close.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg>';
    actions.append(magnify, close); viewer.append(stage, actions); document.body.append(viewer);
    const toggle = () => {
      const enlarged = viewer.classList.toggle('is-magnified'); magnify.setAttribute('aria-pressed', String(enlarged));
      stage.scrollTo({ left: 0, top: 0, behavior: 'instant' });
    };
    magnify.addEventListener('click', toggle);
    viewerImage.addEventListener('dblclick', () => { if (finePointer.matches) toggle(); });
    close.addEventListener('click', () => viewer.close());
    let backdropDown = false;
    viewer.addEventListener('pointerdown', event => { backdropDown = event.target === viewer || event.target === stage; });
    viewer.addEventListener('click', event => { if (backdropDown && (event.target === viewer || event.target === stage)) viewer.close(); });
    viewer.addEventListener('close', () => {
      document.body.classList.remove('image-viewer-open'); viewer.classList.remove('is-magnified');
      magnify.setAttribute('aria-pressed', 'false'); viewerImage.removeAttribute('src');
      channels.get(viewerImage)?.forEach(animation => animation.cancel());
      if (!sleeping && viewerOpener?.isConnected) viewerOpener.focus({ preventScroll: true });
      viewerOpener = null;
    });
  }
  function openImage(image, opener) {
    ensureViewer(); if (viewer.open) return;
    resetCard(); endDrag(); endWeekDrag();
    viewerOpener = opener || document.activeElement;
    viewerImage.src = image.dataset.zoomSrc || image.src || image.currentSrc;
    viewerImage.alt = image.alt || image.closest('figure')?.querySelector('[data-out="cap"]')?.textContent || '';
    document.body.classList.add('image-viewer-open'); viewer.showModal();
    animate(viewer, [{ opacity: 0 }, { opacity: 1 }], { duration: 240 }, 'viewer');
    animate(viewerImage, [{ opacity: .4, scale: '.97' }, { opacity: 1, scale: '1' }], { duration: 450 }, 'viewer');
  }
  $$('[data-zoom]').forEach(marker => {
    if (marker.closest('a')) return;
    const image = marker.matches('img') ? marker : marker.querySelector('img'); if (!image) return;
    const parent = marker.matches('img') ? marker.parentElement : marker;
    parent.removeAttribute('aria-hidden');
    if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'image-zoom-trigger'; button.dataset.zoomOpen = '';
    button.setAttribute('aria-label', '이미지 크게 보기'); button.innerHTML = zoomIcon; parent.append(button);
    button.addEventListener('click', () => openImage(image, button));
    zoomTargets.set(marker, { image, button });
  });
  document.addEventListener('click', event => {
    if (event.target.tagName !== 'IMG') return;
    const target = zoomTargets.get(event.target.closest('[data-zoom]'));
    if (target && event.target === target.image) openImage(target.image, target.button);
  });

  // Pointer work, scroll progress, and mouse dragging share one event-driven frame.
  function resetCard() {
    if (activeCard) {
      activeCard.classList.remove('is-pointer-active');
      activeCard.style.removeProperty('--tilt-x'); activeCard.style.removeProperty('--tilt-y');
      activeCard.style.removeProperty('--art-shift-x'); activeCard.style.removeProperty('--art-shift-y');
    }
    activeCard = null; pointer = null;
  }
  function queueFrame() { if (!frame && !sleeping && !document.hidden) frame = requestAnimationFrame(paintFrame); }
  function paintFrame() {
    frame = 0;
    if (sleeping || document.hidden) return;
    if (scrollDirty) {
      const max = document.documentElement.scrollHeight - innerHeight;
      document.body.style.setProperty('--scroll-progress', String(max > 0 ? Math.max(0, Math.min(1, scrollY / max)) : 0));
      document.body.style.setProperty('--hero-drift', String(reduced.matches ? 0 : Math.min(scrollY, innerHeight) * .13));
      document.querySelector('.top')?.classList.toggle('is-scrolled', scrollY > 24);
      scrollDirty = false;
    }
    if (activeCard && pointer) {
      const rect = activeCard.getBoundingClientRect(), x = (pointer.x - rect.left) / rect.width, y = (pointer.y - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) resetCard();
      else {
        const isArt = activeCard.matches('.art-frame[data-art]'), depth = isArt ? .35 : 1;
        activeCard.style.setProperty('--tilt-x', `${(y - .5) * -5 * depth}deg`);
        activeCard.style.setProperty('--tilt-y', `${(x - .5) * 7 * depth}deg`);
        if (isArt) {
          activeCard.style.setProperty('--art-shift-x', `${(x - .5) * -8}px`);
          activeCard.style.setProperty('--art-shift-y', `${(y - .5) * -6}px`);
        }
        activeCard.style.setProperty('--spot-x', `${x * 100}%`); activeCard.style.setProperty('--spot-y', `${y * 100}%`);
      }
    }
    if (drag?.active && drag.next !== undefined) { drag.box.scrollLeft = drag.next; drag.next = undefined; }
    if (weekDrag?.active && weekDrag.point) scrubWeek(weekDrag);
    dirtyGalleries.forEach(updateGallery); dirtyGalleries.clear();
  }
  const scroll = () => { scrollDirty = true; $$('.slides').forEach(gallery => dirtyGalleries.add(gallery)); queueFrame(); };
  addEventListener('scroll', scroll, { passive: true });
  addEventListener('resize', () => { scroll(); $$('[data-week-scrub]').forEach(weeks => syncWeeks(weeks.closest('[data-picker]'))); }, { passive: true });
  main.addEventListener('load', scroll, true);
  if ('ResizeObserver' in window) new ResizeObserver(scroll).observe(main);

  function setExpression(card, kind, value) {
    const state = expressions.get(card); if (!state) return;
    state[kind] = value; state.wanted = finePointer.matches && !sleeping && (state.hover || state.focus);
    const version = ++state.version;
    if (!state.wanted) {
      activeExpressions.delete(card);
      if (!state.image?.isConnected) return;
      const opacity = getComputedStyle(state.image).opacity; state.image.style.opacity = '0';
      const fade = animate(state.image, [{ opacity }, { opacity: 0 }], { duration: 320 }, 'hero-expression');
      const remove = () => { if (!state.wanted && state.version === version) state.image.remove(); };
      if (fade) fade.finished.then(remove, remove); else remove();
      return;
    }
    activeExpressions.add(card);
    if (!state.image) {
      const image = document.createElement('img'); image.className = 'hero-expression'; image.alt = '';
      image.setAttribute('aria-hidden', 'true'); image.decoding = 'async'; image.draggable = false; image.style.opacity = '0';
      // These expression panoramas are 12:5; account for the crop's height as well as its width.
      const pixels = Math.max(card.clientWidth, card.clientHeight * 2.4) * (devicePixelRatio || 1);
      image.src = pixels > 480 || !card.dataset.portraitActiveSmall ? card.dataset.portraitActive : card.dataset.portraitActiveSmall;
      state.image = image;
      state.ready = image.decode().then(() => true, () => false);
    }
    state.ready.then(loaded => {
      if (!loaded || !state.wanted || version !== state.version || sleeping) return;
      if (!state.image.isConnected) card.append(state.image);
      const opacity = getComputedStyle(state.image).opacity; state.image.style.opacity = '1';
      animate(state.image, [{ opacity }, { opacity: 1 }], { duration: 620 }, 'hero-expression');
    });
  }
  function resetExpressions() {
    [...activeExpressions].forEach(card => { const state = expressions.get(card); state.hover = false; setExpression(card, 'focus', false); });
  }
  $$('.hero .fig[data-portrait-active]').forEach(card => {
    expressions.set(card, { hover: false, focus: false, wanted: false, version: 0, image: null });
    card.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') setExpression(card, 'hover', true); });
    card.addEventListener('pointerleave', () => setExpression(card, 'hover', false));
    card.addEventListener('focusin', () => setExpression(card, 'focus', true));
    card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) setExpression(card, 'focus', false); });
  });

  $$('.fig, .slide, .mode, .salon, .stagebox > article, .art-frame[data-art]').forEach(card => {
    card.classList.add('motion-card');
    const spotlight = document.createElement('i'); spotlight.className = 'motion-spotlight'; spotlight.setAttribute('aria-hidden', 'true'); card.append(spotlight);
    card.addEventListener('pointermove', event => {
      if (reduced.matches || !finePointer.matches || event.pointerType === 'touch' || drag?.active || weekDrag?.active) return;
      if (event.target.closest('.motion-card') !== card) return;
      if (activeCard !== card) { resetCard(); activeCard = card; card.classList.add('is-pointer-active'); }
      pointer = { x: event.clientX, y: event.clientY }; queueFrame();
    }, { passive: true });
    card.addEventListener('pointerleave', () => { if (activeCard === card) resetCard(); });
    card.addEventListener('focusin', () => card.classList.add('is-focused'));
    card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) card.classList.remove('is-focused'); });
  });

  function endDrag() {
    const state = drag; if (!state) return;
    drag = null;
    if (state.active) {
      if (state.next !== undefined) state.box.scrollLeft = state.next;
      state.box.dataset.suppressClickUntil = String(performance.now() + 300);
    }
    state.box.classList.remove('is-dragging');
    if (state.box.hasPointerCapture(state.id)) state.box.releasePointerCapture(state.id);
  }
  $$('.slides').forEach(box => {
    box.tabIndex = 0;
    dirtyGalleries.add(box);
    box.addEventListener('scroll', () => { dirtyGalleries.add(box); queueFrame(); }, { passive: true });
    box.addEventListener('pointerdown', event => {
      box.dataset.suppressClickUntil = '0';
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      drag = { box, id: event.pointerId, x: event.clientX, start: box.scrollLeft, active: false };
    });
    box.addEventListener('pointermove', event => {
      if (!drag || drag.box !== box || drag.id !== event.pointerId) return;
      const distance = event.clientX - drag.x;
      if (!drag.active && Math.abs(distance) > 8) {
        drag.active = true; box.classList.add('is-dragging'); box.setPointerCapture(event.pointerId); resetCard();
      }
      if (drag.active) { event.preventDefault(); drag.next = drag.start - distance; queueFrame(); }
    });
    box.addEventListener('pointerup', endDrag); box.addEventListener('pointercancel', endDrag); box.addEventListener('lostpointercapture', endDrag);
    box.addEventListener('pointerleave', () => { if (drag?.box === box && !drag.active) endDrag(); });
    box.addEventListener('dragstart', event => event.preventDefault());
    box.addEventListener('click', event => {
      if (event.detail > 0 && performance.now() < Number(box.dataset.suppressClickUntil || 0)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
  });

  function scrubWeek(state) {
    const point = state.point; state.point = null;
    if (!point) return;
    let closest = null, distance = Infinity;
    $$('[data-pick]', state.box).forEach(button => {
      const rect = button.getBoundingClientRect(); if (!rect.width) return;
      const delta = (point.x - rect.left - rect.width / 2) ** 2 + (point.y - rect.top - rect.height / 2) ** 2;
      if (delta < distance) { closest = button; distance = delta; }
    });
    if (closest && closest.getAttribute('aria-pressed') !== 'true') pick(closest);
    state.selected = closest;
  }
  function endWeekDrag(focus = false) {
    const state = weekDrag; if (!state) return;
    weekDrag = null;
    if (state.active) {
      if (state.point) scrubWeek(state);
      state.box.dataset.suppressClickUntil = String(performance.now() + 300);
      if (focus) state.selected?.focus({ preventScroll: true });
    }
    state.box.classList.remove('is-scrubbing');
    if (state.box.hasPointerCapture(state.id)) state.box.releasePointerCapture(state.id);
  }
  $$('[data-week-scrub]').forEach(box => {
    syncWeeks(box.closest('[data-picker]'));
    const scene = box.closest('[data-picker]').querySelector('.calendar-scene');
    if (scene) { const glint = document.createElement('i'); glint.className = 'calendar-glint'; glint.setAttribute('aria-hidden', 'true'); scene.append(glint); }
    box.addEventListener('pointerdown', event => {
      box.dataset.suppressClickUntil = '0';
      if (event.button !== 0) return;
      // An overflowing touch strip must keep native panning, including momentum.
      if (event.pointerType === 'touch' && box.scrollWidth > box.clientWidth + 1) return;
      weekDrag = { box, id: event.pointerId, x: event.clientX, y: event.clientY, active: false };
    });
    box.addEventListener('pointermove', event => {
      if (!weekDrag || weekDrag.box !== box || weekDrag.id !== event.pointerId) return;
      const dx = Math.abs(event.clientX - weekDrag.x), dy = Math.abs(event.clientY - weekDrag.y);
      if (!weekDrag.active && dy > 8 && dy > dx) { endWeekDrag(); return; }
      if (!weekDrag.active && dx > 8 && dx > dy * 1.35) {
        weekDrag.active = true; box.setPointerCapture(event.pointerId); box.classList.add('is-scrubbing'); resetCard();
      }
      if (weekDrag.active) { event.preventDefault(); weekDrag.point = { x: event.clientX, y: event.clientY }; queueFrame(); }
    });
    box.addEventListener('pointerup', () => endWeekDrag(true));
    box.addEventListener('pointercancel', () => endWeekDrag()); box.addEventListener('lostpointercapture', () => endWeekDrag());
    box.addEventListener('pointerleave', () => { if (weekDrag?.box === box && !weekDrag.active) endWeekDrag(); });
    box.addEventListener('dragstart', event => event.preventDefault());
    box.addEventListener('click', event => {
      if (event.detail > 0 && performance.now() < Number(box.dataset.suppressClickUntil || 0)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
  });

  // Sections remain fully readable without JavaScript, at entry, and under reduced motion.
  const sections = $$('main > section:not(.hero), main > nav');
  const artFrames = $$('.art-frame[data-art]'), revealedArt = new WeakSet();
  function revealArt(art, motion = true) {
    if (revealedArt.has(art)) return;
    revealedArt.add(art); art.classList.add('is-art-revealed');
    const img = art.querySelector(':scope > img, :scope > picture > img');
    if (!motion || !img) return;
    const enter = () => {
      const rect = art.getBoundingClientRect();
      if (!img.naturalWidth || rect.bottom <= 0 || rect.top >= innerHeight) return;
      animate(img, [{ opacity: .45, clipPath: 'inset(0 0 28% 0)' }, { opacity: 1, clipPath: 'inset(0)' }], { duration: 1200 }, 'art-reveal');
    };
    if (img.complete) enter();
    else img.addEventListener('load', enter, { once: true });
  }
  function reveal(section, stagger = true) {
    if (section.classList.contains('is-revealed')) return;
    section.classList.add('is-revealed');
    if (stagger) $$('.modes > .mode, .salons > .salon, .salonrows > li', section).forEach((el, index) => {
      animate(el, [{ opacity: .2, translate: '0 26px' }, { opacity: 1, translate: '0 0' }], { delay: index * 65, duration: 750 });
    });
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (entry.target.matches('.art-frame[data-art]')) revealArt(entry.target);
      if (entry.target.hasAttribute('data-reveal')) reveal(entry.target);
      observer.unobserve(entry.target);
    }
  }), { threshold: .04, rootMargin: '0px 0px -4% 0px' }) : null;
  sections.forEach((section, index) => {
    section.dataset.reveal = ''; section.style.setProperty('--reveal-delay', `${index % 3 * 35}ms`);
    if (!observer || reduced.matches || section.getBoundingClientRect().top < innerHeight) reveal(section, false);
    else observer.observe(section);
  });
  artFrames.forEach(art => {
    if (!observer || reduced.matches || art.getBoundingClientRect().top < innerHeight) revealArt(art, !!observer && !reduced.matches && !document.getElementById('site'));
    else observer.observe(art);
  });
  main.addEventListener('focusin', event => { const section = event.target.closest('[data-reveal]'); if (section) reveal(section, false); });
  document.documentElement.classList.add('site-motion');
  // Dynamic entry already reveals its mounted hero. Never start a second entrance.
  if (!document.getElementById('site')) {
    $$('.hero .hero-copy > *, .hero > .en, .hero > h1, .hero > .genre').forEach((el, index) => {
      animate(el, [{ opacity: .4, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { delay: index * 90, duration: 950 });
    });
    $$('.hero .fig').forEach((el, index) => animate(el, [{ opacity: .3 }, { opacity: 1 }], { delay: index * 70, duration: 1000 }));
  }
  function settle() {
    resetCard(); endDrag(); endWeekDrag(); resetExpressions(); animations.forEach(animation => animation.cancel());
    overlays.forEach(overlay => overlay.remove()); overlays.clear();
    bursts.forEach((timer, effect) => { clearTimeout(timer); effect.remove(); }); bursts.clear();
  }
  function motionPreference() {
    document.documentElement.classList.toggle('motion-reduced', reduced.matches);
    if (reduced.matches) { settle(); sections.forEach(section => reveal(section, false)); artFrames.forEach(art => revealArt(art, false)); }
    scroll();
  }
  reduced.addEventListener('change', motionPreference); finePointer.addEventListener('change', () => { resetCard(); resetExpressions(); });
  addEventListener('blur', () => { resetCard(); endDrag(); endWeekDrag(); resetExpressions(); });
  addEventListener('pagehide', () => { sleeping = true; cancelAnimationFrame(frame); frame = 0; settle(); if (viewer?.open) viewer.close(); });
  addEventListener('pageshow', () => { sleeping = false; scroll(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; resetCard(); endDrag(); endWeekDrag(); resetExpressions(); }
    else scroll();
  });
  motionPreference();
  if (document.querySelector('main.home') && !document.querySelector('script[data-home-runtime]')) {
    const runtime = document.createElement('script');
    runtime.dataset.homeRuntime = '';
    runtime.src = new URL('home.js?v=concert-4', document.currentScript.src).href;
    document.body.append(runtime);
  }
})();
