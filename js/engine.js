/* Tiny 0x88 chess engine: move generation, alpha-beta search, quiescence.
   Exposes global `Engine` (works in browser and Node). */
(function (global) {
  'use strict';
  const P = 1, N = 2, B = 3, R = 4, Q = 5, K = 6;
  const VAL = [0, 100, 320, 330, 500, 900, 0];
  const N_OFF = [-33, -31, -18, -14, 14, 18, 31, 33];
  const B_OFF = [-17, -15, 15, 17];
  const R_OFF = [-16, -1, 1, 16];
  const K_OFF = [-17, -16, -15, -1, 1, 15, 16, 17];
  const MATE = 100000;
  const INF = 1000000;

  // Castling-rights mask per square (bits: 1=WK 2=WQ 4=BK 8=BQ)
  const CR = new Int8Array(128).fill(15);
  CR[112] = 15 & ~2; CR[116] = 15 & ~3; CR[119] = 15 & ~1;
  CR[0] = 15 & ~8; CR[4] = 15 & ~12; CR[7] = 15 & ~4;

  // Piece-square tables (white's view, a8 first) - "simplified evaluation function"
  const PST = {};
  PST[P] = [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5,
    0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0];
  PST[N] = [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30,
    -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50];
  PST[B] = [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10,
    -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20];
  PST[R] = [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5,
    -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0];
  PST[Q] = [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5,
    0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20];
  const K_MG = [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10,
    20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20];
  const K_EG = [-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30,
    -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30,
    -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50];
  const PHASE = [0, 0, 1, 1, 2, 4, 0];

  const sq64 = (sq) => (sq >> 4) * 8 + (sq & 7);
  const mirror64 = (i) => (7 - (i >> 3)) * 8 + (i & 7);

  function Pos() {
    this.b = new Int8Array(128);
    this.side = 0; this.castle = 0; this.ep = -1; this.half = 0;
    this.kings = [0, 0];
    this.stack = [];
  }

  const LETTERS = { p: P, n: N, b: B, r: R, q: Q, k: K };
  function sqFromName(s) { return (8 - parseInt(s[1], 10)) * 16 + (s.charCodeAt(0) - 97); }
  function sqName(sq) { return String.fromCharCode(97 + (sq & 7)) + (8 - (sq >> 4)); }

  function fromFEN(fen) {
    const pos = new Pos();
    const parts = fen.trim().split(/\s+/);
    let r = 0, f = 0;
    for (const ch of parts[0]) {
      if (ch === '/') { r++; f = 0; continue; }
      if (ch >= '1' && ch <= '8') { f += +ch; continue; }
      const lower = ch.toLowerCase();
      const color = ch === lower ? 1 : 0;
      const t = LETTERS[lower];
      const sq = r * 16 + f;
      pos.b[sq] = t | (color << 3);
      if (t === K) pos.kings[color] = sq;
      f++;
    }
    pos.side = parts[1] === 'b' ? 1 : 0;
    const c = parts[2] || '-';
    if (c.includes('K')) pos.castle |= 1;
    if (c.includes('Q')) pos.castle |= 2;
    if (c.includes('k')) pos.castle |= 4;
    if (c.includes('q')) pos.castle |= 8;
    pos.ep = parts[3] && parts[3] !== '-' ? sqFromName(parts[3]) : -1;
    pos.half = parts[4] ? parseInt(parts[4], 10) || 0 : 0;
    return pos;
  }

  function boardKey(pos) {
    let s = '';
    for (let sq = 0; sq < 128; sq++) { if (sq & 0x88) { sq += 7; continue; } s += String.fromCharCode(65 + pos.b[sq]); }
    return s + pos.side;
  }

  function attacked(pos, sq, by) {
    const b = pos.b;
    // pawns
    if (by === 0) {
      let s = sq + 15; if (!(s & 0x88) && b[s] === P) return true;
      s = sq + 17; if (!(s & 0x88) && b[s] === P) return true;
    } else {
      let s = sq - 15; if (!(s & 0x88) && b[s] === (P | 8)) return true;
      s = sq - 17; if (!(s & 0x88) && b[s] === (P | 8)) return true;
    }
    const cb = by << 3;
    for (let i = 0; i < 8; i++) { const s = sq + N_OFF[i]; if (!(s & 0x88) && b[s] === (N | cb)) return true; }
    for (let i = 0; i < 8; i++) { const s = sq + K_OFF[i]; if (!(s & 0x88) && b[s] === (K | cb)) return true; }
    for (let i = 0; i < 4; i++) {
      const d = B_OFF[i]; let s = sq + d;
      while (!(s & 0x88)) { const p = b[s]; if (p) { if (p === (B | cb) || p === (Q | cb)) return true; break; } s += d; }
    }
    for (let i = 0; i < 4; i++) {
      const d = R_OFF[i]; let s = sq + d;
      while (!(s & 0x88)) { const p = b[s]; if (p) { if (p === (R | cb) || p === (Q | cb)) return true; break; } s += d; }
    }
    return false;
  }

  const mk = (from, to, promo, flag) => from | (to << 7) | (promo << 14) | (flag << 17);
  const mFrom = (m) => m & 127, mTo = (m) => (m >> 7) & 127, mPromo = (m) => (m >> 14) & 7, mFlag = (m) => m >> 17;

  function genMoves(pos, capsOnly) {
    const out = [];
    const b = pos.b, side = pos.side;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = b[sq];
      if (!p || (p >> 3) !== side) continue;
      const t = p & 7;
      if (t === P) {
        const dir = side === 0 ? -16 : 16;
        const startRank = side === 0 ? 6 : 1;
        const promoRank = side === 0 ? 0 : 7;
        let to = sq + dir;
        if (!(to & 0x88) && !b[to]) {
          if ((to >> 4) === promoRank) {
            out.push(mk(sq, to, Q, 0));
            if (!capsOnly) { out.push(mk(sq, to, N, 0)); out.push(mk(sq, to, R, 0)); out.push(mk(sq, to, B, 0)); }
          } else if (!capsOnly) {
            out.push(mk(sq, to, 0, 0));
            if ((sq >> 4) === startRank && !b[to + dir]) out.push(mk(sq, to + dir, 0, 1));
          }
        }
        for (const d of [dir - 1, dir + 1]) {
          to = sq + d;
          if (to & 0x88) continue;
          const q = b[to];
          if (q && (q >> 3) !== side) {
            if ((to >> 4) === promoRank) {
              out.push(mk(sq, to, Q, 0));
              if (!capsOnly) { out.push(mk(sq, to, N, 0)); out.push(mk(sq, to, R, 0)); out.push(mk(sq, to, B, 0)); }
            } else out.push(mk(sq, to, 0, 0));
          } else if (to === pos.ep) out.push(mk(sq, to, 0, 2));
        }
      } else if (t === N || t === K) {
        const offs = t === N ? N_OFF : K_OFF;
        for (let i = 0; i < 8; i++) {
          const to = sq + offs[i];
          if (to & 0x88) continue;
          const q = b[to];
          if (!q) { if (!capsOnly) out.push(mk(sq, to, 0, 0)); }
          else if ((q >> 3) !== side) out.push(mk(sq, to, 0, 0));
        }
        if (t === K && !capsOnly) {
          const opp = side ^ 1;
          if (side === 0 && sq === 116) {
            if ((pos.castle & 1) && !b[117] && !b[118] && b[119] === R && !attacked(pos, 116, opp) && !attacked(pos, 117, opp) && !attacked(pos, 118, opp)) out.push(mk(116, 118, 0, 3));
            if ((pos.castle & 2) && !b[115] && !b[114] && !b[113] && b[112] === R && !attacked(pos, 116, opp) && !attacked(pos, 115, opp) && !attacked(pos, 114, opp)) out.push(mk(116, 114, 0, 3));
          } else if (side === 1 && sq === 4) {
            if ((pos.castle & 4) && !b[5] && !b[6] && b[7] === (R | 8) && !attacked(pos, 4, opp) && !attacked(pos, 5, opp) && !attacked(pos, 6, opp)) out.push(mk(4, 6, 0, 3));
            if ((pos.castle & 8) && !b[3] && !b[2] && !b[1] && b[0] === (R | 8) && !attacked(pos, 4, opp) && !attacked(pos, 3, opp) && !attacked(pos, 2, opp)) out.push(mk(4, 2, 0, 3));
          }
        }
      } else {
        const offs = t === B ? B_OFF : t === R ? R_OFF : K_OFF;
        for (let i = 0; i < offs.length; i++) {
          const d = offs[i]; let to = sq + d;
          while (!(to & 0x88)) {
            const q = b[to];
            if (!q) { if (!capsOnly) out.push(mk(sq, to, 0, 0)); }
            else { if ((q >> 3) !== side) out.push(mk(sq, to, 0, 0)); break; }
            to += d;
          }
        }
      }
    }
    return out;
  }

  // returns true if legal (mover's king not left in check); always call unmake afterwards
  function make(pos, m) {
    const b = pos.b, side = pos.side;
    const from = mFrom(m), to = mTo(m), promo = mPromo(m), flag = mFlag(m);
    const p = b[from];
    let cap = b[to];
    let capSq = to;
    if (flag === 2) { capSq = to + (side === 0 ? 16 : -16); cap = b[capSq]; b[capSq] = 0; }
    pos.stack.push(cap | (pos.castle << 4) | ((pos.ep + 1) << 8) | (pos.half << 16));
    b[to] = promo ? (promo | (side << 3)) : p;
    b[from] = 0;
    if (flag === 3) {
      if (to === 118) { b[117] = b[119]; b[119] = 0; }
      else if (to === 114) { b[115] = b[112]; b[112] = 0; }
      else if (to === 6) { b[5] = b[7]; b[7] = 0; }
      else if (to === 2) { b[3] = b[0]; b[0] = 0; }
    }
    if ((p & 7) === K) pos.kings[side] = to;
    pos.castle &= CR[from] & CR[to];
    pos.ep = flag === 1 ? (from + to) >> 1 : -1;
    pos.half = ((p & 7) === P || cap) ? 0 : pos.half + 1;
    pos.side ^= 1;
    return !attacked(pos, pos.kings[side], side ^ 1);
  }

  function unmake(pos, m) {
    const b = pos.b;
    pos.side ^= 1;
    const side = pos.side;
    const from = mFrom(m), to = mTo(m), promo = mPromo(m), flag = mFlag(m);
    const u = pos.stack.pop();
    const cap = u & 15;
    pos.castle = (u >> 4) & 15;
    pos.ep = ((u >> 8) & 255) - 1;
    pos.half = u >>> 16;
    const p = promo ? (P | (side << 3)) : b[to];
    b[from] = p;
    if (flag === 2) { b[to] = 0; b[to + (side === 0 ? 16 : -16)] = cap; }
    else b[to] = cap;
    if (flag === 3) {
      if (to === 118) { b[119] = b[117]; b[117] = 0; }
      else if (to === 114) { b[112] = b[115]; b[115] = 0; }
      else if (to === 6) { b[7] = b[5]; b[5] = 0; }
      else if (to === 2) { b[0] = b[3]; b[3] = 0; }
    }
    if ((p & 7) === K) pos.kings[side] = from;
  }

  function evaluate(pos) {
    const b = pos.b;
    let s = 0, phase = 0, wb = 0, bb = 0, wk = 0, bk = 0;
    for (let sq = 0; sq < 128; sq++) {
      if (sq & 0x88) { sq += 7; continue; }
      const p = b[sq]; if (!p) continue;
      const t = p & 7, c = p >> 3;
      phase += PHASE[t];
      if (t === K) { if (c === 0) wk = sq; else bk = sq; continue; }
      const i = c === 0 ? sq64(sq) : mirror64(sq64(sq));
      const v = VAL[t] + PST[t][i];
      if (c === 0) { s += v; if (t === B) wb++; } else { s -= v; if (t === B) bb++; }
    }
    if (wb >= 2) s += 30; if (bb >= 2) s -= 30;
    const ph = Math.min(phase, 24) / 24;
    const wi = sq64(wk), bi = mirror64(sq64(bk));
    s += K_MG[wi] * ph + K_EG[wi] * (1 - ph);
    s -= K_MG[bi] * ph + K_EG[bi] * (1 - ph);
    return pos.side === 0 ? s : -s;
  }

  // ---------------- search ----------------
  const S = { nodes: 0, deadline: 0, stop: false, killers: [] };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  function orderScore(pos, m, killerA, killerB) {
    const to = mTo(m);
    const cap = pos.b[to];
    if (cap) return 100000 + VAL[cap & 7] * 10 - VAL[pos.b[mFrom(m)] & 7] / 10;
    if (mFlag(m) === 2) return 100000 + 1000 - 10;
    if (mPromo(m)) return 90000 + VAL[mPromo(m)];
    if (m === killerA) return 80000;
    if (m === killerB) return 79000;
    return 0;
  }

  function sortMoves(pos, moves, ply, first) {
    const k = S.killers[ply] || [0, 0];
    const scored = moves.map((m) => [m === first ? 1e9 : orderScore(pos, m, k[0], k[1]), m]);
    scored.sort((a, b) => b[0] - a[0]);
    return scored.map((x) => x[1]);
  }

  function qsearch(pos, alpha, beta, ply) {
    if ((++S.nodes & 2047) === 0 && now() > S.deadline) S.stop = true;
    if (S.stop) return 0;
    const stand = evaluate(pos);
    if (stand >= beta) return stand;
    if (stand > alpha) alpha = stand;
    if (ply > 40) return stand;
    const moves = sortMoves(pos, genMoves(pos, true), ply, 0);
    for (const m of moves) {
      // delta pruning
      const cap = pos.b[mTo(m)];
      if (cap && stand + VAL[cap & 7] + 200 < alpha && !mPromo(m)) continue;
      if (!make(pos, m)) { unmake(pos, m); continue; }
      const sc = -qsearch(pos, -beta, -alpha, ply + 1);
      unmake(pos, m);
      if (S.stop) return 0;
      if (sc >= beta) return sc;
      if (sc > alpha) alpha = sc;
    }
    return alpha;
  }

  function search(pos, depth, alpha, beta, ply) {
    if ((++S.nodes & 2047) === 0 && now() > S.deadline) S.stop = true;
    if (S.stop) return 0;
    if (pos.half >= 100) return 0;
    const inCheck = attacked(pos, pos.kings[pos.side], pos.side ^ 1);
    if (inCheck && ply < 12) depth++;
    if (depth <= 0) return qsearch(pos, alpha, beta, ply);
    const moves = sortMoves(pos, genMoves(pos, false), ply, 0);
    let legal = 0, best = -INF;
    for (const m of moves) {
      if (!make(pos, m)) { unmake(pos, m); continue; }
      legal++;
      const sc = -search(pos, depth - 1, -beta, -alpha, ply + 1);
      unmake(pos, m);
      if (S.stop) return 0;
      if (sc > best) best = sc;
      if (sc > alpha) {
        alpha = sc;
        if (alpha >= beta) {
          if (!pos.b[mTo(m)]) {
            const k = S.killers[ply] || (S.killers[ply] = [0, 0]);
            if (k[0] !== m) { k[1] = k[0]; k[0] = m; }
          }
          break;
        }
      }
    }
    if (!legal) return inCheck ? -MATE + ply : 0;
    return best;
  }

  function legalMoves(pos) {
    const res = [];
    for (const m of genMoves(pos, false)) { if (make(pos, m)) res.push(m); unmake(pos, m); }
    return res;
  }

  function toUci(m) {
    const promo = mPromo(m);
    return sqName(mFrom(m)) + sqName(mTo(m)) + (promo ? ' pnbrqk'[promo] : '');
  }

  /* Root search.
     opts: { depth, timeMs, exact (full window per root move -> true scores),
             margin (cp: every move within `margin` of the best gets a true score; the rest are
                     upper bounds already more than `margin` below the best),
             history: Set of boardKeys }
     returns { scores: [{m, uci, score, capture, check}], best, depthReached, nodes } */
  function rootSearch(fen, opts) {
    const pos = fromFEN(fen);
    const maxDepth = opts.depth || 3;
    S.nodes = 0; S.stop = false; S.killers = [];
    S.deadline = now() + (opts.timeMs || 1000);
    const history = opts.history || null;
    const margin = opts.margin || 0;
    let root = legalMoves(pos).map((m) => {
      const capture = !!pos.b[mTo(m)] || mFlag(m) === 2;
      make(pos, m);
      const check = attacked(pos, pos.kings[pos.side], pos.side ^ 1);
      const rep = history ? history.has(boardKey(pos)) : false;
      unmake(pos, m);
      return { m, uci: toUci(m), score: 0, capture, check, rep };
    });
    if (!root.length) return { scores: [], best: null, depthReached: 0, nodes: 0 };
    if (opts.shuffle) root.sort(() => Math.random() - 0.5);
    root = sortMoves(pos, root.map((r) => r.m), 0, 0).map((m) => root.find((r) => r.m === m));
    let completed = null, depthReached = 0;
    for (let d = 1; d <= maxDepth; d++) {
      let alpha = -INF;
      const cur = [];
      for (const r of root) {
        make(pos, r.m);
        let sc;
        if (r.rep) sc = 0;
        else if (opts.exact) sc = -search(pos, d - 1, -INF, INF, 1);
        else sc = -search(pos, d - 1, -INF, -(alpha - margin), 1);
        unmake(pos, r.m);
        if (S.stop) break;
        cur.push({ ...r, score: sc });
        if (sc > alpha) alpha = sc;
      }
      if (S.stop && completed) break;
      if (S.stop) { // first iteration incomplete: fill remaining with static guesses
        for (const r of root) if (!cur.find((c) => c.m === r.m)) cur.push({ ...r, score: -INF / 2 });
      }
      cur.sort((a, b) => b.score - a.score);
      completed = cur; depthReached = d;
      root = cur.map((c) => root.find((r) => r.m === c.m));
      if (S.stop) break;
      if (cur[0].score > MATE - 1000) break; // found a mate
    }
    return { scores: completed, best: completed[0], depthReached, nodes: S.nodes };
  }

  /* Bot move choice with skill parameters:
     level = { depth, timeMs, noise, blunder, aggression } */
  const CAPTURE_BONUS = 12, CHECK_BONUS = 15;
  function chooseMove(fen, level, history) {
    // Without exact scores, non-best root moves only carry upper bounds. Adding a style bonus to a
    // bound can make a move that really drops the queen look better than the best move, so we widen
    // the root window by the largest bonus: every move that could win with its bonus gets a true score.
    const maxBonus = (CAPTURE_BONUS + CHECK_BONUS) * (level.aggression || 0);
    const res = rootSearch(fen, {
      depth: level.depth, timeMs: level.timeMs, exact: level.noise > 0,
      margin: Math.ceil(maxBonus) + 1, history, shuffle: true,
    });
    if (!res.scores.length) return null;
    const list = res.scores;
    if (level.blunder && Math.random() < level.blunder && list.length > 1) {
      // a "human" blunder: pick a random move but avoid instantly hanging mate-in-1 too often
      const pool = list.filter((x) => x.score > -MATE + 1000);
      const pickFrom = pool.length ? pool : list;
      return { ...pickFrom[Math.floor(Math.random() * pickFrom.length)], eval: list[0].score, depth: res.depthReached, blunder: true };
    }
    let best = null, bestVal = -Infinity;
    for (const x of list) {
      let v = x.score + (Math.random() * 2 - 1) * (level.noise || 0);
      if (level.aggression) v += ((x.capture ? CAPTURE_BONUS : 0) + (x.check ? CHECK_BONUS : 0)) * level.aggression;
      if (x.score > MATE - 1000) v += 1e6; // never miss a found mate
      if (v > bestVal) { bestVal = v; best = x; }
    }
    return { ...best, eval: list[0].score, depth: res.depthReached, blunder: false };
  }

  /* Analysis for post-game review: returns best & played scores from mover's perspective */
  function analyse(fen, playedUci, opts) {
    const res = rootSearch(fen, { depth: (opts && opts.depth) || 3, timeMs: (opts && opts.timeMs) || 200, exact: true });
    if (!res.scores.length) return null;
    const played = res.scores.find((s) => s.uci === playedUci) || res.scores[res.scores.length - 1];
    return { best: res.scores[0].score, bestUci: res.scores[0].uci, played: played.score, depth: res.depthReached };
  }

  function quickEval(fen, timeMs) {
    const res = rootSearch(fen, { depth: 3, timeMs: timeMs || 150 });
    return res.scores.length ? res.scores[0].score : 0;
  }

  function perft(pos, depth) {
    if (depth === 0) return 1;
    let n = 0;
    for (const m of genMoves(pos, false)) { if (make(pos, m)) n += perft(pos, depth - 1); unmake(pos, m); }
    return n;
  }

  global.Engine = { fromFEN, boardKey, chooseMove, analyse, quickEval, rootSearch, perft, MATE };
})(typeof window !== 'undefined' ? window : globalThis);
