// The home stage is an instrument to explore. Motion runs only in response to input.
(() => {
  const home = document.querySelector('main.home');
  if (!home || home.dataset.homeInitialized) return;
  home.dataset.homeInitialized = 'true';
  const $$ = (selector, box = home) => [...box.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const ease = 'cubic-bezier(.22,1,.36,1)';
  const animations = new Set(), channels = new WeakMap();
  let sleeping = false, frame = 0, point = null, swipe = null;
  const modalOpen = () => !!document.querySelector('dialog[open]');
  function animate(element, frames, options = {}, channel = 'home') {
    if (!element || reduced.matches || sleeping || document.hidden || !element.animate) return null;
    const map = channels.get(element) || new Map();
    map.get(channel)?.cancel();
    const animation = element.animate(frames, { duration: 650, easing: ease, ...options });
    map.set(channel, animation); channels.set(element, map); animations.add(animation);
    animation.finished.catch(() => {}).finally(() => {
      animations.delete(animation);
      if (map.get(channel) === animation) map.delete(channel);
    });
    return animation;
  }

  // An entire ensemble stays visible; one portrait can be examined at a time.
  const hero = home.querySelector('.hero');
  const figures = $$('.hero .fig');
  const portrait = home.querySelector('[data-hero-portrait]');
  const scene = home.querySelector('[data-hero-scene]');
  const portraitFrame = home.querySelector('[data-hero-swipe]');
  const name = home.querySelector('.hero-feature-name');
  const role = home.querySelector('.hero-feature-role');
  const featureLink = home.querySelector('.hero-feature-link');
  let selected = 0, portraitJob = 0, portraitTimer = 0, outgoing = null;
  const glint = portraitFrame ? document.createElement('i') : null;
  if (glint) { glint.className = 'hero-change-glint'; glint.setAttribute('aria-hidden', 'true'); (portrait?.closest('.hero-portrait-inner') || portraitFrame).append(glint); }
  if (scene) {
    const light = document.createElement('i'); light.className = 'home-lightfield'; light.setAttribute('aria-hidden', 'true'); scene.append(light);
  }
  function selectFigure(index, motion = true, hoverIntent = false) {
    if (!figures.length) return;
    index = (index + figures.length) % figures.length;
    const card = figures[index], changed = selected !== index, previous = selected;
    selected = index; home.dataset.heroIndex = String(index);
    figures.forEach((figure, i) => {
      figure.classList.toggle('is-hero-selected', i === index);
      if (i === index) figure.setAttribute('aria-current', 'true'); else figure.removeAttribute('aria-current');
    });
    const person = card.querySelector('b')?.textContent || '';
    if (name) name.textContent = person;
    if (role) role.textContent = card.querySelector('span')?.textContent || '';
    if (featureLink) featureLink.href = card.href;
    $$('[data-hero-index]').forEach(counter => { counter.textContent = String(index + 1).padStart(2, '0'); });
    if (hero) hero.style.setProperty('--ensemble-position', String(index / Math.max(1, figures.length - 1)));
    if (changed && motion) {
      const direction = index === 0 && previous === figures.length - 1 ? 1 : index === figures.length - 1 && previous === 0 ? -1 : Math.sign(index - previous);
      [name, role].forEach((element, i) => animate(element, [{ opacity: .25, translate: `${direction * 18}px 0` }, { opacity: 1, translate: '0 0' }], { duration: 520, delay: i * 50 }));
      animate(glint, [{ opacity: 0, translate: '-110% 0' }, { opacity: .6, offset: .45 }, { opacity: 0, translate: '110% 0' }], { duration: 850 });
      $$('[data-hero-score] i').forEach((note, i) => animate(note, [{ opacity: .2, scale: '.7' }, { opacity: 1, scale: '1.3', offset: .4 }, { opacity: .5, scale: '1' }], { delay: i * 24, duration: 620 }));
    }
    if (!portrait) return;
    const source = card.dataset.portraitFeature || card.querySelector('img:not(.hero-expression)')?.src;
    const position = card.dataset.portraitPosition || '71% 38%';
    portrait.alt = person;
    clearTimeout(portraitTimer); portraitTimer = 0;
    const job = ++portraitJob;
    if (!source) return;
    if (new URL(source, document.baseURI).href === portrait.src) { portrait.style.objectPosition = position; return; }
    const loadPortrait = () => {
      portraitTimer = 0;
      const preload = new Image(); preload.decoding = 'async'; preload.src = source;
      const ready = preload.decode ? preload.decode().then(() => true, () => false) : new Promise(resolve => { preload.onload = () => resolve(true); preload.onerror = () => resolve(false); });
      ready.then(loaded => {
        if (!loaded || job !== portraitJob || sleeping) return;
        outgoing?.remove(); outgoing = null;
        if (motion && changed && !reduced.matches && !document.hidden && portrait.complete && portrait.naturalWidth) {
          const old = portrait.cloneNode(false); old.removeAttribute('id'); old.removeAttribute('data-hero-portrait'); old.alt = '';
          old.setAttribute('aria-hidden', 'true'); old.classList.add('hero-portrait-outgoing'); old.removeAttribute('srcset');
          portrait.after(old); outgoing = old;
          const fade = animate(old, [{ opacity: 1 }, { opacity: 0 }], { duration: 650 });
          const remove = () => { old.remove(); if (outgoing === old) outgoing = null; };
          if (fade) fade.finished.then(remove, remove); else remove();
        }
        portrait.removeAttribute('srcset'); portrait.style.objectPosition = position; portrait.src = source;
        if (motion && changed) animate(portrait, [{ opacity: .5, clipPath: 'inset(0 0 9% 0)' }, { opacity: 1, clipPath: 'inset(0)' }], { duration: 850 }, 'portrait');
      });
    };
    // Crossing the ensemble with a pointer should not decode every full-size portrait.
    if (hoverIntent) portraitTimer = setTimeout(loadPortrait, 90); else loadPortrait();
  }
  figures.forEach((figure, index) => {
    figure.addEventListener('pointerenter', event => { if (fine.matches && event.pointerType !== 'touch' && !modalOpen()) selectFigure(index, true, true); });
    figure.addEventListener('focusin', () => { if (!modalOpen()) selectFigure(index); });
  });
  $$('[data-hero-step]').forEach(button => button.addEventListener('click', () => selectFigure(selected + Number(button.dataset.heroStep))));
  hero?.addEventListener('keydown', event => {
    if (modalOpen() || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input,select,textarea')) return;
    const control = event.target.closest('.fig,[data-hero-step]'); if (!control) return;
    const next = event.key === 'ArrowRight' ? selected + 1 : event.key === 'ArrowLeft' ? selected - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? figures.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); selectFigure(next); figures[selected]?.focus({ preventScroll: true });
  });
  selectFigure(0, false);

  // A horizontal gesture changes the portrait; vertical scrolling remains native.
  function endSwipe(commit = false) {
    const gesture = swipe; if (!gesture) return; swipe = null;
    portraitFrame.classList.remove('is-portrait-dragging');
    portraitFrame.style.removeProperty('--portrait-drag');
    if (gesture.active) {
      portraitFrame.dataset.suppressClickUntil = String(performance.now() + 350);
      if (commit && Math.abs(gesture.dx) > 45) selectFigure(selected + (gesture.dx < 0 ? 1 : -1));
    }
    if (portraitFrame.hasPointerCapture(gesture.id)) portraitFrame.releasePointerCapture(gesture.id);
  }
  if (portraitFrame) {
    portraitFrame.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('button,input') || modalOpen()) return;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, active: false };
    });
    portraitFrame.addEventListener('pointermove', event => {
      if (!swipe || swipe.id !== event.pointerId) return;
      const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
      if (!swipe.active && Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { endSwipe(); return; }
      if (!swipe.active && Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        swipe.active = true; portraitFrame.setPointerCapture(event.pointerId); portraitFrame.classList.add('is-portrait-dragging');
      }
      if (swipe.active) {
        event.preventDefault(); swipe.dx = dx;
        if (!reduced.matches) portraitFrame.style.setProperty('--portrait-drag', `${Math.max(-18, Math.min(18, dx * .12))}px`);
      }
    });
    portraitFrame.addEventListener('pointerup', () => endSwipe(true));
    portraitFrame.addEventListener('pointercancel', () => endSwipe());
    portraitFrame.addEventListener('lostpointercapture', event => {
      // Touch starts with implicit capture on the image. Its release bubbles when
      // the frame takes over; only losing the frame's own capture ends the swipe.
      if (event.target === portraitFrame && swipe?.id === event.pointerId) endSwipe();
    });
    portraitFrame.addEventListener('pointerleave', () => { if (swipe && !swipe.active) endSwipe(); });
    portraitFrame.addEventListener('dragstart', event => event.preventDefault());
    portraitFrame.addEventListener('click', event => {
      if (event.detail > 0 && performance.now() < Number(portraitFrame.dataset.suppressClickUntil || 0)) { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
  }

  // One additional frame is scheduled only when the pointer has new coordinates.
  function resetLight() {
    point = null;
    scene?.classList.remove('is-scene-active');
    ['--hero-light-x', '--hero-light-y', '--hero-depth-x', '--hero-depth-y'].forEach(property => scene?.style.removeProperty(property));
  }
  function paint() {
    frame = 0;
    if (!point || !scene || sleeping || document.hidden || reduced.matches) return;
    const bounds = scene.getBoundingClientRect(), x = Math.max(0, Math.min(1, (point.x - bounds.left) / bounds.width)), y = Math.max(0, Math.min(1, (point.y - bounds.top) / bounds.height));
    scene.style.setProperty('--hero-light-x', `${x * 100}%`); scene.style.setProperty('--hero-light-y', `${y * 100}%`);
    scene.style.setProperty('--hero-depth-x', `${(x - .5) * -14}px`); scene.style.setProperty('--hero-depth-y', `${(y - .5) * -10}px`);
    $$('[data-hero-score] i').forEach((note, index, list) => note.classList.toggle('is-note-near', Math.abs(index / Math.max(1, list.length - 1) - x) < .1));
  }
  scene?.addEventListener('pointermove', event => {
    if (!fine.matches || reduced.matches || event.pointerType === 'touch' || sleeping || modalOpen()) return;
    point = { x: event.clientX, y: event.clientY }; scene.classList.add('is-scene-active');
    if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
  }, { passive: true });
  scene?.addEventListener('pointerleave', resetLight);

  // The same venue controls work from both the opening composition and the stage.
  const stages = home.querySelector('.stages');
  const stageTabs = stages ? $$('.steps > [data-tab]', stages) : [];
  const stageFrames = $$('[data-stage-compare-frame]');
  function syncStages() {
    const active = stageTabs.find(button => button.getAttribute('aria-pressed') === 'true');
    if (!active) return;
    $$('[data-stage-jump]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.stageJump === active.dataset.tab)));
    $$('[data-stage-index]').forEach(counter => { counter.textContent = String(stageTabs.indexOf(active) + 1).padStart(2, '0'); });
    stageFrames.filter(frame => frame.closest('[data-panel]')?.hidden).forEach(stopComparison);
  }
  function stageSelection(index, scroll = false) {
    if (!stageTabs.length) return;
    const button = stageTabs[(index + stageTabs.length) % stageTabs.length];
    button.click();
    if (scroll) home.querySelector('#stages,.section-stages')?.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'instant' : 'smooth' });
  }
  $$('[data-stage-step]').forEach(button => button.addEventListener('click', () => {
    const index = stageTabs.findIndex(tab => tab.getAttribute('aria-pressed') === 'true'); stageSelection(index + Number(button.dataset.stageStep));
  }));
  $$('[data-stage-jump]').forEach(button => button.addEventListener('click', () => stageSelection(Number(button.dataset.stageJump), !button.closest('.section-stages'))));
  stages?.addEventListener('site:tabchange', syncStages);

  // Rehearsal and performance can be compared in one frame, using a real range input.
  const compareStates = new Map();
  function stopComparison(frame) {
    const state = compareStates.get(frame); if (!state) return;
    frame.classList.remove('is-comparing'); state.toggle.setAttribute('aria-pressed', 'false');
    state.range.hidden = true; state.layer.hidden = true; state.divider.hidden = true;
  }
  function positionComparison(frame) {
    const state = compareStates.get(frame); if (!state || !frame.classList.contains('is-comparing')) return;
    const image = state.primary.getBoundingClientRect(), bounds = frame.getBoundingClientRect();
    const left = image.left - bounds.left - frame.clientLeft, top = image.top - bounds.top - frame.clientTop;
    Object.assign(state.layer.style, { left: `${left}px`, top: `${top}px`, width: `${image.width}px`, height: `${image.height}px` });
    Object.assign(state.divider.style, { left: `${left + image.width * Number(state.range.value) / 100}px`, top: `${top}px`, height: `${image.height}px` });
    frame.style.setProperty('--compare-position', `${state.range.value}%`);
    const style = getComputedStyle(state.primary);
    if (state.image) { state.image.style.objectFit = style.objectFit; state.image.style.objectPosition = style.objectPosition; }
  }
  const compareIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M8 5H4v14h4m8-14h4v14h-4M6 9v6m12-6v6"/></svg>';
  stageFrames.forEach(frame => {
    const primary = frame.querySelector(':scope > img'), toggle = frame.querySelector('[data-stage-compare-toggle]'), range = frame.querySelector('[data-stage-compare]'), layer = frame.querySelector('.stage-compare-layer');
    if (!primary || !toggle || !range || !layer) return;
    const divider = document.createElement('i'); divider.className = 'stage-compare-divider'; divider.setAttribute('aria-hidden', 'true'); divider.hidden = true; frame.append(divider);
    const state = { primary, toggle, range, layer, divider, image: null }; compareStates.set(frame, state);
    if (!toggle.children.length) toggle.innerHTML = compareIcon;
    toggle.setAttribute('aria-pressed', 'false'); range.hidden = true; layer.hidden = true;
    toggle.addEventListener('click', () => {
      if (frame.classList.contains('is-comparing')) { stopComparison(frame); return; }
      const before = frame.dataset.compareBefore;
      const choice = $$('[data-pick]', frame).find(button => button.dataset.setImg === before);
      if (choice) choice.click();
      else if (before) primary.src = before;
      if (!state.image) {
        state.image = new Image(); state.image.alt = ''; state.image.decoding = 'async'; state.image.draggable = false;
        state.image.src = frame.dataset.compareAfter; layer.append(state.image);
        state.image.addEventListener('load', () => positionComparison(frame));
      }
      frame.classList.add('is-comparing'); toggle.setAttribute('aria-pressed', 'true'); range.hidden = false; layer.hidden = false; divider.hidden = false;
      positionComparison(frame);
      animate(layer, [{ opacity: .3 }, { opacity: 1 }], { duration: 500 });
    });
    range.addEventListener('input', () => positionComparison(frame));
    frame.addEventListener('click', event => { if (event.target.closest('[data-pick]')) stopComparison(frame); });
    primary.addEventListener('load', () => positionComparison(frame));
    if ('ResizeObserver' in window) new ResizeObserver(() => positionComparison(frame)).observe(primary);
  });
  syncStages();

  // The people gallery can be explored by its existing categories as well as by dragging.
  const filters = $$('[data-cast-filter]');
  function filterCast(button) {
    const section = button.closest('.section-cast') || home, gallery = section.querySelector('.slides'); if (!gallery) return;
    const value = button.dataset.castFilter;
    $$('[data-cast-filter]', section).forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    $$('.slide', gallery).forEach(card => { card.hidden = !!value && card.dataset.castGroup !== value; });
    gallery.scrollTo({ left: 0, behavior: 'instant' });
    gallery.dispatchEvent(new Event('scroll'));
    $$('.slide:not([hidden])', gallery).slice(0, 4).forEach((card, index) => animate(card, [{ opacity: .35, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { delay: index * 45, duration: 550 }, 'cast-filter'));
  }
  filters.forEach(button => button.addEventListener('click', () => filterCast(button)));

  // A quiet section index keeps the denser page navigable without taking over scrolling.
  const jumps = $$('[data-home-jump]');
  const targets = new Map();
  jumps.forEach(link => {
    const id = (link.dataset.homeJump || link.getAttribute('href') || '').replace(/^#/, '');
    const target = document.getElementById(id); if (!target) return;
    targets.set(id, target);
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      target.scrollIntoView({ block: 'start', behavior: reduced.matches ? 'instant' : 'smooth' });
      history.replaceState(null, '', `#${encodeURIComponent(id)}`);
      target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true });
    });
  });
  if ('IntersectionObserver' in window && targets.size) {
    const visible = new Set();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); });
      if (!visible.size) return;
      const current = [...visible].sort((a, b) => Math.abs(a.getBoundingClientRect().top - innerHeight * .23) - Math.abs(b.getBoundingClientRect().top - innerHeight * .23))[0];
      jumps.forEach(link => {
        const active = (link.dataset.homeJump || link.getAttribute('href') || '').replace(/^#/, '') === current.id;
        link.classList.toggle('is-home-current', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-16% 0px -55% 0px', threshold: 0 });
    targets.forEach(target => observer.observe(target));
  }

  function settle() {
    cancelAnimationFrame(frame); frame = 0; resetLight(); endSwipe();
    clearTimeout(portraitTimer); portraitTimer = 0;
    animations.forEach(animation => animation.cancel()); outgoing?.remove(); outgoing = null;
  }
  reduced.addEventListener('change', () => { if (reduced.matches) { settle(); selectFigure(selected, false); } });
  fine.addEventListener('change', resetLight);
  addEventListener('blur', () => { resetLight(); endSwipe(); });
  addEventListener('pagehide', () => { sleeping = true; settle(); });
  addEventListener('pageshow', () => { sleeping = false; selectFigure(selected, false); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); else selectFigure(selected, false); });
  home.dataset.homeReady = 'true';
})();
