(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const VS = '︎';
  const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
  const PV = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------- config ----------------
  const TCS = [
    { id: 'bullet', e: '⚡', name: 'Bullet', t: '1+0', base: 60, inc: 0, d: 'Reflexes and caffeine. Nakamura territory.', delay: [250, 900] },
    { id: 'blitz', e: '🔥', name: 'Blitz', t: '3+2', base: 180, inc: 2, d: 'Coffeehouse chess, with increment.', delay: [500, 2600] },
    { id: 'rapid', e: '☕', name: 'Rapid', t: '10+0', base: 600, inc: 0, d: 'Enough time to think, not to dawdle.', delay: [900, 4500] },
    { id: 'classical', e: '🕰️', name: 'Classical', t: '30+0', base: 1800, inc: 0, d: 'Slow and serious. Botvinnik would approve.', delay: [1500, 7000] },
    { id: 'untimed', e: '✉️', name: 'No clock', t: '∞', base: 0, inc: 0, d: 'Correspondence pace. We still time every move.', delay: [600, 2400] },
  ];
  const SPIRIT = {
    bullet: ['⚡', 'An energy drink, already empty'],
    blitz: ['☕', 'An espresso going cold'],
    rapid: ['🥐', 'A croissant for the middlegame'],
    classical: ['📓', 'A scoresheet full of side-lines'],
    untimed: ['✉️', 'A postcard to your opponent'],
  };
  const BANDS = [
    { max: 800, avatar: '🐣', names: ['Wobbly Walter', 'Patzer Pam', 'Sir Hangs-a-Lot', 'Baby Bishop', 'Pawnstar Pete'],
      blurb: 'Knows how the horsey moves. Mostly.',
      greet: ['Hi! Is the horse the one that jumps?', 'Good luck! I’ll need it more.', 'I read half a chess book once.'],
      capture: ['Ooh, free stuff!', 'Is that allowed? It is? Yay!', 'Yoink!'], check: ['Check! I think?', 'Your king looks lonely.'],
      ouch: ['Wait, I needed that!', 'Oh no. Oh no no no.'], win: ['I won?! Mom!!'], lose: ['GG! That was fun!'] },
    { max: 1200, avatar: '☕', names: ['Coffeehouse Carl', 'Gambit Gertrude', 'Fork-Lift Frank', 'Knightmare Nadia'],
      blurb: 'Plays in the park every Sunday and trash-talks a bit.',
      greet: ['Let’s go. Loser buys the coffee.', 'I’ve been practising my gambits.'],
      capture: ['Thanks for the snack.', 'Didn’t need that, did you?'], check: ['Check, my friend.', 'Knock knock.'],
      ouch: ['Hmph. Lucky.', 'I meant to do that.'], win: ['Coffee’s on you!'], lose: ['Well played. Rematch?'] },
    { max: 1600, avatar: '🎩', names: ['Club Night Clara', 'Tempo Tomás', 'The Pinning Parson', 'Rook Lift Ruth'],
      blurb: 'Solid club player. Has opinions about the Caro-Kann.',
      greet: ['A pleasure. May the better tactician win.', 'Shall we?'],
      capture: ['Material is material.', 'Noted, and taken.'], check: ['Check.', 'Mind your king.'],
      ouch: ['Interesting choice.', 'Hm. I underestimated that.'], win: ['Good game. Study your endgames!'], lose: ['Well deserved. Chapeau.'] },
    { max: 2000, avatar: '🦉', names: ['Endgame Edna', 'Fianchetto Fritz', 'The Zugzwang Zebra', 'Prophylaxis Priya'],
      blurb: 'Expert level. Will slowly take away all your squares.',
      greet: ['I hope you like endgames.', 'Let’s see what you’ve got.'],
      capture: ['Thank you.', 'That pawn was weak anyway.'], check: ['Check.', 'Your king is drafty.'],
      ouch: ['Hm. Well calculated.', 'I missed that one.'], win: ['Instructive game. For you.'], lose: ['Impressive. Truly.'] },
    { max: 9999, avatar: '🤖', names: ['Grandmaster Gizmo', 'Silicon Sasha', 'Deep Bluish', 'Engine Ingrid'],
      blurb: 'Suspiciously strong. Never blinks.',
      greet: ['Initialising humility module… error.', 'Beep. Good luck, human.'],
      capture: ['Material acquired.', 'Calculated.'], check: ['Check. Probability of survival: falling.', 'Check.'],
      ouch: ['Unexpected. Recalibrating.', 'Fascinating.'], win: ['GG. Resistance was +0.3 at best.'], lose: ['Error 404: win not found.'] },
  ];
  const ANALYSE_MSGS = [
    'Consulting the ghosts of Reykjavík…', 'Counting Tal’s cigarettes…', 'Checking Karpov’s yogurt for coded messages…',
    'Asking Capablanca, who already knew…', 'Winding the Fischer clock…', 'Polishing Kasparov’s wristwatch…',
    'Letting Alekhine’s cat sniff your moves…', 'Measuring your king’s walking distance…', 'Comparing you with 24 legends…',
  ];
  const DIFF = {
    aggression: ['attacks far more', 'is far calmer'], sacrifice: ['sacrifices much more freely', 'is much stingier with material'],
    precision: ['is far more precise', 'is wilder'], speed: ['moves much faster', 'thinks much longer'],
    tempo: ['prefers faster chess', 'prefers slower chess'], safety: ['castles much earlier', 'keeps the king in the centre'],
    kingWalk: ['walks the king much more', 'keeps the king home'], queenEarly: ['brings the queen out earlier', 'keeps the queen back'],
    pawnStorm: ['pushes pawns much more', 'keeps the pawns back'], simplify: ['trades much more', 'avoids trades'],
    endurance: ['plays much longer games', 'finishes games sooner'], theory: ['knows much more theory', 'leaves the book earlier'],
    knights: ['prefers knights', 'prefers bishops'], chaos: ['is much more chaotic', 'is much more controlled'],
    timeTrouble: ['gets into time trouble more', 'manages the clock better'],
  };

  // ---------------- state ----------------
  const S = {
    tc: TCS[1], colorPref: 'r', bot: null, chess: null, userColor: 'w', orientation: 'w',
    moves: [], clock: { w: 0, b: 0 }, used: { w: 0, b: 0 }, turnStart: 0, gameOver: true, gameId: 0,
    selected: null, botBadStreak: 0, lastDrawOfferPly: -99, positions: new Set(), result: null, resignArmed: false,
    lastProfile: null,
  };

  // ---------------- helpers ----------------
  function go(name) {
    $$('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
    window.scrollTo(0, 0);
  }
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2200);
  }
  function fmtClock(ms) {
    ms = Math.max(0, ms);
    if (ms < 20000) { const s = ms / 1000; return '0:' + (s < 10 ? '0' : '') + s.toFixed(1); }
    const t = Math.ceil(ms / 1000); const m = Math.floor(t / 60); const s = t % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  const fmtSec = (ms) => (ms < 10000 ? (ms / 1000).toFixed(1) : Math.round(ms / 1000)) + 's';
  const initials = (name) => { const w = name.split(' '); return (w[0][0] + w[w.length - 1][0]).toUpperCase(); };

  // ---------------- theme ----------------
  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem('ccl-theme'); } catch (e) { /* ignore */ }
    if (saved) document.documentElement.dataset.theme = saved;
    $('#themeToggle').addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme ||
        (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('ccl-theme', next); } catch (e) { /* ignore */ }
      window.dispatchEvent(new Event('resize'));
    });
  })();

  // ---------------- intro ----------------
  function renderHeroBoard() {
    // Morphy's Opera Game, just before 17.Rd8#
    const g = new Chess('1n2kb1r/p4ppp/4q3/4p1B1/4P3/8/PPP2PPP/2KR4 w k - 0 17');
    const el = $('#heroBoard'); el.innerHTML = '';
    const b = g.board();
    for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
      const d = document.createElement('div');
      d.style.background = (r + f) % 2 ? 'var(--sq-dark)' : 'var(--sq-light)';
      const p = b[r][f];
      if (p) d.innerHTML = `<span class="piece ${p.color}" style="font-size:inherit;cursor:default">${GLYPH[p.type]}${VS}</span>`;
      el.appendChild(d);
    }
    el.title = 'Morphy vs. Duke of Brunswick & Count Isouard, Paris Opera 1858, one move before mate';
  }

  // ---------------- setup ----------------
  function levelFor(elo) {
    if (elo < 600) return { depth: 1, noise: 220, blunder: .30, timeMs: 120 };
    if (elo < 900) return { depth: 2, noise: 140, blunder: .15, timeMs: 200 };
    if (elo < 1200) return { depth: 2, noise: 70, blunder: .08, timeMs: 250 };
    if (elo < 1500) return { depth: 3, noise: 40, blunder: .04, timeMs: 400 };
    if (elo < 1800) return { depth: 4, noise: 18, blunder: .015, timeMs: 700 };
    if (elo < 2100) return { depth: 5, noise: 0, blunder: 0, timeMs: 900 };
    return { depth: 8, noise: 0, blunder: 0, timeMs: 1500 };
  }
  function makeBot(elo) {
    const band = BANDS.find((b) => elo < b.max);
    const aggression = Math.round(Math.random() * 100) / 100;
    const style = aggression > .66 ? 'Loves to attack' : aggression < .33 ? 'Prefers quiet moves' : 'Plays whatever the position needs';
    return { elo, band, name: pick(band.names), avatar: band.avatar, aggression, style, level: { ...levelFor(elo), aggression } };
  }
  function rollBot(elo) {
    if (elo == null) elo = Math.round(rand(400, 2600) / 10) * 10;
    S.bot = makeBot(elo);
    $('#eloSlider').value = elo;
    renderOpponent();
  }
  function renderOpponent() {
    const b = S.bot;
    $('#opponentCard').innerHTML = `
      <div class="big-avatar">${b.avatar}</div>
      <div><h3>${esc(b.name)} <span class="elo-badge">${b.elo}</span></h3>
      <p>${esc(b.band.blurb)} ${esc(b.style)}.</p></div>`;
  }
  function renderSetup() {
    const grid = $('#tcChoices');
    grid.innerHTML = TCS.map((t) => `
      <button class="tc ${t.id === S.tc.id ? 'selected' : ''}" data-tc="${t.id}">
        <span class="e">${t.e}</span><span class="t">${t.t}</span><strong>${t.name}</strong><small>${t.d}</small>
      </button>`).join('');
    grid.querySelectorAll('.tc').forEach((btn) => btn.addEventListener('click', () => {
      S.tc = TCS.find((t) => t.id === btn.dataset.tc); renderSetup();
    }));
    if (!S.bot) rollBot();
  }
  $$('#colorChoices .chip').forEach((c) => c.addEventListener('click', () => {
    $$('#colorChoices .chip').forEach((x) => x.classList.remove('selected'));
    c.classList.add('selected'); S.colorPref = c.dataset.color;
  }));
  $('#rerollBtn').addEventListener('click', () => rollBot());
  $('#eloSlider').addEventListener('input', (e) => { S.bot = makeBot(+e.target.value); renderOpponent(); });
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => {
    let t = b.dataset.go;
    const cur = ($('.screen.active') || {}).id || '';
    if (t === 'back') t = S.prevScreen || 'intro';
    if (cur === 'screen-game' && t !== 'game' && !S.gameOver) {
      if (!confirm('Leave and abandon the current game?')) return;
      S.gameOver = true; S.gameId++;
    }
    if (t === 'about') S.prevScreen = cur.replace('screen-', '') === 'analyse' ? 'results' : cur.replace('screen-', '') || 'intro';
    if (t === 'setup') renderSetup();
    go(t);
  }));
  $('#startGameBtn').addEventListener('click', startGame);

  // ---------------- game ----------------
  function startGame() {
    S.chess = new Chess();
    S.userColor = S.colorPref === 'r' ? (Math.random() < .5 ? 'w' : 'b') : S.colorPref;
    S.orientation = S.userColor;
    S.moves = []; S.selected = null; S.botBadStreak = 0; S.lastDrawOfferPly = -99; S.result = null;
    S.positions = new Set([Engine.boardKey(Engine.fromFEN(S.chess.fen()))]);
    S.clock = { w: S.tc.base * 1000, b: S.tc.base * 1000 };
    S.used = { w: 0, b: 0 };
    S.gameOver = false; S.gameId++;
    S.turnStart = performance.now();
    S.resignArmed = false;
    $('#botAvatar').textContent = S.bot.avatar;
    $('#botName').textContent = S.bot.name;
    $('#botElo').textContent = `ELO ${S.bot.elo} · ${S.userColor === 'w' ? 'Black' : 'White'}`;
    $('#userColorLabel').textContent = `${S.userColor === 'w' ? 'White' : 'Black'} · ${S.tc.name} ${S.tc.t}`;
    $('#endCard').hidden = true;
    $('#drawBtn').disabled = false; $('#resignBtn').disabled = false;
    $('#resignBtn').textContent = '🏳 Resign';
    go('game');
    render();
    say(pick(S.bot.band.greet), 3200);
    if (S.chess.turn() !== S.userColor) scheduleBot(); else setStatus('Your move');
  }

  function setStatus(text, thinking) {
    const s = $('#status'); s.textContent = text; s.classList.toggle('thinking', !!thinking);
  }
  function say(text, ms) {
    const el = $('#botSpeech'); el.textContent = text; el.hidden = false;
    clearTimeout(say._t); say._t = setTimeout(() => { el.hidden = true; }, ms || 2600);
  }

  function render() { renderBoard(); renderMoves(); renderCaptured(); renderPace(); updateClocks(); }

  function renderBoard() {
    const el = $('#board'); el.innerHTML = '';
    const files = S.orientation === 'w' ? 'abcdefgh' : 'hgfedcba';
    const ranks = S.orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
    const last = S.moves[S.moves.length - 1];
    let checkSq = null;
    if (S.chess.in_check()) {
      const turn = S.chess.turn();
      for (const f of 'abcdefgh') for (let r = 1; r <= 8; r++) { const p = S.chess.get(f + r); if (p && p.type === 'k' && p.color === turn) checkSq = f + r; }
    }
    const targets = S.selected ? S.chess.moves({ square: S.selected, verbose: true }) : [];
    ranks.forEach((r, ri) => {
      [...files].forEach((f, fi) => {
        const sq = f + r;
        const d = document.createElement('div');
        const dark = ('abcdefgh'.indexOf(f) + r) % 2 === 1;
        d.className = 'sq ' + (dark ? 'd' : 'l');
        d.dataset.sq = sq;
        if (last && (last.from === sq || last.to === sq)) d.classList.add('last');
        if (S.selected === sq) d.classList.add('sel');
        if (checkSq === sq) d.classList.add('check');
        const p = S.chess.get(sq);
        if (p) d.innerHTML = `<span class="piece ${p.color}">${GLYPH[p.type]}${VS}</span>`;
        const t = targets.find((m) => m.to === sq);
        if (t) d.insertAdjacentHTML('beforeend', p ? '<span class="ring"></span>' : '<span class="dot"></span>');
        if (ri === 7) d.insertAdjacentHTML('beforeend', `<span class="coord f">${f}</span>`);
        if (fi === 0) d.insertAdjacentHTML('beforeend', `<span class="coord r">${r}</span>`);
        el.appendChild(d);
      });
    });
  }

  function renderMoves() {
    const ol = $('#moveList'); const h = S.moves; let html = '';
    for (let i = 0; i < h.length; i += 2) {
      const n = i / 2 + 1;
      html += `<li><span class="n">${n}.</span><span class="mv ${i === h.length - 1 ? 'cur' : ''}">${esc(h[i].san)}</span><span class="mv ${i + 1 === h.length - 1 ? 'cur' : ''}">${h[i + 1] ? esc(h[i + 1].san) : ''}</span></li>`;
    }
    ol.innerHTML = html; ol.scrollTop = ol.scrollHeight;
  }

  function renderCaptured() {
    const init = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const cnt = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
    for (const row of S.chess.board()) for (const p of row) if (p && p.type !== 'k') cnt[p.color][p.type]++;
    const mat = (c) => Object.keys(init).reduce((a, k) => a + cnt[c][k] * PV[k], 0);
    const capturedOf = (c) => ['q', 'r', 'b', 'n', 'p'].map((k) => (GLYPH[k] + VS).repeat(Math.max(0, init[k] - cnt[c][k]))).join('');
    const uc = S.userColor, bc = uc === 'w' ? 'b' : 'w';
    const diff = mat(uc) - mat(bc);
    $('#userCaptured').innerHTML = capturedOf(bc) + (diff > 0 ? `<span class="adv">+${diff}</span>` : '');
    $('#botCaptured').innerHTML = capturedOf(uc) + (diff < 0 ? `<span class="adv">+${-diff}</span>` : '');
  }

  function renderPace() {
    const el = $('#paceLive');
    const recent = S.moves.slice(-60);
    const max = Math.max(1000, ...recent.map((m) => m.thinkMs));
    el.innerHTML = recent.map((m) => `<i class="${m.color === S.userColor ? '' : 'bot'}" style="height:${Math.max(4, Math.sqrt(m.thinkMs / max) * 100)}%" title="${esc(m.san)}: ${fmtSec(m.thinkMs)}"></i>`).join('');
  }

  function updateClocks() {
    if (!S.chess) return;
    const now = performance.now();
    const turn = S.chess.turn();
    const timed = S.tc.base > 0;
    for (const c of ['w', 'b']) {
      const el = c === S.userColor ? $('#userClock') : $('#botClock');
      const running = !S.gameOver && c === turn;
      let txt;
      if (timed) {
        const rem = S.clock[c] - (running ? now - S.turnStart : 0);
        txt = fmtClock(rem);
        el.classList.toggle('low', rem < 10000 && rem > 0 && running);
        if (running && rem <= 0) { flag(c); return; }
      } else {
        txt = '⏱ ' + fmtClock(S.used[c] + (running ? now - S.turnStart : 0)).replace(/\.\d$/, '');
      }
      el.textContent = txt;
      el.classList.toggle('running', running);
    }
  }
  setInterval(updateClocks, 100);

  function flag(color) {
    if (S.gameOver) return;
    S.clock[color] = 0;
    const userFlagged = color === S.userColor;
    endGame(userFlagged ? 'loss' : 'win', 'timeout');
  }

  // ----- input: click & drag -----
  let drag = null;
  const boardEl = $('#board');
  boardEl.addEventListener('pointerdown', (e) => {
    if (S.gameOver || S.chess.turn() !== S.userColor) return;
    const sqEl = e.target.closest('.sq'); if (!sqEl) return;
    const sq = sqEl.dataset.sq;
    const p = S.chess.get(sq);
    if (S.selected && sq !== S.selected && tryMove(S.selected, sq)) return;
    if (p && p.color === S.userColor) {
      const wasSelected = S.selected === sq;
      S.selected = sq; renderBoard();
      drag = { from: sq, x: e.clientX, y: e.clientY, ghost: null, wasSelected, id: e.pointerId };
      boardEl.setPointerCapture(e.pointerId);
    } else { S.selected = null; renderBoard(); }
  });
  boardEl.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.ghost && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5) {
      const src = boardEl.querySelector(`[data-sq="${drag.from}"] .piece`);
      if (!src) return;
      const g = src.cloneNode(true); g.classList.add('ghost');
      g.style.fontSize = getComputedStyle(src).fontSize;
      document.body.appendChild(g); drag.ghost = g; src.classList.add('dragging');
    }
    if (drag.ghost) { drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px'; }
  });
  function endDrag(e, cancel) {
    if (!drag) return;
    const d = drag; drag = null;
    if (d.ghost) {
      d.ghost.remove();
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const sqEl = under && under.closest && under.closest('.sq');
      if (!cancel && sqEl && sqEl.dataset.sq !== d.from && tryMove(d.from, sqEl.dataset.sq)) return;
      renderBoard();
    } else if (d.wasSelected) { S.selected = null; renderBoard(); }
  }
  boardEl.addEventListener('pointerup', (e) => endDrag(e, false));
  boardEl.addEventListener('pointercancel', (e) => endDrag(e, true));

  function tryMove(from, to) {
    const legal = S.chess.moves({ square: from, verbose: true }).filter((m) => m.to === to);
    if (!legal.length) return false;
    if (legal[0].flags.includes('p')) { showPromo(from, to); return true; }
    doMove({ from, to });
    return true;
  }
  function showPromo(from, to) {
    const box = $('#promo');
    const c = S.userColor;
    box.innerHTML = `<div class="promo-box">${['q', 'r', 'b', 'n'].map((t) => `<button data-p="${t}" aria-label="${t}"><span class="piece ${c}">${GLYPH[t]}${VS}</span></button>`).join('')}</div>`;
    box.hidden = false;
    box.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { box.hidden = true; doMove({ from, to, promotion: b.dataset.p }); }));
    box.onclick = (e) => { if (e.target === box) { box.hidden = true; S.selected = null; renderBoard(); } };
  }

  function doMove(spec) {
    if (S.gameOver) return;
    const fenBefore = S.chess.fen();
    const mover = S.chess.turn();
    const now = performance.now();
    const elapsed = now - S.turnStart;
    const m = S.chess.move(spec);
    if (!m) return;
    S.used[mover] += elapsed;
    if (S.tc.base > 0) {
      S.clock[mover] -= elapsed;
      if (S.clock[mover] <= 0) { S.chess.undo(); flag(mover); return; }
      S.clock[mover] += S.tc.inc * 1000;
    }
    S.moves.push({
      ply: S.moves.length, color: mover, san: m.san, from: m.from, to: m.to, piece: m.piece,
      captured: m.captured || null, promotion: m.promotion || null, flags: m.flags,
      fenBefore, fenAfter: S.chess.fen(), thinkMs: elapsed, clockAfter: S.clock[mover],
    });
    S.positions.add(Engine.boardKey(Engine.fromFEN(S.chess.fen())));
    S.turnStart = now;
    S.selected = null;
    S.resignArmed = false; $('#resignBtn').textContent = '🏳 Resign';
    render();
    if (checkEnd()) return;
    if (S.chess.turn() !== S.userColor) {
      if (mover === S.userColor && m.captured && PV[m.captured] >= 5 && Math.random() < .7) say(pick(S.bot.band.ouch));
      scheduleBot();
    } else setStatus('Your move');
  }

  function checkEnd() {
    const c = S.chess;
    if (c.in_checkmate()) { endGame(c.turn() === S.userColor ? 'loss' : 'win', 'checkmate'); return true; }
    if (c.in_stalemate()) { endGame('draw', 'stalemate'); return true; }
    if (c.in_threefold_repetition()) { endGame('draw', 'threefold repetition'); return true; }
    if (c.insufficient_material()) { endGame('draw', 'insufficient material'); return true; }
    if (c.in_draw()) { endGame('draw', '50-move rule'); return true; }
    return false;
  }

  function scheduleBot() {
    const id = S.gameId;
    setStatus(`${S.bot.name} is thinking`, true);
    setTimeout(() => {
      if (id !== S.gameId || S.gameOver) return;
      const t0 = performance.now();
      const botColor = S.chess.turn();
      const remaining = S.tc.base > 0 ? S.clock[botColor] - (t0 - S.turnStart) : Infinity;
      const lvl = { ...S.bot.level };
      if (remaining !== Infinity) lvl.timeMs = Math.max(40, Math.min(lvl.timeMs, remaining / 30));
      if (S.moves.length < 10 && lvl.depth > 3) { lvl.depth = 3; lvl.noise = 12; }
      const res = Engine.chooseMove(S.chess.fen(), lvl, S.positions);
      if (!res) return;
      const spent = performance.now() - t0;
      const [lo, hi] = S.tc.delay;
      let target = rand(lo, hi) * (S.moves.length < 6 ? .5 : 1);
      if (res.capture && Math.random() < .5) target *= .5;
      if (remaining !== Infinity) target = Math.min(target, remaining / 25);
      const wait = Math.max(0, target - spent);
      setTimeout(() => {
        if (id !== S.gameId || S.gameOver) return;
        if (res.eval <= -900 && S.bot.elo >= 1100) S.botBadStreak++; else S.botBadStreak = 0;
        if (S.botBadStreak >= 3) { say('I resign. Well played!', 4000); endGame('win', 'resignation'); return; }
        const u = res.uci;
        const capturedBefore = S.chess.get(u.slice(2, 4));
        doMove({ from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] || undefined });
        if (S.gameOver) return;
        const last = S.moves[S.moves.length - 1];
        if (/[+]/.test(last.san) && Math.random() < .35) say(pick(S.bot.band.check));
        else if (capturedBefore && PV[capturedBefore.type] >= 3 && Math.random() < .5) say(pick(S.bot.band.capture));
      }, wait);
    }, 40);
  }

  // draw / resign / flip
  $('#drawBtn').addEventListener('click', () => {
    if (S.gameOver) return;
    const plies = S.moves.length;
    if (plies - S.lastDrawOfferPly < 12) { say('You just asked! Keep playing.'); return; }
    S.lastDrawOfferPly = plies;
    let ev = Engine.quickEval(S.chess.fen(), 150);
    const botEval = S.chess.turn() === S.userColor ? -ev : ev;
    if (botEval < -60 || (Math.abs(botEval) <= 40 && plies >= 40)) { say('A draw? Sure, I’ll take it.'); endGame('draw', 'agreement'); }
    else say(botEval > 150 ? 'A draw? In this position? No thanks.' : 'No thanks, I’m still playing for the win.');
  });
  $('#resignBtn').addEventListener('click', () => {
    if (S.gameOver) return;
    if (!S.resignArmed) { S.resignArmed = true; $('#resignBtn').textContent = 'Sure? Click again'; return; }
    endGame('loss', 'resignation');
  });
  $('#flipBtn').addEventListener('click', () => { S.orientation = S.orientation === 'w' ? 'b' : 'w'; renderBoard(); });

  function endGame(outcome, reason) {
    if (S.gameOver) return;
    const now = performance.now();
    const turn = S.chess.turn();
    S.used[turn] += now - S.turnStart;
    if (S.tc.base > 0 && reason !== 'timeout') S.clock[turn] -= now - S.turnStart;
    S.gameOver = true;
    S.result = { outcome, reason };
    updateClocks();
    $('#drawBtn').disabled = true; $('#resignBtn').disabled = true;
    const titles = { win: 'You won! 🎉', loss: 'You lost.', draw: 'A draw. ½–½' };
    const reasons = {
      checkmate: outcome === 'win' ? 'Checkmate, delivered with style.' : 'Checkmated. It happens to the best (ask Tal).',
      timeout: outcome === 'win' ? `${S.bot.name} ran out of time.` : 'Your flag fell. The clock is a cruel opponent.',
      resignation: outcome === 'win' ? `${S.bot.name} resigned.` : 'You resigned. Sometimes discretion is the better part of valour.',
      stalemate: 'Stalemate! Nobody can move, so nobody wins.', 'threefold repetition': 'Threefold repetition.',
      'insufficient material': 'Neither side has enough material left to mate.', '50-move rule': 'Fifty moves without a capture or pawn move.',
      agreement: 'Draw agreed.',
    };
    $('#endTitle').textContent = titles[outcome];
    const um = S.moves.filter((m) => m.color === S.userColor).length;
    $('#endText').textContent = reasons[reason] + (um < 4 ? ' (That’s a very short game, so the match will be mostly guesswork.)' : '');
    $('#endCard').hidden = false;
    setStatus(titles[outcome]);
    if (reason !== 'resignation' || outcome === 'loss') say(pick(outcome === 'win' ? S.bot.band.lose : outcome === 'loss' ? S.bot.band.win : ['Fair enough.', 'A fair result.']), 3500);
    renderBoard();
  }

  $('#revealBtn').addEventListener('click', runAnalysis);

  // ---------------- analysis ----------------
  function runAnalysis() {
    go('analyse');
    const um = S.moves.filter((m) => m.color === S.userColor);
    const evals = [];
    let i = 0, msgI = 0;
    const t0 = performance.now();
    const perMove = Math.max(50, Math.min(180, 7000 / Math.max(1, um.length)));
    $('#analyseMsg').textContent = ANALYSE_MSGS[0];
    const msgTimer = setInterval(() => { msgI = (msgI + 1) % ANALYSE_MSGS.length; $('#analyseMsg').textContent = ANALYSE_MSGS[msgI]; }, 1300);
    const finish = () => {
      clearInterval(msgTimer);
      const game = { userColor: S.userColor, tc: S.tc, moves: S.moves, result: S.result, finalFen: S.chess.fen(), evals };
      const profile = Analysis.buildProfile(game);
      const ranked = Analysis.matchPlayers(profile, { tc: S.tc, userColor: S.userColor, result: S.result.outcome });
      renderResults(game, profile, ranked);
      go('results');
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    };
    const step = () => {
      if (i >= um.length) {
        const wait = Math.max(0, 2400 - (performance.now() - t0));
        $('#analyseBar').style.width = '100%';
        setTimeout(finish, wait);
        return;
      }
      const m = um[i];
      try { evals.push(Engine.analyse(m.fenBefore, m.from + m.to + (m.promotion || ''), { depth: 4, timeMs: perMove })); }
      catch (e) { evals.push(null); }
      i++;
      $('#analyseBar').style.width = (i / um.length) * 100 + '%';
      $('#analyseSub').textContent = `Reviewing move ${i} of ${um.length}`;
      setTimeout(step, 0);
    };
    setTimeout(step, 50);
  }

  // ---------------- results ----------------
  function radarSVG(you, them, themName) {
    const axes = [
      ['Aggression', (f) => f.aggression], ['Sacrifice', (f) => f.sacrifice], ['Precision', (f) => f.precision],
      ['Speed', (f) => f.speed], ['Solidity', (f) => ((f.safety ?? .5) + 1 - (f.chaos ?? .5)) / 2], ['Grind', (f) => ((f.endurance ?? .5) + (f.simplify ?? .5)) / 2],
    ];
    const W = 360, H = 320, cx = W / 2, cy = H / 2 + 4, R = 112;
    const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
    let g = '';
    [.25, .5, .75, 1].forEach((lv) => { g += `<polygon class="grid" points="${axes.map((_, i) => pt(i, lv).join(',')).join(' ')}"/>`; });
    axes.forEach((ax, i) => {
      const [x, y] = pt(i, 1); g += `<line class="axis" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>`;
      const [lx, ly] = pt(i, 1.2);
      g += `<text class="lbl" x="${lx}" y="${ly + 4}" text-anchor="${Math.abs(lx - cx) < 5 ? 'middle' : lx > cx ? 'start' : 'end'}">${ax[0]}</text>`;
    });
    const series = (vals, cls, color, label) => {
      const pts = vals.map((v, i) => pt(i, Math.max(.04, v)));
      let s = `<polygon class="${cls}" points="${pts.map((p) => p.join(',')).join(' ')}"/>`;
      pts.forEach((p, i) => { s += `<circle class="pt" cx="${p[0]}" cy="${p[1]}" r="5" fill="${color}" data-tip="${esc(label)} · ${axes[i][0]}: ${Math.round(vals[i] * 100)}"/>`; });
      return s;
    };
    const yv = axes.map((a) => a[1](you));
    const tv = axes.map((a) => a[1](Object.assign({ aggression: .5, sacrifice: .5, precision: .5, speed: .5, safety: .5, chaos: .5, endurance: .5, simplify: .5 }, them)));
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Style radar: you versus ${esc(themName)}">${g}${series(tv, 'them', 'var(--them)', themName)}${series(yv, 'you', 'var(--you)', 'You')}</svg>`;
  }

  function stripSVG(profile) {
    const um = profile.um, rv = profile.review;
    const n = um.length; const W = 640, H = 170, padL = 34, padB = 22, padT = 8;
    if (!n) return '<p class="sub">No moves to show.</p>';
    const max = Math.max(...um.map((m) => m.thinkMs), 1000);
    const bw = (W - padL - 4) / n;
    const col = { best: 'var(--q-best)', good: 'var(--q-good)', inaccuracy: 'var(--q-inacc)', mistake: 'var(--q-mistake)', blunder: 'var(--q-blunder)' };
    let s = `<line class="base" x1="${padL}" x2="${W}" y1="${H - padB}" y2="${H - padB}"/>`;
    s += `<text x="${padL - 6}" y="${padT + 10}" text-anchor="end">${fmtSec(max)}</text><text x="${padL - 6}" y="${H - padB}" text-anchor="end">0</text>`;
    um.forEach((m, i) => {
      const h = Math.max(3, Math.sqrt(m.thinkMs / max) * (H - padB - padT));
      const x = padL + i * bw + 1, w = Math.max(2, bw - 2);
      const moveNo = Math.floor(m.ply / 2) + 1;
      s += `<rect x="${x}" y="${H - padB - h}" width="${w}" height="${h}" rx="${Math.min(4, w / 2)}" fill="${col[rv[i].cls]}" data-tip="${moveNo}${m.color === 'w' ? '.' : '…'} ${esc(m.san)} · ${fmtSec(m.thinkMs)} · ${rv[i].cls}"/>`;
      s += `<rect x="${padL + i * bw}" y="${padT}" width="${bw}" height="${H - padB - padT}" fill="transparent" data-tip="${moveNo}${m.color === 'w' ? '.' : '…'} ${esc(m.san)} · ${fmtSec(m.thinkMs)} · ${rv[i].cls}"/>`;
      if (n <= 40 ? i % 5 === 4 : i % 10 === 9) s += `<text x="${x + w / 2}" y="${H - 6}" text-anchor="middle">${i + 1}</text>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Thinking time per move, coloured by move quality">${s}</svg>`;
  }

  function evalSVG(profile) {
    const ev = profile.review.map((r) => r.best);
    const n = ev.length; const W = 640, H = 150, padL = 34, padB = 18, padT = 8;
    if (n < 2) return '<p class="sub">Not enough moves for an evaluation curve.</p>';
    const sq = (x) => Math.max(-1, Math.min(1, x / 600));
    const X = (i) => padL + (i / (n - 1)) * (W - padL - 6);
    const Y = (v) => padT + (1 - (sq(v) + 1) / 2) * (H - padB - padT);
    let s = `<line class="zero" x1="${padL}" x2="${W}" y1="${Y(0)}" y2="${Y(0)}"/>`;
    s += `<text x="${padL - 6}" y="${Y(600) + 10}" text-anchor="end">+6</text><text x="${padL - 6}" y="${Y(0) + 4}" text-anchor="end">0</text><text x="${padL - 6}" y="${Y(-600)}" text-anchor="end">−6</text>`;
    s += `<polyline class="evl" points="${ev.map((v, i) => X(i) + ',' + Y(v)).join(' ')}"/>`;
    ev.forEach((v, i) => {
      const m = profile.um[i];
      const txt = Math.abs(v) > 50000 ? (v > 0 ? 'mate for you' : 'mate against you') : (v >= 0 ? '+' : '') + (v / 100).toFixed(1);
      s += `<rect x="${X(i) - (W / n) / 2}" y="${padT}" width="${W / n}" height="${H - padB - padT}" fill="transparent" data-tip="Before ${esc(m.san)}: ${txt}"/>`;
    });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evaluation before each of your moves, from your side">${s}</svg>`;
  }

  function attachTips(container) {
    const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; container.appendChild(tip);
    container.addEventListener('pointermove', (e) => {
      const t = e.target.closest('[data-tip]');
      if (!t) { tip.hidden = true; return; }
      const r = container.getBoundingClientRect();
      tip.textContent = t.dataset.tip; tip.hidden = false;
      tip.style.left = Math.min(r.width - 60, Math.max(60, e.clientX - r.left)) + 'px'; tip.style.top = (e.clientY - r.top - 8) + 'px';
    });
    container.addEventListener('pointerleave', () => { tip.hidden = true; });
  }

  function renderResults(game, profile, ranked) {
    const top = ranked[0], p = top.p, s = profile.s, f = profile.f;
    let closest = null;
    try { closest = Analysis.closestGame(profile, game)[0] || null; } catch (e) { console.warn(e); }
    const arche = Analysis.archetype(profile, game.tc.id);
    const spirit = SPIRIT[game.tc.id];
    const outcomeTxt = { win: 'Win', loss: 'Loss', draw: 'Draw' }[game.result.outcome];
    const why = top.reasons.concat(top.traits).slice(0, 5);
    if (!why.length) why.push('Your overall style profile lined up most closely');
    const contrast = top.contrast.map((c) => `Where you differ: ${p.name.split(' ').pop()} ${DIFF[c.d][c.they]}.`);
    const longest = profile.um[s.longestIdx];
    const sacLine = s.sacs ? `You gave up material ${s.sacs} time${s.sacs > 1 ? 's' : ''}${s.soundSacs ? ` (${s.soundSacs} of them looked sound)` : ''}. ` : 'You never really gave material away. ';
    const narrative = `You played a ${game.tc.name.toLowerCase()} game (${game.tc.t}) as ${game.userColor === 'w' ? 'White' : 'Black'} against ${esc(S.bot.name)} (${S.bot.elo}). `
      + `The opening was the <strong>${esc(profile.opening.name)}</strong>, and after ${s.userMoves} moves of yours the game ended in a ${outcomeTxt.toLowerCase()} by ${game.result.reason}. `
      + `You averaged ${fmtSec(s.avgThink)} per move${longest ? `, and your longest think (${fmtSec(longest.thinkMs)}) came before <strong>${esc(longest.san)}</strong>` : ''}. `
      + sacLine + (s.castleMove ? `You castled ${s.castleSide === 'k' ? 'kingside' : 'queenside'} on move ${s.castleMove}. ` : 'Your king never castled. ')
      + (s.bongcloud ? 'And yes, we saw that early king walk. ' : '');

    const rankItem = (r, i) => `
      <li data-i="${i}">
        <span class="pos">${i + 1}</span>
        <span class="ini" style="background:${r.p.color}">${initials(r.p.name)}</span>
        <span class="nm"><strong>${esc(r.p.name)}</strong><span>${esc(r.p.nick)} · ${r.p.years}</span><div class="barwrap"><div class="barfill" style="width:${r.pct}%;background:${r.p.color}"></div></div></span>
        <span class="pc2">${r.pct}%</span>
        <div class="detail">${esc(r.p.bio)}${(r.reasons.concat(r.traits)).length ? '<br><em>' + esc(r.reasons.concat(r.traits).slice(0, 3).join(' · ')) + '</em>' : ''}<div class="itm">${r.p.item.e} <strong>${esc(r.p.item.n)}</strong>: ${esc(r.p.item.t)}</div></div>
      </li>`;

    const c = s.counts;
    $('#results').innerHTML = `
      <section class="r-hero" style="--legend:${p.color}">
        <div class="r-portrait"><span class="pct">${top.pct}% match</span><span class="initials">${initials(p.name)}</span><span class="item" title="${esc(p.item.n)}">${p.item.e}</span></div>
        <div class="r-body">
          <p class="eyebrow">Your chess legend</p>
          <h1>${esc(p.name)}</h1>
          <p class="nick">“${esc(p.nick)}” · ${p.years}</p>
          <span class="archetype">You are ${esc(arche)}</span>
          <p>${esc(p.bio)}</p>
          ${p.quote ? `<blockquote class="quote">“${esc(p.quote)}”</blockquote>` : ''}
          <ul class="why">${why.map((w) => `<li>${esc(w)}</li>`).join('')}${contrast.map((w) => `<li class="contrast">${esc(w)}</li>`).join('')}</ul>
          <div class="para"><span class="e">${p.item.e}</span><div><strong>Their paraphernalia: ${esc(p.item.n)}</strong><span>${esc(p.item.t)}</span></div></div>
        </div>
      </section>

      <section class="card">
        <h2>Your game in numbers</h2>
        <p class="sub">${esc(game.tc.name)} ${game.tc.t} · ${game.userColor === 'w' ? 'White' : 'Black'} vs ${esc(S.bot.name)} (${S.bot.elo})</p>
        <div class="tiles">
          <div class="tile"><div class="k">Result</div><div class="v">${outcomeTxt}</div><div class="h">by ${esc(game.result.reason)}</div></div>
          <div class="tile"><div class="k">Accuracy</div><div class="v">${s.userMoves ? Math.round(s.accuracy) + '%' : '–'}</div><div class="h">★ ${c.best + c.good} good · ?? ${c.blunder} blunders</div></div>
          <div class="tile"><div class="k">Avg. think</div><div class="v">${fmtSec(s.avgThink || 0)}</div><div class="h">${s.userMoves} moves played</div></div>
          <div class="tile"><div class="k">Sacrifices</div><div class="v">${s.sacs}</div><div class="h">${s.soundSacs} sound · ${s.checks} checks</div></div>
          <div class="tile" style="grid-column: span 2"><div class="k">Opening</div><div class="v small">${esc(profile.opening.name)}</div><div class="h">${profile.opening.plies} ${profile.opening.plies === 1 ? 'ply' : 'plies'} of known theory</div></div>
          <div class="tile" style="grid-column: span 2"><div class="k">Your spirit object</div><div class="v small">${spirit[0]} ${esc(spirit[1])}</div><div class="h">based on the pace you chose</div></div>
        </div>
        <p class="narrative">${narrative}</p>
      </section>

      <div class="two">
        <section class="card radar" id="radarCard">
          <h2>Style fingerprint</h2>
          <p class="sub">Six traits, scored 0–100.</p>
          <div class="legend"><span><i style="background:var(--you)"></i>You</span><span><i style="background:var(--them)"></i>${esc(p.name)}</span></div>
          ${radarSVG(f, p.v, p.name)}
        </section>
        <section class="card strip" id="stripCard">
          <h2>Pace and quality</h2>
          <p class="sub">Time spent on each of your moves, coloured by how good the move was.</p>
          <div class="legend">
            <span><i style="background:var(--q-best)"></i>Best</span><span><i style="background:var(--q-good)"></i>Good</span>
            <span><i style="background:var(--q-inacc)"></i>Inaccuracy</span><span><i style="background:var(--q-mistake)"></i>Mistake</span><span><i style="background:var(--q-blunder)"></i>Blunder</span>
          </div>
          ${stripSVG(profile)}
          <h2 style="font-size:18px;margin-top:14px">Evaluation</h2>
          <p class="sub" style="margin-bottom:6px">Position score before each of your moves, from your side, in pawns.</p>
          ${evalSVG(profile)}
        </section>
      </div>

      ${closestGameHTML(closest)}

      <section class="card rhythm" id="rhythmCard">
        <h2>Your rhythmogram</h2>
        <p class="sub">Your game as rhythm. Each of your moves is a beat on the real game clock, and each row blurs those beats at a different time scale, from about ¼ second at the bottom up to minutes at the top. Bright streaks mean bursts of quick moves, and dark gaps are where you stopped to think. Based on Neil Todd's multiscale rhythmogram.</p>
        <div class="rhythm-stats">${rhythmStats(game).map((x) => `<div class="tile"><div class="k">${x.k}</div><div class="v small">${esc(x.v)}</div><div class="h">${esc(x.h)}</div></div>`).join('')}</div>
        <div class="legend"><span><i style="background:linear-gradient(90deg,var(--surface-2),var(--you))"></i>Beat density: low → high</span><span><i style="background:var(--q-best)"></i>Your moves, coloured by quality</span><span><i style="background:var(--ink-3)"></i>Bot moves</span></div>
        <div class="rhythm-wrap"><canvas id="rhythmCanvas" aria-label="Multiscale rhythmogram of your move timing"></canvas></div>
      </section>

      <section class="card">
        <h2>Legend leaderboard</h2>
        <p class="sub">The players closest to how you played. Tap one for details.</p>
        <ol class="rank" id="rankList">${ranked.slice(0, 10).map(rankItem).join('')}</ol>
        <button class="btn more-btn" id="moreBtn">Show all ${ranked.length}</button>
      </section>

      <div class="actions">
        <button class="btn btn-primary btn-lg" id="againBtn">Play again ↻</button>
        <button class="btn" id="copyBtn">Copy my result</button>
        <button class="btn" id="cardBtn">🖼 Save result card (PNG)</button>
        <button class="btn" id="pgnBtn">Download PGN</button>
      </div>
      <p class="fineprint" style="text-align:center">Matches come from one game's statistics plus some chess folklore, so treat them as entertainment. The anecdotes are well-known stories, some of them half legend.</p>
    `;

    attachTips($('#radarCard')); attachTips($('#stripCard'));
    if (closest) bindReplay(closest);
    drawRhythm(game, profile);
    clearTimeout(renderResults._rt);
    window.onresize = () => { clearTimeout(renderResults._rt); renderResults._rt = setTimeout(() => { if ($('#rhythmCanvas')) drawRhythm(game, profile); }, 150); };
    const bindRank = () => $$('#rankList li').forEach((li) => li.addEventListener('click', () => li.classList.toggle('open')));
    bindRank();
    $('#moreBtn').addEventListener('click', (e) => { $('#rankList').innerHTML = ranked.map(rankItem).join(''); bindRank(); e.target.remove(); });
    $('#againBtn').addEventListener('click', () => { S.bot = null; renderSetup(); go('setup'); });
    $('#copyBtn').addEventListener('click', () => {
      const txt = `♞ Which Chess Legend? I'm ${top.pct}% ${p.name} (${p.nick}). ${arche}.\n`
        + `${outcomeTxt} vs ${S.bot.name} (${S.bot.elo}) · ${game.tc.name} ${game.tc.t} · ${profile.opening.name} · accuracy ${Math.round(s.accuracy)}%\n`
        + `Top 3: ${ranked.slice(0, 3).map((r) => `${r.p.name} ${r.pct}%`).join(', ')}`;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Copied to clipboard')).catch(() => toast('Couldn’t copy. Your browser blocked clipboard access.'));
    });
    $('#pgnBtn').addEventListener('click', () => downloadPGN(game));
    $('#cardBtn').addEventListener('click', () => saveCard({ game, profile, ranked, closest, arche, outcomeTxt }));
  }

  // ---------- closest famous game ----------
  function closestGameHTML(c) {
    if (!c) return '';
    const g = c.fg.g;
    const sideName = c.side === 'w' ? g.white : g.black;
    const colorName = c.side === 'w' ? 'White' : 'Black';
    const n = (window.FAMOUS_GAMES || []).length;
    const reasons = c.reasons.length ? c.reasons.slice(0, 5) : ['Your overall style was closest to this game'];
    const mvHtml = c.fg.moves.map((m, i) => `${i % 2 === 0 ? `<span class="cg-n">${i / 2 + 1}.</span>` : ''}<span class="cg-mv ${i < c.prefix ? 'shared' : ''}" data-ply="${i + 1}">${esc(m.san)}</span>`).join(' ');
    return `
      <section class="card closest" id="closestCard">
        <h2>Your closest famous game</h2>
        <p class="sub">Out of ${n} famous games, yours was most like this one. You played the ${colorName} side, which here belonged to <strong>${esc(sideName)}</strong>.</p>
        <div class="cg-grid">
          <div>
            <div class="cg-board" id="cgBoard"></div>
            <div class="cg-controls">
              <button class="btn" data-cg="first" aria-label="First move">⏮</button>
              <button class="btn" data-cg="prev" aria-label="Previous move">◀</button>
              <span id="cgPly"></span>
              <button class="btn" data-cg="next" aria-label="Next move">▶</button>
              <button class="btn" data-cg="last" aria-label="Last move">⏭</button>
            </div>
          </div>
          <div>
            <span class="cg-pct">${c.pct}% similar</span>
            <h3 class="cg-title">${esc(g.title)}</h3>
            <p class="cg-meta">${esc(g.white)} vs ${esc(g.black)} · ${esc(g.event)}, ${g.year} · <strong>${g.result.replace('1/2-1/2', '½–½')}</strong></p>
            <p>${esc(g.story)}</p>
            <ul class="why">${reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
            <div class="cg-moves" id="cgMoves">${mvHtml}</div>
            ${c.prefix ? '<p class="fineprint">Highlighted moves are the ones that match your game exactly.</p>' : ''}
          </div>
        </div>
      </section>`;
  }

  function bindReplay(c) {
    const moves = c.fg.moves;
    let ply = c.prefix > 0 ? c.prefix : moves.length;
    const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const draw = () => {
      const fen = ply === 0 ? START : moves[ply - 1].fenAfter;
      const b = new Chess(fen).board();
      const last = ply ? moves[ply - 1] : null;
      const flip = c.side === 'b';
      let html = '';
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
        const r = flip ? 7 - i : i, f = flip ? 7 - j : j;
        const sq = 'abcdefgh'[f] + (8 - r);
        const dark = (f + (8 - r)) % 2 === 1;
        const p = b[r][f];
        const lm = last && (last.from === sq || last.to === sq) ? ' last' : '';
        html += `<div class="sq ${dark ? 'd' : 'l'}${lm}">${p ? `<span class="piece ${p.color}">${GLYPH[p.type]}${VS}</span>` : ''}</div>`;
      }
      $('#cgBoard').innerHTML = html;
      $('#cgPly').textContent = ply === 0 ? 'Start' : `${Math.ceil(ply / 2)}${ply % 2 ? '.' : '…'} ${moves[ply - 1].san}`;
      $$('#cgMoves .cg-mv').forEach((el) => el.classList.toggle('cur', +el.dataset.ply === ply));
    };
    $$('[data-cg]').forEach((b) => b.addEventListener('click', () => {
      const a = b.dataset.cg;
      ply = a === 'first' ? 0 : a === 'last' ? moves.length : a === 'prev' ? Math.max(0, ply - 1) : Math.min(moves.length, ply + 1);
      draw();
    }));
    $$('#cgMoves .cg-mv').forEach((el) => el.addEventListener('click', () => { ply = +el.dataset.ply; draw(); }));
    draw();
  }

  // ---------- rhythmogram ----------
  function rhythmStats(game) {
    const um = game.moves.filter((m) => m.color === game.userColor);
    if (!um.length) return [];
    const t = um.map((m) => m.thinkMs);
    const mean = t.reduce((a, b) => a + b, 0) / t.length;
    const sd = Math.sqrt(t.reduce((a, b) => a + (b - mean) ** 2, 0) / t.length);
    const cv = mean ? sd / mean : 0;
    const sorted = [...t].sort((a, b) => a - b); const med = sorted[Math.floor(sorted.length / 2)];
    let streak = 0, best = 0;
    t.forEach((x) => { if (x <= med * .5 || x < 1500) { streak++; best = Math.max(best, streak); } else streak = 0; });
    const maxI = t.indexOf(Math.max(...t));
    const groove = cv < .5 ? ['Metronome', 'steady, even beats'] : cv < .9 ? ['Groove', 'mostly steady, a few long pauses']
      : cv < 1.4 ? ['Rubato', 'fast runs and long pauses'] : ['Free jazz', 'no steady beat at all'];
    return [
      { k: 'Tempo', v: `${(60000 / Math.max(mean, 1)).toFixed(1)} beats/min`, h: 'your moves per minute of thinking' },
      { k: 'Groove', v: groove[0], h: `${groove[1]} (variability ${cv.toFixed(2)})` },
      { k: 'Longest burst', v: `${best} quick move${best === 1 ? '' : 's'}`, h: 'in a row' },
      { k: 'Longest pause', v: fmtSec(t[maxI]), h: `before ${um[maxI].san}` },
    ];
  }

  function hexToRgb(h) {
    h = h.trim().replace('#', '');
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function drawRhythm(game, profile) {
    const cvs = $('#rhythmCanvas'); if (!cvs) return;
    const wrap = cvs.parentElement;
    const css = getComputedStyle(document.documentElement);
    const v = (n) => css.getPropertyValue(n).trim();
    const W = Math.max(280, wrap.clientWidth), H = W < 500 ? 200 : 240, dpr = window.devicePixelRatio || 1;
    cvs.width = W * dpr; cvs.height = H * dpr; cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
    const ctx = cvs.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);

    let acc = 0;
    const ev = game.moves.map((m) => { acc += m.thinkMs; return { t: acc / 1000, user: m.color === game.userColor, m }; });
    const T = Math.max(1, acc / 1000);
    const userEv = ev.filter((e) => e.user);
    const padL = 40, padR = 8, padT = 6, padB = 40;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const rows = 30, cols = Math.max(40, Math.min(220, Math.floor(plotW / 3)));
    const sMin = .25, sMax = Math.max(4, T / 2);
    const colSec = T / cols;
    const grid = [];
    for (let r = 0; r < rows; r++) {
      const sigma = sMin * Math.pow(sMax / sMin, r / (rows - 1));
      const se = Math.max(sigma, colSec * .6);
      const row = []; let mx = 0;
      for (let c = 0; c < cols; c++) {
        const tc = (c + .5) * colSec; let s = 0;
        for (const e of userEv) { const d = (tc - e.t) / se; if (d > -5 && d < 5) s += Math.exp(-.5 * d * d); }
        row.push(s); if (s > mx) mx = s;
      }
      grid.push({ sigma, vals: row.map((x) => (mx ? x / mx : 0)) });
    }
    const lo = hexToRgb(v('--surface-2') || '#efe6d4'), hi = hexToRgb(v('--you') || '#d2492a');
    const cw = plotW / cols, rh = plotH / rows;
    grid.forEach((g, r) => {
      g.vals.forEach((x, c) => {
        const k = Math.pow(x, .8);
        ctx.fillStyle = `rgb(${lo.map((L, i) => Math.round(L + (hi[i] - L) * k)).join(',')})`;
        ctx.fillRect(padL + c * cw, padT + (rows - 1 - r) * rh, cw + .6, rh + .6);
      });
    });
    // event track
    const qc = { best: v('--q-best'), good: v('--q-good'), inaccuracy: v('--q-inacc'), mistake: v('--q-mistake'), blunder: v('--q-blunder') };
    const ty = padT + plotH + 4;
    let ui = 0;
    ev.forEach((e) => {
      const x = padL + (e.t / T) * plotW;
      if (e.user) { const rv = profile.review[ui++]; ctx.fillStyle = (rv && qc[rv.cls]) || v('--you'); ctx.fillRect(x - 1, ty, 2.5, 12); }
      else { ctx.fillStyle = v('--ink-3'); ctx.fillRect(x - .5, ty + 6, 1.5, 6); }
    });
    // axes
    ctx.fillStyle = v('--ink-3'); ctx.font = '11px "DM Sans", sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const fmtS = (s) => (s < 1 ? '¼s' : s < 60 ? Math.round(s) + 's' : Math.round(s / 60) + 'm');
    ctx.fillText(fmtS(sMax), padL - 6, padT + 6); ctx.fillText('¼s', padL - 6, padT + plotH - 6);
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    for (let i = 0; i <= 4; i++) {
      const s = (T * i) / 4; const mm = Math.floor(s / 60), ss = Math.round(s % 60);
      ctx.textAlign = i === 0 ? 'left' : i === 4 ? 'right' : 'center';
      ctx.fillText(`${mm}:${String(ss).padStart(2, '0')}`, padL + (plotW * i) / 4, H - 6);
    }
    // hover
    let tip = wrap.querySelector('.tip');
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; wrap.appendChild(tip); }
    tip.hidden = true;
    cvs.onpointermove = (e) => {
      const rect = cvs.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (x < padL || x > padL + plotW) { tip.hidden = true; return; }
      const t = ((x - padL) / plotW) * T;
      const stamp = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
      let text;
      if (y > padT + plotH) {
        let bestE = null, bd = Infinity;
        for (const ev2 of ev) { const d = Math.abs(ev2.t - t); if (d < bd) { bd = d; bestE = ev2; } }
        if (!bestE || bd > T / 40) { tip.hidden = true; return; }
        text = `${bestE.user ? 'You' : 'Bot'}: ${bestE.m.san} after ${fmtSec(bestE.m.thinkMs)}`;
      } else {
        const r = rows - 1 - Math.floor((y - padT) / rh), c = Math.floor((x - padL) / cw);
        const g = grid[Math.max(0, Math.min(rows - 1, r))];
        text = `${stamp} · scale ≈ ${g.sigma < 10 ? g.sigma.toFixed(1) : Math.round(g.sigma)}s · density ${Math.round((g.vals[c] || 0) * 100)}%`;
      }
      tip.textContent = text; tip.hidden = false;
      tip.style.left = Math.min(rect.width - 80, Math.max(80, x)) + 'px'; tip.style.top = (y - 8) + 'px';
    };
    cvs.onpointerleave = () => { tip.hidden = true; };
  }

  // ---------- shareable PNG result card ----------
  function wrapLines(ctx, text, maxW) {
    const words = String(text).split(' '); const lines = []; let line = '';
    for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
    if (line) lines.push(line); return lines;
  }
  function fitFont(ctx, text, weight, family, maxSize, maxW) {
    let size = maxSize;
    do { ctx.font = `${weight} ${size}px ${family}`; size -= 2; } while (ctx.measureText(text).width > maxW && size > 18);
    return size + 2;
  }
  function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  async function saveCard(d) {
    const btn = $('#cardBtn'); if (btn) btn.disabled = true;
    try {
      try { await document.fonts.ready; await Promise.all(['900 40px Fraunces', 'italic 500 30px Fraunces', '700 20px "DM Sans"', '40px "Noto Sans Symbols 2"'].map((f) => document.fonts.load(f))); } catch (e) { /* use fallbacks */ }
      const W = 1080, H = 1350;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const c = cv.getContext('2d');
      const SERIF = 'Fraunces, Georgia, serif', SANS = '"DM Sans", system-ui, sans-serif';
      const C = { bg: '#f5efe3', surface: '#fffaf0', tile: '#efe6d4', ink: '#1f1a14', ink2: '#5b5145', ink3: '#8a7f70', line: '#ddd1bb', you: '#d2492a', them: '#1f6f6b' };
      const { game, profile, ranked, closest, arche, outcomeTxt } = d;
      const top = ranked[0], p = top.p, s = profile.s;
      const M = 56;

      c.fillStyle = C.bg; c.fillRect(0, 0, W, H);

      // ---- hero band ----
      const bandH = 400;
      c.fillStyle = p.color; c.fillRect(0, 0, W, bandH);
      c.save(); c.beginPath(); c.rect(0, 0, W, bandH); c.clip();
      c.globalAlpha = .1; c.fillStyle = '#fff'; c.font = `340px "Noto Sans Symbols 2", serif`; c.textBaseline = 'alphabetic';
      c.fillText('♞', W - 330, bandH + 40); c.globalAlpha = 1; c.restore();
      c.fillStyle = 'rgba(255,255,255,.85)'; c.font = `700 22px ${SANS}`;
      c.fillText('WHICH CHESS LEGEND?  ·  MY RESULT', M, 82);
      c.fillStyle = '#fff'; c.font = `700 34px ${SANS}`;
      c.fillText(`I'm ${top.pct}%`, M, 150);
      fitFont(c, p.name, 900, SERIF, 92, W - M * 2 - 150);
      c.fillText(p.name, M, 245);
      c.font = `italic 500 32px ${SERIF}`; c.fillStyle = 'rgba(255,255,255,.9)';
      c.fillText(`“${p.nick}” · ${p.years}`, M, 290);
      // archetype pill
      c.font = `700 24px ${SANS}`;
      const at = `I am ${arche}`; const aw = c.measureText(at).width + 36;
      roundRect(c, M, 318, Math.min(aw, W - M * 2), 50, 12); c.fillStyle = 'rgba(0,0,0,.28)'; c.fill();
      c.fillStyle = '#fff'; c.fillText(at, M + 18, 351);
      // item badge
      c.beginPath(); c.arc(W - M - 62, 150, 62, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.2)'; c.fill();
      c.font = `64px ${SANS}`; c.textAlign = 'center'; c.fillText(p.item.e, W - M - 62, 174); c.textAlign = 'left';

      // ---- stat tiles ----
      let y = bandH + 36;
      const tiles = [
        ['RESULT', outcomeTxt, `by ${game.result.reason}`],
        ['ACCURACY', s.userMoves ? Math.round(s.accuracy) + '%' : '–', `${s.counts.blunder} blunder${s.counts.blunder === 1 ? '' : 's'}`],
        ['AVG. THINK', fmtSec(s.avgThink || 0), `${s.userMoves} moves`],
        ['PACE', `${game.tc.t}`, game.tc.name],
      ];
      const tw = (W - M * 2 - 3 * 16) / 4;
      tiles.forEach((t, i) => {
        const x = M + i * (tw + 16);
        roundRect(c, x, y, tw, 112, 18); c.fillStyle = C.surface; c.fill();
        c.fillStyle = C.ink3; c.font = `700 17px ${SANS}`; c.fillText(t[0], x + 20, y + 34);
        c.fillStyle = C.ink; fitFont(c, t[1], 700, SERIF, 40, tw - 40); c.fillText(t[1], x + 20, y + 74);
        c.fillStyle = C.ink2; c.font = `500 17px ${SANS}`; c.fillText(wrapLines(c, t[2], tw - 40)[0], x + 20, y + 98);
      });
      y += 112 + 18;
      roundRect(c, M, y, W - M * 2, 62, 18); c.fillStyle = C.surface; c.fill();
      c.fillStyle = C.ink3; c.font = `700 17px ${SANS}`; c.fillText('OPENING', M + 20, y + 38);
      c.fillStyle = C.ink; fitFont(c, profile.opening.name, 700, SERIF, 28, W - M * 2 - 300); c.fillText(profile.opening.name, M + 130, y + 40);
      c.fillStyle = C.ink2; c.font = `500 17px ${SANS}`; c.textAlign = 'right';
      c.fillText(`vs ${S.bot.name} (${S.bot.elo}) · ${game.userColor === 'w' ? 'White' : 'Black'}`, W - M - 20, y + 38); c.textAlign = 'left';
      y += 62 + 24;

      // ---- radar (left) + top 5 (right) ----
      const panelH = 350;
      roundRect(c, M, y, 440, panelH, 22); c.fillStyle = C.surface; c.fill();
      roundRect(c, M + 456, y, W - M * 2 - 456, panelH, 22); c.fill();
      const axes = [['Aggression', (f) => f.aggression], ['Sacrifice', (f) => f.sacrifice], ['Precision', (f) => f.precision], ['Speed', (f) => f.speed],
        ['Solidity', (f) => ((f.safety ?? .5) + 1 - (f.chaos ?? .5)) / 2], ['Grind', (f) => ((f.endurance ?? .5) + (f.simplify ?? .5)) / 2]];
      const pv = Object.assign({ aggression: .5, sacrifice: .5, precision: .5, speed: .5, safety: .5, chaos: .5, endurance: .5, simplify: .5 }, p.v);
      const cx = M + 220, cy = y + 196, R = 104;
      const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
      c.strokeStyle = C.line; c.lineWidth = 1.5;
      [.25, .5, .75, 1].forEach((lv) => { c.beginPath(); axes.forEach((_, i) => { const [px, py] = pt(i, lv); i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath(); c.stroke(); });
      c.fillStyle = C.ink2; c.font = `500 16px ${SANS}`; c.textAlign = 'center';
      axes.forEach((a, i) => { const [lx, ly] = pt(i, 1.28); c.fillText(a[0], lx, ly + 6); });
      const poly = (vals, color, fillA, dash) => {
        c.beginPath(); vals.forEach((v, i) => { const [px, py] = pt(i, Math.max(.04, v)); i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.closePath();
        c.globalAlpha = fillA; c.fillStyle = color; c.fill(); c.globalAlpha = 1;
        c.setLineDash(dash); c.strokeStyle = color; c.lineWidth = 3; c.stroke(); c.setLineDash([]);
      };
      poly(axes.map((a) => a[1](pv)), C.them, .14, [8, 6]);
      poly(axes.map((a) => a[1](profile.f)), C.you, .22, []);
      c.textAlign = 'left'; c.font = `700 16px ${SANS}`;
      c.fillStyle = C.you; c.fillRect(M + 24, y + 26, 14, 14); c.fillStyle = C.ink2; c.fillText('You', M + 46, y + 39);
      c.fillStyle = C.them; c.fillRect(M + 100, y + 26, 14, 14); c.fillStyle = C.ink2; c.fillText(p.name.split(' ').pop(), M + 122, y + 39);

      const rx = M + 456 + 28, rw = W - M * 2 - 456 - 56;
      c.fillStyle = C.ink; c.font = `700 30px ${SERIF}`; c.fillText('Legend leaderboard', rx, y + 52);
      ranked.slice(0, 5).forEach((r, i) => {
        const ry = y + 92 + i * 54;
        c.beginPath(); c.arc(rx + 22, ry + 6, 22, 0, Math.PI * 2); c.fillStyle = r.p.color; c.fill();
        c.fillStyle = '#fff'; c.font = `900 16px ${SERIF}`; c.textAlign = 'center'; c.fillText(initials(r.p.name), rx + 22, ry + 12); c.textAlign = 'left';
        c.fillStyle = C.ink; fitFont(c, r.p.name, 700, SANS, 21, rw - 140); c.fillText(r.p.name, rx + 58, ry + 4);
        c.font = `700 21px ${SANS}`; c.textAlign = 'right'; c.fillText(r.pct + '%', rx + rw, ry + 4); c.textAlign = 'left';
        roundRect(c, rx + 58, ry + 16, rw - 58, 8, 4); c.fillStyle = C.tile; c.fill();
        roundRect(c, rx + 58, ry + 16, (rw - 58) * r.pct / 100, 8, 4); c.fillStyle = r.p.color; c.fill();
      });
      y += panelH + 24;

      // ---- closest game + rhythm ----
      const boxH = 196;
      roundRect(c, M, y, W - M * 2, boxH, 22); c.fillStyle = C.surface; c.fill();
      c.fillStyle = C.ink3; c.font = `700 17px ${SANS}`; c.fillText('CLOSEST FAMOUS GAME', M + 24, y + 38);
      if (closest) {
        const g = closest.fg.g;
        c.fillStyle = C.ink; fitFont(c, g.title, 700, SERIF, 30, 560); c.fillText(g.title, M + 24, y + 76);
        c.fillStyle = C.ink2; c.font = `500 17px ${SANS}`;
        c.fillText(`${g.white} vs ${g.black}, ${g.year} · ${closest.pct}% similar`, M + 24, y + 104);
      }
      // rhythm strip
      const rxs = M + 24, rys = y + 122, rws = W - M * 2 - 48, rhs = 52;
      c.fillStyle = C.ink3; c.font = `700 17px ${SANS}`; c.textAlign = 'right'; c.fillText('MY RHYTHM', W - M - 24, y + 38); c.textAlign = 'left';
      let acc = 0; const ev = game.moves.map((m) => { acc += m.thinkMs; return { t: acc / 1000, user: m.color === game.userColor }; });
      const T = Math.max(1, acc / 1000); const uev = ev.filter((e) => e.user);
      const cols = 180, rows = 10, sMin = .25, sMax = Math.max(4, T / 2), colSec = T / cols;
      const lo = hexToRgb(C.tile), hi = hexToRgb(C.you);
      for (let r = 0; r < rows; r++) {
        const sig = Math.max(sMin * Math.pow(sMax / sMin, r / (rows - 1)), colSec * .6);
        const row = []; let mx = 0;
        for (let k = 0; k < cols; k++) { const tc = (k + .5) * colSec; let sum = 0; for (const e of uev) { const z = (tc - e.t) / sig; if (z > -5 && z < 5) sum += Math.exp(-.5 * z * z); } row.push(sum); if (sum > mx) mx = sum; }
        row.forEach((val, k) => { const kk = Math.pow(mx ? val / mx : 0, .8); c.fillStyle = `rgb(${lo.map((L, i) => Math.round(L + (hi[i] - L) * kk)).join(',')})`; c.fillRect(rxs + k * rws / cols, rys + (rows - 1 - r) * rhs / rows, rws / cols + .7, rhs / rows + .7); });
      }
      const groove = rhythmStats(game)[1];
      if (groove) { c.fillStyle = C.ink2; c.font = `500 17px ${SANS}`; c.textAlign = 'right'; c.fillText(`${groove.v} · ${rhythmStats(game)[0].v}`, W - M - 24, y + 104); c.textAlign = 'left'; }
      y += boxH + 22;

      // ---- paraphernalia line ----
      c.fillStyle = C.ink2; c.font = `500 20px ${SANS}`;
      const para = `${p.item.e}  ${p.item.n}: ${p.item.t}`;
      const pl = wrapLines(c, para, W - M * 2);
      c.fillText(pl.length > 1 ? pl[0].replace(/[\s,.;:]*$/, '') + '…' : pl[0], M, y + 16);

      // ---- footer ----
      c.fillStyle = C.ink; c.fillRect(0, H - 64, W, 64);
      c.fillStyle = C.bg; c.font = `700 19px ${SANS}`;
      c.fillText('♞ Which Chess Legend?', M, H - 26);
      c.textAlign = 'right'; c.font = `500 17px ${SANS}`;
      c.fillText(`Santiago Renteria with Claude Code · renterialab.com · ${new Date().toLocaleDateString()}`, W - M, H - 26);
      c.textAlign = 'left';

      const blob = await new Promise((res) => cv.toBlob(res, 'image/png'));
      const fname = `chess-legend-${p.id}-${new Date().toISOString().slice(0, 10)}.png`;
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fname;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      toast('Result card saved');
    } catch (e) {
      console.error(e); toast('Sorry, the image could not be created');
    } finally { if (btn) btn.disabled = false; }
  }

  function downloadPGN(game) {
    const g = new Chess();
    for (const m of game.moves) g.move(m.san);
    const res = game.result.outcome === 'draw' ? '1/2-1/2' : (game.result.outcome === 'win') === (game.userColor === 'w') ? '1-0' : '0-1';
    const botLabel = `${S.bot.name} (bot)`;
    const d = new Date();
    g.header('Event', 'Which Chess Legend?', 'Site', 'Your browser', 'Date', `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`,
      'White', game.userColor === 'w' ? 'You' : botLabel, 'Black', game.userColor === 'b' ? 'You' : botLabel,
      game.userColor === 'w' ? 'BlackElo' : 'WhiteElo', String(S.bot.elo),
      'TimeControl', game.tc.base ? `${game.tc.base}+${game.tc.inc}` : '-', 'Result', res, 'Termination', game.result.reason);
    let pgn = g.pgn();
    if (!/(1-0|0-1|1\/2-1\/2)\s*$/.test(pgn)) pgn += ' ' + res;
    const blob = new Blob([pgn + '\n'], { type: 'application/x-chess-pgn' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'chess-legend-game.pgn';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ---------------- boot ----------------
  if (typeof Chess === 'undefined') {
    document.querySelector('main').innerHTML = '<p style="padding:40px">Could not load chess.js. Please check your connection or serve the folder locally.</p>';
    return;
  }
  renderHeroBoard();
  window.__ccl = S; // handy for debugging
})();
