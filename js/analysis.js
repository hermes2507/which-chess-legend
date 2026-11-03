/* Turns a finished game into a style profile, then ranks the legends against it. */
(function (global) {
  'use strict';
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const PV = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

  // ---------- opening book (SAN sequences, check marks stripped) ----------
  const OPENINGS = [
    ['e4', "King's Pawn Opening"], ['d4', "Queen's Pawn Opening"], ['c4', 'English Opening'], ['Nf3', 'Réti Opening'],
    ['b3', "Larsen's Opening"], ['f4', "Bird's Opening"], ['g3', "King's Fianchetto Opening"], ['g4', "Grob's Attack"],
    ['b4', 'Polish (Sokolsky) Opening'], ['e3', "Van 't Kruijs Opening"], ['a3', "Anderssen's Opening"], ['c3', 'Saragossa Opening'],
    ['d3', 'Mieses Opening'], ['a4', 'Ware Opening'], ['h4', 'Desprez Opening'], ['Nh3', 'Amar (Paris) Opening'],
    ['Na3', 'Durkin Opening'], ['Nc3', 'Dunst Opening'], ['h3', 'Clemenz Opening'], ['f3', 'Barnes Opening'],
    ['e4 e5', 'Open Game'], ['e4 c5', 'Sicilian Defence'], ['e4 e6', 'French Defence'], ['e4 c6', 'Caro-Kann Defence'],
    ['e4 d5', 'Scandinavian Defence'], ['e4 Nf6', "Alekhine's Defence"], ['e4 d6', 'Pirc Defence'], ['e4 g6', 'Modern Defence'],
    ['e4 b6', "Owen's Defence"], ['e4 Nc6', 'Nimzowitsch Defence'],
    ['e4 e5 Nf3', "King's Knight Opening"], ['e4 e5 Ke2', 'Bongcloud Attack'], ['e4 e5 f4', "King's Gambit"],
    ['e4 e5 f4 exf4', "King's Gambit Accepted"], ['e4 e5 Nc3', 'Vienna Game'], ['e4 e5 Bc4', "Bishop's Opening"],
    ['e4 e5 d4 exd4 Qxd4', 'Center Game'], ['e4 e5 d4 exd4 c3', 'Danish Gambit'], ['e4 e5 Qh5', 'Wayward Queen Attack'],
    ['e4 e5 Nf3 Nf6', "Petrov's Defence"], ['e4 e5 Nf3 d6', 'Philidor Defence'], ['e4 e5 Nf3 f5', 'Latvian Gambit'],
    ['e4 e5 Nf3 d5', 'Elephant Gambit'], ['e4 e5 Nf3 f6', 'Damiano Defence'], ['e4 e5 Nf3 Nc6 d4', 'Scotch Game'],
    ['e4 e5 Nf3 Nc6 Bb5', 'Ruy López'], ['e4 e5 Nf3 Nc6 Bb5 Nf6', 'Ruy López, Berlin Defence'],
    ['e4 e5 Nf3 Nc6 Bb5 a6', 'Ruy López, Morphy Defence'], ['e4 e5 Nf3 Nc6 Bc4', 'Italian Game'],
    ['e4 e5 Nf3 Nc6 Bc4 Bc5', 'Italian Game, Giuoco Piano'], ['e4 e5 Nf3 Nc6 Bc4 Bc5 b4', 'Evans Gambit'],
    ['e4 e5 Nf3 Nc6 Bc4 Nf6', 'Two Knights Defence'], ['e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7', 'Fried Liver Attack'],
    ['e4 e5 Nf3 Nc6 Nc3 Nf6', 'Four Knights Game'], ['e4 e5 Nf3 Nc6 c3', 'Ponziani Opening'],
    ['e4 c5 Nf3 d6 d4', 'Open Sicilian'], ['e4 c5 Nf3 Nc6 d4', 'Open Sicilian'], ['e4 c5 Nf3 e6 d4', 'Open Sicilian'],
    ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6', 'Sicilian, Najdorf'], ['e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6', 'Sicilian, Dragon'],
    ['e4 c5 d4 cxd4 c3', 'Smith-Morra Gambit'], ['e4 c5 c3', 'Alapin Sicilian'], ['e4 c5 Nc3', 'Closed Sicilian'],
    ['e4 e6 d4 d5 e5', 'French, Advance'], ['e4 e6 d4 d5 Nc3 Bb4', 'French, Winawer'], ['e4 e6 d4 d5 exd5', 'French, Exchange'],
    ['e4 c6 d4 d5 e5', 'Caro-Kann, Advance'], ['e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5', 'Caro-Kann, Classical'],
    ['e4 d5 exd5 Qxd5', 'Scandinavian, Main Line'], ['e4 d5 exd5 Qxd5 Nc3 Qa5', 'Scandinavian, Main Line'],
    ['d4 d5 c4', "Queen's Gambit"], ['d4 d5 c4 dxc4', "Queen's Gambit Accepted"], ['d4 d5 c4 e6', "Queen's Gambit Declined"],
    ['d4 d5 c4 c6', 'Slav Defence'], ['d4 d5 c4 e5', 'Albin Countergambit'], ['d4 d5 Bf4', 'London System'],
    ['d4 Nf6 Bf4', 'London System'], ['d4 d5 Nf3 Nf6 Bf4', 'London System'], ['d4 d5 Nc3 Nf6 Bf4', 'Jobava London'],
    ['d4 Nf6', 'Indian Defence'], ['d4 Nf6 c4 g6 Nc3 Bg7', "King's Indian Defence"], ['d4 Nf6 c4 g6 Nc3 d5', 'Grünfeld Defence'],
    ['d4 Nf6 c4 e6 Nc3 Bb4', 'Nimzo-Indian Defence'], ['d4 Nf6 c4 e6 Nf3 b6', "Queen's Indian Defence"],
    ['d4 Nf6 c4 c5', 'Benoni Defence'], ['d4 Nf6 c4 e5', 'Budapest Gambit'], ['d4 f5', 'Dutch Defence'], ['d4 e5', 'Englund Gambit'],
    ['d4 Nf6 Bg5', 'Trompowsky Attack'], ['d4 Nf6 c4 e6 g3', 'Catalan Opening'], ['d4 d5 c4 e6 g3', 'Catalan Opening'],
    ['c4 c5', 'English, Symmetrical'], ['c4 e5', 'English, Reversed Sicilian'], ['Nf3 d5 g3', "Réti, King's Indian Attack"],
    ['d4 d5 e3 Nf6 Bd3', 'Stonewall Attack'],
  ].map(([seq, name]) => ({ seq: seq.split(' '), name }));

  function detectOpening(sans) {
    const clean = sans.map((s) => s.replace(/[+#?!]/g, ''));
    let best = null; const trail = [];
    for (const o of OPENINGS) {
      if (o.seq.length > clean.length) continue;
      let ok = true;
      for (let i = 0; i < o.seq.length; i++) if (o.seq[i] !== clean[i]) { ok = false; break; }
      if (ok) { trail.push(o); if (!best || o.seq.length > best.seq.length) best = o; }
    }
    trail.sort((a, b) => a.seq.length - b.seq.length);
    return { name: best ? best.name : 'Uncharted Territory', plies: best ? best.seq.length : 0, trail: trail.map((t) => t.name) };
  }

  function material(fen) {
    const out = { w: 0, b: 0, wq: 0, bq: 0, pieces: 0 };
    for (const ch of fen.split(' ')[0]) {
      const l = ch.toLowerCase();
      if (!(l in PV)) continue;
      const c = ch === l ? 'b' : 'w';
      out[c] += PV[l];
      if (l === 'q') out[c + 'q']++;
      if (l !== 'p' && l !== 'k') out.pieces++;
    }
    return out;
  }

  // Lichess-style accuracy from centipawns
  const winPct = (cp) => 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * cp)) - 1);
  const moveAccuracy = (before, after) => clamp(103.1668 * Math.exp(-0.04354 * (winPct(before) - winPct(after))) - 3.1669, 0, 100);
  const capCp = (x) => Math.max(-1500, Math.min(1500, x));

  function classify(loss) {
    if (loss <= 12) return 'best';
    if (loss <= 50) return 'good';
    if (loss <= 120) return 'inaccuracy';
    if (loss <= 300) return 'mistake';
    return 'blunder';
  }

  /* game: { userColor, tc:{id,base,inc}, moves:[...], result:{outcome:'win'|'loss'|'draw', reason}, finalFen, evals:[per user move {best,played}] } */
  function buildProfile(game) {
    const uc = game.userColor;
    const moves = game.moves;
    const um = moves.filter((m) => m.color === uc);
    const n = Math.max(1, um.length);
    const fens = moves.map((m) => m.fenBefore).concat([game.finalFen]);
    const adv = (i) => { const m = material(fens[Math.min(i, fens.length - 1)]); return uc === 'w' ? m.w - m.b : m.b - m.w; };
    const relRank = (sq) => (uc === 'w' ? +sq[1] : 9 - +sq[1]);

    // per-move engine review
    const review = um.map((m, k) => {
      const e = game.evals[k];
      if (!e) return { loss: 0, cls: 'good', acc: 80, best: 0, played: 0 };
      const best = capCp(e.best), played = capCp(e.played);
      const loss = Math.max(0, best - played);
      return { loss, cls: classify(loss), acc: moveAccuracy(best, played), best, played, bestUci: e.bestUci };
    });

    let captures = 0, checks = 0, enemyHalf = 0, pawnAdv = 0, queenEarly = 0, kingWalks = 0;
    let knightMoves = 0, bishopMoves = 0, castleMove = 0, castleSide = null, bongcloud = false, underpromo = false, promos = 0;
    let trades = 0, sacs = 0, soundSacs = 0, bigSacs = 0, exchangeSac = false, skipUntil = -1;
    um.forEach((m, k) => {
      const i = moves.indexOf(m);
      const moveNo = k + 1;
      if (m.captured) captures++;
      if (/[+#]/.test(m.san)) checks++;
      if (m.piece !== 'k' && relRank(m.to) >= 5) enemyHalf++;
      if (m.piece === 'p' && relRank(m.to) >= 5) pawnAdv++;
      if (m.piece === 'q' && moveNo <= 10) queenEarly++;
      if (m.piece === 'n') knightMoves++;
      if (m.piece === 'b') bishopMoves++;
      if (m.promotion) { promos++; if (m.promotion !== 'q') underpromo = true; }
      if (/[kq]/.test(m.flags) && !castleMove) { castleMove = moveNo; castleSide = m.flags.includes('k') ? 'k' : 'q'; }
      if (m.piece === 'k' && !/[kq]/.test(m.flags)) {
        const mat = material(m.fenBefore);
        if (mat.wq && mat.bq && moveNo <= 25) kingWalks++;
        if (moveNo <= 3) bongcloud = true;
      }
      // trades: user captures and gets recaptured on the same square by similar value (or vice-versa)
      const next = moves[i + 1];
      if (m.captured && next && next.captured && next.to === m.to && Math.abs(PV[m.captured] - PV[m.piece]) <= 1) trades++;
      const prev = moves[i - 1];
      if (m.captured && prev && prev.captured && prev.to === m.to && Math.abs(PV[prev.captured] - PV[prev.piece]) <= 1) trades++;
      // sacrifices: material deficit appears after the reply and persists
      if (i > skipUntil) {
        const before = adv(i), a2 = adv(i + 2), a4 = adv(i + 4);
        const lost2 = a2 - before, lost4 = (i + 4 <= moves.length ? a4 : a2) - before;
        const reply = moves[i + 1];
        const invited = reply && reply.captured && reply.to === m.to; // the material was offered by THIS move
        if (invited && lost2 <= -2 && lost4 <= -2) {
          sacs++;
          const rv = review[k];
          const deliveredMate = game.result.outcome === 'win' && game.result.reason === 'checkmate' && moves.length - i <= 8;
          if ((rv.loss <= 80 && rv.played >= -150) || deliveredMate) soundSacs++;
          if (-lost4 >= 3) bigSacs++;
          const botCaps = [moves[i + 1], moves[i + 3]].filter((x) => x && x.color !== uc && x.captured).map((x) => x.captured);
          if (botCaps.includes('r') && -lost4 === 2) exchangeSac = true;
          skipUntil = i + 3;
        }
      }
    });

    const counts = { best: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 };
    review.forEach((r) => counts[r.cls]++);
    // blend of arithmetic and harmonic mean (harmonic punishes blunders, like Lichess)
    let accuracy = 0;
    if (review.length) {
      const arith = review.reduce((a, r) => a + r.acc, 0) / review.length;
      const harm = review.length / review.reduce((a, r) => a + 1 / Math.max(5, r.acc), 0);
      accuracy = (arith + harm) / 2;
    }

    // time
    const thinks = um.map((m) => m.thinkMs);
    const avgThink = thinks.reduce((a, b) => a + b, 0) / n;
    const sd = Math.sqrt(thinks.reduce((a, b) => a + (b - avgThink) ** 2, 0) / n);
    const cv = avgThink ? sd / avgThink : 0;
    const timed = game.tc.base > 0;
    const expected = timed ? (game.tc.base * 1000) / 40 + game.tc.inc * 1000 : 20000;
    const speed = clamp(1 - avgThink / expected / 2);
    let timeTrouble;
    if (timed) timeTrouble = clamp((um.filter((m) => m.clockAfter < game.tc.base * 1000 * 0.15).length / n) * 2.5);
    else {
      const sorted = [...thinks].sort((a, b) => a - b); const med = sorted[Math.floor(sorted.length / 2)] || 1;
      timeTrouble = clamp((thinks.filter((t) => t > med * 3).length / n) * 3);
    }
    const longestIdx = thinks.indexOf(Math.max(...thinks));
    const fastestIdx = thinks.indexOf(Math.min(...thinks));
    const firstThink = thinks[0] || 0;
    const longFirstThink = um.length >= 3 && (firstThink >= 15000 || (firstThink > 4 * avgThink && firstThink > 6000));

    const opening = detectOpening(moves.map((m) => m.san));
    const userSans = um.map((m) => m.san.replace(/[+#]/g, ''));
    const firstMove = userSans[0] || '';
    const flankOpening = uc === 'w' && ['c4', 'Nf3', 'b3', 'g3', 'f4', 'b4'].includes(firstMove);
    const weirdFirst = uc === 'w' && ['a3', 'a4', 'h3', 'h4', 'g4', 'Na3', 'Nh3', 'f3', 'b4'].includes(firstMove);

    // eval trajectory (user perspective) & comeback detection
    const evalLine = review.map((r) => r.best);
    const minEval = evalLine.length ? Math.min(...evalLine) : 0;
    const comeback = minEval <= -250 && game.result.outcome !== 'loss';

    // queens
    const fmat = material(game.finalFen);
    const queensOff = !fmat.wq && !fmat.bq;
    let queensOffPly = -1;
    for (let i = 0; i < fens.length; i++) { const m = material(fens[i]); if (!m.wq && !m.bq) { queensOffPly = i; break; } }
    const queensOffEarly = queensOffPly >= 0 && queensOffPly <= 40;

    const tempoMap = { bullet: 1, blitz: .75, rapid: .5, classical: .25, untimed: .1 };
    const safety = castleMove ? (castleMove <= 10 ? 1 : castleMove <= 16 ? .65 : .4) : (um.length < 10 ? .5 : .1);

    const f = {
      aggression: clamp((captures + checks * 1.5 + enemyHalf * 0.4) / n / 0.9),
      sacrifice: clamp((soundSacs + (sacs - soundSacs) * 0.4) / Math.max(1, n / 20)),
      precision: clamp((accuracy - 45) / 50),
      speed,
      tempo: tempoMap[game.tc.id] ?? .5,
      safety,
      kingWalk: clamp(kingWalks / 3 + (bongcloud ? .5 : 0)),
      queenEarly: clamp(queenEarly / 3),
      pawnStorm: clamp((pawnAdv / n) * 3.5),
      simplify: clamp(trades / 6 + (queensOffEarly ? .25 : 0)),
      endurance: clamp(moves.length / 140),
      theory: clamp(opening.plies / 14),
      knights: knightMoves + bishopMoves ? knightMoves / (knightMoves + bishopMoves) : .5,
      chaos: clamp(counts.blunder * .25 + counts.mistake * .1 + cv * .25),
      timeTrouble,
    };
    const balanced = ['aggression', 'sacrifice', 'precision', 'speed', 'safety', 'chaos'].every((d) => f[d] >= .25 && f[d] <= .75);

    const stats = {
      userMoves: um.length, totalPlies: moves.length, captures, checks, sacs, soundSacs, bigSacs, exchangeSac,
      trades, promos, underpromo, castleMove, castleSide, bongcloud, kingWalks, queensOff, queensOffEarly,
      accuracy, counts, avgThink, longestIdx, fastestIdx, thinks, firstThink, longFirstThink, firstMove,
      flankOpening, weirdFirst, comeback, minEval, evalLine, balanced, bookPlies: opening.plies,
    };
    return { f, s: stats, review, opening, um };
  }

  // ---------- matching ----------
  const DIM_W = {
    aggression: 1.3, sacrifice: 1.2, precision: .8, speed: 1.1, tempo: 1.1, safety: .8, kingWalk: .7, queenEarly: .6,
    pawnStorm: .7, simplify: 1, endurance: .8, theory: .8, knights: .4, chaos: 1, timeTrouble: .8,
  };
  const DIM_LABEL = {
    aggression: ['You both go for the throat', 'You both prefer to keep the peace'],
    sacrifice: ['You both give away material for the initiative', 'You both hang on to every pawn'],
    precision: ['You both play clean, accurate moves', 'You both prefer adventures to accuracy'],
    speed: ['You both move at lightning speed', 'You both take your time to think'],
    tempo: ['You share a love of fast time controls', 'You share a love of slow, serious chess'],
    safety: ['You both tuck the king away early', 'You both leave the king in the centre'],
    kingWalk: ['Your kings both like to go for a walk', 'You both keep the king at home'],
    queenEarly: ['You both bring the queen out early', 'You both keep the queen back'],
    pawnStorm: ['You both push pawns up the board', 'You both keep your pawns compact'],
    simplify: ['You both like to trade pieces and simplify', 'You both avoid trades and keep the tension'],
    endurance: ['You both grind long games', 'You both like to finish quickly'],
    theory: ['You both know your opening theory', 'You both leave the book early'],
    knights: ['You both prefer knights', 'You both prefer bishops'],
    chaos: ['You both thrive in chaos', 'You both keep the game under control'],
    timeTrouble: ['You both live on the edge of the clock', 'You both manage the clock well'],
  };

  function matchPlayers(profile, ctxExtra) {
    const ctx = Object.assign({ f: profile.f, s: profile.s, openingTrail: profile.opening.trail }, ctxExtra);
    const ranked = global.PLAYERS.map((p) => {
      let sum = 0, wsum = 0;
      const diffs = [];
      for (const [d, pv] of Object.entries(p.v)) {
        const w = DIM_W[d] || 1;
        const diff = profile.f[d] - pv;
        sum += w * diff * diff; wsum += w;
        diffs.push({ d, pv, uv: profile.f[d], diff: Math.abs(diff), distinct: Math.abs(pv - .5) });
      }
      const dist = Math.sqrt(sum / wsum);
      const sim = clamp(1 - dist);
      const reasons = [];
      let bonus = 0;
      for (const tag of p.tags || []) { try { if (tag.t(ctx)) { bonus += tag.b; reasons.push(tag.why); } } catch (e) { /* ignore */ } }
      const traits = diffs.filter((x) => x.distinct >= .2 && x.diff <= .22)
        .sort((a, b) => (a.diff - a.distinct) - (b.diff - b.distinct)).slice(0, 3)
        .map((x) => DIM_LABEL[x.d][x.pv >= .5 ? 0 : 1]);
      const contrast = diffs.filter((x) => x.diff >= .4).sort((a, b) => b.diff - a.diff).slice(0, 1)
        .map((x) => ({ d: x.d, they: x.pv >= .5 ? 0 : 1 }));
      const score = clamp(sim + bonus, .03, .99);
      return { p, score, pct: Math.round(score * 100), reasons, traits, contrast };
    });
    ranked.sort((a, b) => b.score - a.score);
    return ranked;
  }

  // ---------- archetype title ----------
  function archetype(profile, tcId) {
    const f = profile.f;
    const adjectives = [
      ['sacrifice', 'Romantic'], ['aggression', 'Swashbuckling'], ['precision', 'Clinical'], ['simplify', 'Minimalist'],
      ['safety', 'Fortified'], ['kingWalk', 'Fearless-Kinged'], ['chaos', 'Chaotic'], ['theory', 'Bookish'],
      ['endurance', 'Relentless'], ['queenEarly', 'Queen-First'], ['pawnStorm', 'Pawn-Storming'], ['timeTrouble', 'Clock-Teasing'],
    ];
    let best = adjectives[0], bv = -1;
    for (const a of adjectives) { const v = f[a[0]] - (a[0] === 'safety' ? .25 : 0); if (v > bv) { bv = v; best = a; } }
    if (bv < .45) best = ['', 'Balanced'];
    const nouns = { bullet: 'Speed Demon', blitz: 'Coffeehouse Hustler', rapid: 'Club Tactician', classical: 'Tournament Scholar', untimed: 'Correspondence Philosopher' };
    return `The ${best[1]} ${nouns[tcId] || 'Wanderer'}`;
  }

  // ---------- closest famous game ----------
  let famousCache = null;
  function famousProfiles() {
    if (famousCache) return famousCache;
    famousCache = [];
    for (const g of global.FAMOUS_GAMES || []) {
      try {
        const c = new global.Chess();
        const moves = [];
        for (const san of g.pgn.split(' ')) {
          const fenBefore = c.fen(); const color = c.turn();
          const m = c.move(san); if (!m) throw new Error('bad move ' + san);
          moves.push({ ply: moves.length, color, san: m.san, from: m.from, to: m.to, piece: m.piece, captured: m.captured || null,
            promotion: m.promotion || null, flags: m.flags, fenBefore, fenAfter: c.fen(), thinkMs: 0, clockAfter: 0 });
        }
        const mate = c.in_checkmate();
        const sides = {};
        for (const side of ['w', 'b']) {
          const outcome = g.result === '1/2-1/2' ? 'draw' : (g.result === '1-0') === (side === 'w') ? 'win' : 'loss';
          const prof = buildProfile({ userColor: side, tc: { id: 'classical', base: 0, inc: 0 }, moves, result: { outcome, reason: mate ? 'checkmate' : 'resignation' }, finalFen: c.fen(), evals: [] });
          sides[side] = { prof, outcome };
        }
        famousCache.push({ g, moves, sans: moves.map((m) => m.san.replace(/[+#]/g, '')), mate, sides });
      } catch (e) { /* skip broken entries */ }
    }
    return famousCache;
  }

  const STYLE_DIMS = ['aggression', 'sacrifice', 'safety', 'kingWalk', 'queenEarly', 'pawnStorm', 'simplify', 'endurance', 'knights'];
  function closestGame(profile, game) {
    const userSans = game.moves.map((m) => m.san.replace(/[+#]/g, ''));
    const userSet = new Set(game.moves.filter((m) => m.color === game.userColor).map((m) => m.san.replace(/[+#]/g, '')));
    const userMate = game.result.reason === 'checkmate';
    const out = [];
    for (const fg of famousProfiles()) {
      for (const side of ['w', 'b']) {
        const sp = fg.sides[side];
        let prefix = 0;
        if (side === game.userColor) while (prefix < userSans.length && prefix < fg.sans.length && userSans[prefix] === fg.sans[prefix]) prefix++;
        const sideSet = new Set(fg.moves.filter((m) => m.color === side).map((m) => m.san.replace(/[+#]/g, '')));
        const inter = [...userSet].filter((x) => sideSet.has(x)).length;
        const jacc = inter / Math.max(1, new Set([...userSet, ...sideSet]).size);
        let sum = 0;
        for (const d of STYLE_DIMS) sum += (profile.f[d] - sp.prof.f[d]) ** 2;
        const styleScore = 1 - Math.sqrt(sum / STYLE_DIMS.length);
        const sameOutcome = sp.outcome === game.result.outcome;
        const bothMate = userMate && fg.mate && sameOutcome;
        const lenScore = 1 - Math.abs(game.moves.length - fg.moves.length) / Math.max(game.moves.length, fg.moves.length);
        const score = .30 * clamp(prefix / 10) + .10 * clamp(jacc * 2) + .35 * styleScore + .12 * (sameOutcome ? 1 : 0) + .05 * (bothMate ? 1 : 0) + .08 * lenScore;
        const reasons = [];
        if (prefix >= 2) reasons.push(`Your first ${prefix} plies were identical to this game${profile.opening.plies && prefix >= profile.opening.plies ? ` (${profile.opening.name})` : ''}`);
        else if (side === game.userColor && userSans.length && fg.sans.length && side === 'w' && userSans[0] === fg.sans[0]) reasons.push(`Same first move: 1.${fg.sans[0]}`);
        if (bothMate) reasons.push(game.result.outcome === 'win' ? 'Both games ended with a checkmate by your side' : 'Both games ended in checkmate against your side');
        else if (sameOutcome) reasons.push(`Same result for your side: ${sp.outcome}`);
        STYLE_DIMS.filter((d) => profile.f[d] >= .6 && sp.prof.f[d] >= .6).slice(0, 2).forEach((d) => reasons.push(DIM_LABEL[d][0]));
        if (lenScore > .8) reasons.push(`A similar length (${Math.ceil(game.moves.length / 2)} vs ${Math.ceil(fg.moves.length / 2)} moves)`);
        if (inter >= 4) reasons.push(`${inter} of your moves also appear in this game`);
        out.push({ fg, side, score, pct: Math.round(clamp(score) * 100), reasons, prefix });
      }
    }
    out.sort((a, b) => b.score - a.score);
    return out;
  }

  global.Analysis = { buildProfile, matchPlayers, archetype, detectOpening, closestGame, DIM_LABEL, material };
})(typeof window !== 'undefined' ? window : globalThis);
