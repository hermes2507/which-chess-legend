# How it works

This document covers what happens between your first move and your result card. Every number below comes from the code, so this file doubles as a reference when you tune the app.

- [1. The flow](#1-the-flow)
- [2. The engine](#2-the-engine-jsenginejs)
- [3. The bot's strength (ELO levels)](#3-the-bots-strength-elo-levels)
- [4. Clock and "human" behaviour](#4-clock-and-human-behaviour)
- [5. Post-game review](#5-post-game-review)
- [6. The 15 style traits](#6-the-15-style-traits)
- [7. Matching the legends](#7-matching-the-legends)
- [8. The closest famous game](#8-the-closest-famous-game)
- [9. The rhythmogram](#9-the-rhythmogram)
- [10. Charts and the result card](#10-charts-and-the-result-card)

---

## 1. The flow

```
Intro → Setup (pace, colour, opponent) → Game → Analysis (progress bar) → Results
                                                                            ├─ Legend headline + why you matched
                                                                            ├─ Game in numbers + narrative
                                                                            ├─ Style radar, pace & quality, evaluation curve
                                                                            ├─ Closest famous game (replayable)
                                                                            ├─ Rhythmogram
                                                                            ├─ Legend leaderboard (top 10 / all 24)
                                                                            └─ PNG card · PGN · copy text
```

Every move records its SAN, from/to squares, piece, capture, flags, the FEN before and after, **the time spent thinking** (`thinkMs`) and the clock afterwards. Everything in the results is computed from that log.

## 2. The engine (`js/engine.js`)

The engine is small and self-contained, so the bot never blocks on a network call.

- **Board:** 0x88 representation. Pieces are encoded as `type | color << 3`.
- **Move generation:** pseudo-legal moves, with legality checked in `make()`, which reports whether the mover's king is attacked. Covers castling, en passant and all promotions.
- **Verification:** perft matches the published counts on five standard test positions: the start position at depth 4, Kiwipete at depth 3, positions 3 and 4 at depths 5 and 4, and position 5 at depth 3.
- **Evaluation:**
  - Material: 100/320/330/500/900.
  - Michniewski piece-square tables.
  - A +30 bishop-pair bonus.
  - A king table that blends middlegame and endgame by game phase.
- **Search:**
  - Iterative-deepening negamax alpha-beta under a time limit.
  - Check extensions.
  - Quiescence search on captures and queen promotions, with delta pruning.
  - MVV-LVA capture ordering and killer moves.
  - Mate scores of ±100000 adjusted by ply.
- **Repetitions:** at the root, any move that recreates an earlier game position scores 0. The bot avoids repeating when it's winning and looks for a repetition when it's losing.

The UI uses chess.js only for rules, SAN and game-over detection, and every engine move is checked by chess.js before it's played.

## 3. The bot's strength (ELO levels)

`levelFor(elo)` in `js/app.js`:

| ELO | Depth | Noise (cp) | Deliberate blunder chance | Time cap |
|---|---|---|---|---|
| < 600 | 1 | ±220 | 30% | 120 ms |
| 600–899 | 2 | ±140 | 15% | 200 ms |
| 900–1199 | 2 | ±70 | 8% | 250 ms |
| 1200–1499 | 3 | ±40 | 4% | 400 ms |
| 1500–1799 | 4 | ±18 | 1.5% | 700 ms |
| 1800–2099 | 5 | 0 | 0 | 900 ms |
| ≥ 2100 | up to 8 | 0 | 0 | 1500 ms |

- **Noise:** when noise is above zero, every root move is searched with a full window to get its exact score. Random noise is then added before the bot picks, which is how weaker bots make "human" inaccuracies.
- **Blunders:** a deliberate blunder picks a random legal move, but avoids moves that allow a forced mate.
- **Persona aggression:** each persona gets a random aggression value from 0 to 1. Captures earn a bonus of `12 × aggression` cp and checks earn `15 × aggression` cp.
- **Opening variety:** for the first 10 plies, deep levels search at depth 3 with ±12 cp of noise, and root moves are shuffled so games don't repeat.

## 4. Clock and "human" behaviour

- **Search time:** the bot searches for no more than `remaining / 30`.
- **Artificial delay:** it then waits a little to look human. The delay is drawn at random per pace: bullet 0.25–0.9 s, blitz 0.5–2.6 s, rapid 0.9–4.5 s, classical 1.5–7 s, untimed 0.6–2.4 s. It is halved in the opening, often halved for captures, and capped at `remaining / 25`.
- **Resigning:** a bot rated 1100 or more resigns after three moves in a row at −9 pawns or worse.
- **Draw offers:** the bot accepts if its own evaluation is below −0.6, or within ±0.4 after at least 40 plies. You can offer once every 12 plies.
- **Game end:** mate, stalemate, threefold repetition, insufficient material, the 50-move rule, timeout, resignation or agreement.

## 5. Post-game review

Each of your moves is analysed with the engine in exact mode, so every candidate move gets its true score. The search goes to depth 4 with a time budget per move of 50–180 ms, which keeps the whole review to roughly 2–7 seconds.

- `loss = best − played` in centipawns, with both scores capped at ±1500.
- **Classification:** 12 or less is best, 50 or less is good, 120 or less is an inaccuracy, 300 or less is a mistake, and anything more is a blunder.
- **Accuracy per move:** uses the Lichess win-percentage formula:
  - `win% = 50 + 50·(2/(1+e^(−0.00368208·cp)) − 1)`
  - `acc = 103.1668·e^(−0.04354·Δwin%) − 3.1669`
- **Game accuracy:** the mean of the arithmetic and harmonic averages, with each move floored at 5%. The harmonic part makes blunders hurt the way they do on Lichess.

**Opening detection:** about 90 named lines, matched as SAN prefixes, from *Grob's Attack* to the *Fried Liver* and the *Najdorf*. The longest match gives the name, and the number of matched plies counts as "theory".

**Sacrifice detection:** a move counts as a sacrifice when all three of these hold:
1. The opponent's reply captures on the square you just moved to.
2. You are at least 2 points down in material two plies later.
3. You are still 2 or more points down two plies after that.

A sacrifice is **sound** when the engine loss was 80 cp or less and the position was still no worse than −1.5, or when you delivered mate within the next 8 plies. Losing exactly 2 points where the opponent captured a rook counts as an **exchange sacrifice**.

## 6. The 15 style traits

Each trait is normalised to 0–1. *n* is your number of moves.

| Trait | How it's measured |
|---|---|
| `aggression` | (captures + 1.5·checks + 0.4·moves into the enemy half) / n / 0.9 |
| `sacrifice` | (sound + 0.4·unsound sacrifices) / max(1, n/20) |
| `precision` | (accuracy − 45) / 50 |
| `speed` | 1 − avgThink / (2·expected), where expected = base/40 + increment (20 s untimed) |
| `tempo` | the pace you chose: bullet 1, blitz .75, rapid .5, classical .25, untimed .1 |
| `safety` | castled by move 10 = 1, by move 16 = .65, later = .4, never = .1 |
| `kingWalk` | non-castling king moves with queens on, up to move 25 (/3), +.5 for an early "Bongcloud" |
| `queenEarly` | queen moves within your first 10 moves / 3 |
| `pawnStorm` | pawn moves to your 5th rank or beyond, as a share of moves × 3.5 |
| `simplify` | like-for-like trades / 6, +.25 if the queens came off by ply 40 |
| `endurance` | total plies / 140 |
| `theory` | plies of the named opening / 14 |
| `knights` | knight moves / (knight + bishop moves) |
| `chaos` | .25·blunders + .1·mistakes + .25·(think-time coefficient of variation) |
| `timeTrouble` | timed: share of moves with under 15% of the base time left × 2.5. Untimed: share of moves taking over 3× the median × 3 |

## 7. Matching the legends

Each legend in `js/players.js` defines values **only for the traits that characterise them**. Tal, for example, has `aggression .95`, `sacrifice 1`, `chaos .8` and `simplify .1`, among others.

1. **Distance:** a weighted RMS distance over the legend's defined traits. The weights (`DIM_W` in `analysis.js`) give aggression and sacrifice the most weight, and knights versus bishops the least.
2. **Similarity:** `sim = 1 − distance`.
3. **Folklore tags:** each legend has tests that add a bonus when they fire. Examples:
   - Bongcloud: +.15 Nakamura
   - Very long first-move think: +.15 Bronstein
   - Increment clock: +.05 Fischer
   - Exchange sacrifice: +.10 Petrosian
   - Alekhine's Defence: +.15 Alekhine
   - Comeback from −2.5: +.12 Lasker
   - 10+ plies of theory: +.10 Caruana
4. **Final score:** `clamp(sim + bonuses, 3%, 99%)`.

The **"why you matched"** list combines the tags that fired with up to three shared traits. A shared trait is one where the legend is distinctive (at least 0.2 from neutral) and you are within 0.22 of them. A **"where you differ"** line shows the trait with the biggest gap (0.4 or more).

Your **archetype** title combines your strongest trait (Romantic, Swashbuckling, Clinical, Minimalist and so on, or Balanced) with a noun for your pace (Speed Demon, Coffeehouse Hustler, Club Tactician, Tournament Scholar, Correspondence Philosopher).

## 8. The closest famous game

The 14 games in `js/games.js` are replayed with chess.js at load. Each side gets the same trait profile your game gets. Your game is compared with **both sides** of every game:

```
score = .30 · min(1, identical-prefix-plies / 10)      (only when you played the same colour)
      + .10 · min(1, 2 · Jaccard(your SANs, their SANs))
      + .35 · (1 − RMS distance over 9 style traits)
      + .12 · same result for your side
      + .05 · both ended in mate
      + .08 · length similarity
```

The 9 style traits are aggression, sacrifice, safety, kingWalk, queenEarly, pawnStorm, simplify, endurance and knights.

The best match is shown with its story, the reasons it matched, and a board that opens where your game left the famous one (or at the final position). Moves you shared are highlighted.

## 9. The rhythmogram

Neil Todd's rhythmogram represents rhythm by smoothing an event train at many time scales at once. In this app:

- **Events:** each of your moves is an impulse at its real time on the shared game clock, counting both players' thinking time.
- **Rows:** 30 time scales, with σ log-spaced from **0.25 s** to **max(4 s, game length / 2)**.
- **Cells:** each cell is a sum of Gaussians, with σ floored at 0.6 × the column width so short scales still register.
- **Normalisation and colour:** each row is normalised to its own peak. Colour runs from surface to accent with a 0.8 gamma.
- **Event track:** shown underneath. Your moves are coloured by quality, and the bot's moves are short grey ticks.

**Reading it:**
- Bright, bushy streaks are bursts of quick moves.
- Pale valleys at the small scales are long thinks.
- At the largest scales the whole game merges into one band, which is expected.

**Summary tiles:**
- **Tempo:** 60 000 / your mean think time, in beats per minute.
- **Groove:** set by the coefficient of variation of your think times. Below 0.5 is *Metronome*, below 0.9 is *Groove*, below 1.4 is *Rubato*, and anything higher is *Free jazz*.
- **Longest burst:** the most consecutive moves that each took 1.5 s or less, or at most half your median think time.
- **Longest pause:** your single longest think.

## 10. Charts and the result card

- **Style radar:** six axes for you and your legend. Solidity = (safety + 1 − chaos) / 2, and Grind = (endurance + simplify) / 2.
- **Pace and quality:** bar height is √(think time), and colour is move quality.
- **Evaluation curve:** your engine evaluation before each of your moves, capped at ±6 pawns.
- **Interaction:** every chart has a hover tooltip.
- **PNG result card:** a 1080×1350 canvas drawn with the 2D API (no libraries) in a fixed light palette. It includes:
  - Legend, archetype and match %.
  - Four stat tiles and the opening.
  - Radar and top 5.
  - Closest game and a 10-row rhythmogram strip.
  - Paraphernalia and the credit footer.

  It downloads as `chess-legend-<legend>-<date>.png`.
- **PGN:** includes headers (players, bot ELO, time control, result, termination) and can be imported into Lichess or Chess.com.
