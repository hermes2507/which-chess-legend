# Extending the app

Everything is plain JavaScript loaded with classic `<script>` tags, in this order: `chess.js → engine.js → players.js → games.js → analysis.js → app.js`. There is no build step. Edit a file and reload.

## Add a legend

Append an object to `PLAYERS` in `js/players.js`:

```js
{
  id: 'smyslov', name: 'Vasily Smyslov', years: '1921–2010', nick: 'The Hand of Harmony', color: '#4a6b8a',
  // Only the traits that define this player (0..1). Unlisted traits are ignored for them.
  v: { aggression: .45, sacrifice: .2, precision: .9, simplify: .8, endurance: .85, chaos: .1 },
  item: { e: '🎤', n: 'An opera singer’s voice', t: 'He once auditioned for the Bolshoi Theatre as a baritone.' },
  bio: 'One short paragraph shown in the hero card and the leaderboard.',
  quote: null, // or a well-attributed quote
  tags: [
    // c = { f: traits, s: stats, openingTrail: [...names], tc, userColor, result }
    { t: (c) => c.s.queensOffEarly && c.result === 'win', b: .06, why: 'You won a quiet endgame, his speciality' },
  ],
},
```

**Trait keys** (see [How it works §6](HOW_IT_WORKS.md#6-the-15-style-traits)):
`aggression sacrifice precision speed tempo safety kingWalk queenEarly pawnStorm simplify endurance theory knights chaos timeTrouble`.

**Useful `c.s` stats:**
- Counts: `userMoves`, `captures`, `checks`, `sacs`, `soundSacs`, `bigSacs`, `kingWalks`.
- Flags: `exchangeSac`, `bongcloud`, `queensOff`, `queensOffEarly`, `underpromo`, `comeback`, `longFirstThink`, `flankOpening`, `weirdFirst`, `balanced`.
- Other: `castleMove`, `castleSide` (`'k'`/`'q'`), `bookPlies`, `firstMove`, `accuracy`, `counts`.

**Tips:**
- Keep bonuses between .03 and .15. They are meant to tip a close race, not override the style vector.
- Pick a `color` dark enough for white text (it's used as the hero background).
- The UI says "24 legends" in a few places (`index.html` intro and the analysis messages in `app.js`). Update those if you change the count.

## Add a famous game

Append to `GAMES` in `js/games.js`. The moves are a single space-separated SAN string, without move numbers:

```js
{
  id: 'my-game', title: 'Short Title', white: 'White Player', black: 'Black Player',
  event: 'Event, City', year: 1900, result: '1-0', // '1-0' | '0-1' | '1/2-1/2'
  story: 'One or two sentences on why the game is famous.',
  pgn: 'e4 e5 Nf3 Nc6 Bb5 a6',
},
```

Games are replayed with chess.js at load, and **any game with an illegal move is silently skipped**. Check a new game with:

```bash
node -e "
const {Chess}=require('./vendor/chess.min.js'); require('./js/games.js');
for (const g of FAMOUS_GAMES){const c=new Chess();let bad=null;
for(const s of g.pgn.split(' ')) if(!c.move(s)){bad=s;break;}
console.log(bad?'FAIL at '+bad:'ok  ', g.id, c.in_checkmate()?'(mate)':'');}"
```

## Add an opening name

Add `['e4 e5 Nf3 Nc6 Bb5 Nf6 O-O', 'Ruy López, Berlin, Main Line']` to `OPENINGS` in `js/analysis.js`. Use SAN without check marks. The longest matching prefix wins.

## Add a bot persona or tweak strength

- **Personas:** `BANDS` in `js/app.js` defines names, avatar, blurb and taunt lines (`greet`, `capture`, `check`, `ouch`, `win`, `lose`) for each ELO band.
- **Strength:** `levelFor(elo)` maps ELO to `{ depth, noise, blunder, timeMs }`.

## Add a time control

Add to `TCS` in `js/app.js`:

```js
{ id: 'hyper', e: '🚀', name: 'Hyperbullet', t: '½+0', base: 30, inc: 0, d: 'Pure reflex.', delay: [150, 400] },
```

Then add a `tempo` value for it in `buildProfile` (`tempoMap`), a noun in `archetype()`, and a spirit object in `SPIRIT`.

## Testing

There's no test framework, but these quick checks catch most problems.

**Syntax:**
```bash
for f in js/*.js; do node --check "$f"; done
```

**Engine correctness (perft):**
```bash
node -e "require('./js/engine.js'); const E=globalThis.Engine;
console.log(E.perft(E.fromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),4)) // 197281"
```

**Full pipeline in Node:** play a bot-vs-bot game with `Engine.chooseMove`, build the same move log that `doMove` creates, then call `Analysis.buildProfile`, `Analysis.matchPlayers` and `Analysis.closestGame`. Before requiring `analysis.js`, set `globalThis.Chess = require('./vendor/chess.min.js').Chess`.

**UI:** a headless-browser script (for example Playwright) can drive the board through `[data-sq="e2"]` elements. The game state is exposed as `window.__ccl` for testing.
