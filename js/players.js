/* The legends. Each has a style vector (0..1 per dimension, only the dims that define them),
   narrative flavour, a piece of "paraphernalia", and tag tests that grant bonus affinity.
   ctx (built in analysis.js) exposes: f (features), s (stats), opening names, flags. */
(function (global) {
  'use strict';
  const has = (ctx, ...names) => names.some((n) => ctx.openingTrail.some((o) => o.includes(n)));

  const PLAYERS = [
    {
      id: 'tal', name: 'Mikhail Tal', years: '1936–1992', nick: 'The Magician from Riga', color: '#8e3b46',
      v: { aggression: .95, sacrifice: 1, precision: .55, speed: .7, tempo: .7, chaos: .8, pawnStorm: .6, simplify: .1 },
      item: { e: '🚬', n: 'A forest of cigarettes', t: 'Tal chain-smoked through his games and stared opponents down with a gaze some swore was hypnotic.' },
      bio: 'World Champion in 1960 at 23, Tal turned the board into a bonfire: sacrifices first, calculations later, and opponents left lost in the complications.',
      quote: 'You must take your opponent into a deep dark forest where 2+2=5, and the path leading out is only wide enough for one.',
      tags: [
        { t: (c) => c.s.bigSacs >= 1, b: .08, why: 'You threw real material on the fire' },
        { t: (c) => has(c, 'Sicilian', "King's Indian"), b: .03, why: 'You walked into sharp, Tal-friendly territory' },
      ],
    },
    {
      id: 'fischer', name: 'Bobby Fischer', years: '1943–2008', nick: 'The Lone Genius of Brooklyn', color: '#2f5d8a',
      v: { aggression: .7, sacrifice: .3, precision: .9, speed: .65, tempo: .3, safety: .8, theory: .85, simplify: .5, chaos: .15, knights: .3 },
      item: { e: '⏱️', n: 'The Fischer clock', t: 'He patented the increment clock. If you added seconds per move to your game, you played on his invention.' },
      bio: 'Fischer beat the Soviet chess machine alone in Reykjavík 1972. Crystal-clear plans, ruthless technique, and an unshakable faith in 1.e4.',
      quote: 'Chess is war over the board. The object is to crush the opponent’s mind.',
      tags: [
        { t: (c) => c.tc.inc > 0, b: .05, why: 'You played with increment, his invention' },
        { t: (c) => c.s.firstMove === 'e4' && c.userColor === 'w', b: .04, why: '1.e4, "best by test"' },
        { t: (c) => has(c, 'Najdorf', 'Ruy L'), b: .05, why: 'His beloved Najdorf / Ruy López showed up' },
      ],
    },
    {
      id: 'kasparov', name: 'Garry Kasparov', years: 'b. 1963', nick: 'The Beast of Baku', color: '#9b2d20',
      v: { aggression: .9, sacrifice: .6, precision: .8, speed: .6, tempo: .55, theory: .95, pawnStorm: .6, chaos: .4, queenEarly: .4 },
      item: { e: '⌚', n: 'The wristwatch ritual', t: 'Kasparov would take off his watch and set it on the table, a signal that he meant to settle things.' },
      bio: 'Kasparov ruled for 15 years on deep preparation and pure dynamism. His matches with Karpov were long cold wars, and in 1997 he played Deep Blue.',
      quote: 'Chess is mental torture.',
      tags: [
        { t: (c) => has(c, 'Scotch', "King's Indian", 'Najdorf', 'Grünfeld'), b: .06, why: 'You picked one of Garry’s weapons' },
        { t: (c) => c.f.aggression > .7 && c.result === 'win', b: .04, why: 'You won by attacking' },
      ],
    },
    {
      id: 'carlsen', name: 'Magnus Carlsen', years: 'b. 1990', nick: 'The Mozart of Chess', color: '#3c6e47',
      v: { aggression: .5, sacrifice: .2, precision: .85, speed: .8, tempo: .85, simplify: .75, endurance: .95, theory: .3, chaos: .2, safety: .6 },
      item: { e: '👖', n: 'A pair of jeans', t: 'In 2024 he was fined for wearing jeans at the World Rapid. He left, then came back, still in jeans.' },
      bio: 'Carlsen squeezes wins out of dead-equal endgames and plays bullet and blitz for fun. He grinds slowly, and his opponents tend to crack first.',
      quote: 'Some people think that if their opponent plays a beautiful game, it’s OK to lose. I don’t. You have to be merciless.',
      tags: [
        { t: (c) => c.s.queensOff && c.s.userMoves >= 35, b: .08, why: 'You played on deep into a queenless endgame' },
        { t: (c) => c.tc.id === 'bullet' || c.tc.id === 'blitz', b: .03, why: 'You played fast chess, his natural habitat' },
        { t: (c) => has(c, 'London', 'Italian', 'Giuoco'), b: .03, why: 'You chose a quiet, Magnus-approved opening' },
      ],
    },
    {
      id: 'capablanca', name: 'José Raúl Capablanca', years: '1888–1942', nick: 'The Human Chess Machine', color: '#2a6f73',
      v: { aggression: .4, sacrifice: .15, precision: .9, speed: .9, tempo: .6, simplify: .9, endurance: .7, theory: .15, chaos: .1, safety: .7 },
      item: { e: '🎩', n: 'A diplomat’s hat', t: 'A Cuban diplomat-about-town who claimed he barely studied. He moved quickly and kept it simple.' },
      bio: 'Capablanca made chess look easy. He traded down into clean endgames and played them so well that many said he could not lose.',
      quote: 'You may learn much more from a game you lose than from a game you win.',
      tags: [
        { t: (c) => c.s.queensOffEarly, b: .06, why: 'The queens came off early' },
        { t: (c) => has(c, "Queen's Gambit Declined"), b: .04, why: 'Queen’s Gambit Declined, a Capablanca classic' },
      ],
    },
    {
      id: 'karpov', name: 'Anatoly Karpov', years: 'b. 1951', nick: 'The Boa Constrictor', color: '#5a5a7a',
      v: { aggression: .3, sacrifice: .1, precision: .85, speed: .5, tempo: .35, safety: .85, simplify: .6, pawnStorm: .2, chaos: .1, endurance: .7, theory: .7 },
      item: { e: '🥣', n: 'A suspicious yogurt', t: 'At Baguio 1978, Korchnoi’s team protested a violet yogurt delivered to Karpov mid-game as a possible coded message.' },
      bio: 'Karpov gave his opponents no counterplay, took away their good squares, and squeezed slowly until they gave up.',
      quote: 'Style? I have no style.',
      tags: [
        { t: (c) => has(c, 'Caro-Kann', 'Ruy L', "Queen's Gambit Declined"), b: .04, why: 'A sound, classical opening' },
        { t: (c) => c.result === 'win' && c.f.aggression < .45, b: .06, why: 'You won without ever really attacking' },
      ],
    },
    {
      id: 'petrosian', name: 'Tigran Petrosian', years: '1929–1984', nick: 'Iron Tigran', color: '#6b5b3a',
      v: { aggression: .15, sacrifice: .4, precision: .8, speed: .35, tempo: .3, safety: .95, simplify: .5, chaos: .05, kingWalk: .3, pawnStorm: .1 },
      item: { e: '🦻', n: 'A switched-off hearing aid', t: 'Petrosian is said to have turned off his hearing aid when the hall got noisy, which also kept out his opponents’ mind games.' },
      bio: 'The master of prophylaxis: Petrosian stopped threats before his opponents thought of them, and gave up the exchange to kill counterplay.',
      quote: null,
      tags: [
        { t: (c) => c.s.exchangeSac, b: .1, why: 'You gave up the exchange, a Petrosian signature' },
        { t: (c) => c.result === 'draw', b: .04, why: 'You settled for a solid draw' },
      ],
    },
    {
      id: 'morphy', name: 'Paul Morphy', years: '1837–1884', nick: 'The Pride and Sorrow of Chess', color: '#7a4a8c',
      v: { aggression: .9, sacrifice: .8, precision: .75, speed: .95, tempo: .7, safety: .7, endurance: .1, theory: .2, queenEarly: .3 },
      item: { e: '🎭', n: 'An opera box in Paris', t: 'In 1858, during a performance of an opera in Paris, he beat a Duke and a Count in the Opera Game, still the textbook on development.' },
      bio: 'Morphy was a New Orleans prodigy who beat Europe’s best and retired before he turned 22. He developed fast, opened lines, and finished quickly.',
      quote: 'Help your pieces so they can help you.',
      tags: [
        { t: (c) => c.result === 'win' && c.s.userMoves <= 25, b: .08, why: 'A quick, brilliant-style win' },
        { t: (c) => has(c, 'Open Game', "King's Knight", 'Italian', 'Evans', "King's Gambit"), b: .04, why: 'A Romantic-era open game' },
      ],
    },
    {
      id: 'nakamura', name: 'Hikaru Nakamura', years: 'b. 1987', nick: 'The Bongcloud Streamer', color: '#b5562a',
      v: { aggression: .7, sacrifice: .4, precision: .7, speed: 1, tempo: 1, chaos: .55, theory: .3, queenEarly: .6, kingWalk: .7 },
      item: { e: '☁️', n: 'The Bongcloud', t: '1.e4 e5 2.Ke2!? He has played it in real elite events, and chat loved it every time.' },
      bio: 'Nakamura is a speed-chess monster and probably the world’s most-watched chess streamer. In bullet he relies on intuition more than calculation.',
      quote: null,
      tags: [
        { t: (c) => c.s.bongcloud, b: .15, why: 'You took your king for an early walk' },
        { t: (c) => c.tc.id === 'bullet', b: .06, why: 'You played bullet' },
      ],
    },
    {
      id: 'polgar', name: 'Judit Polgár', years: 'b. 1976', nick: 'The Attacking Queen', color: '#a43d6b',
      v: { aggression: 1, sacrifice: .75, precision: .75, speed: .75, tempo: .6, pawnStorm: .7, chaos: .5, safety: .6 },
      item: { e: '👭', n: 'The Polgár sisters', t: 'Raised in a famous educational experiment, she became a GM at 15, beating Fischer’s record.' },
      bio: 'The strongest female player ever, and a top-10 player overall. She attacked hard and beat Kasparov, Carlsen and Anand.',
      quote: null,
      tags: [
        { t: (c) => c.s.checks >= 5, b: .06, why: 'You kept checking the enemy king' },
        { t: (c) => has(c, 'Open Sicilian', 'Najdorf', 'Dragon'), b: .03, why: 'You went into an Open Sicilian' },
      ],
    },
    {
      id: 'botvinnik', name: 'Mikhail Botvinnik', years: '1911–1995', nick: 'The Patriarch', color: '#44546a',
      v: { aggression: .5, sacrifice: .25, precision: .9, speed: .2, tempo: .1, theory: .9, safety: .8, chaos: .1, simplify: .5 },
      item: { e: '📐', n: 'An engineer’s slide rule', t: 'Botvinnik was an electrical engineer, and he trained like a scientist. He even had people blow smoke in his face to get used to smoky halls.' },
      bio: 'He founded the Soviet chess school on discipline, preparation and slow, deep thinking, and later taught Karpov, Kasparov and Kramnik.',
      quote: 'Chess is the art of analysis.',
      tags: [
        { t: (c) => c.tc.id === 'classical' || c.tc.id === 'untimed', b: .05, why: 'You chose slow, serious chess' },
        { t: (c) => has(c, 'English', 'French', 'Dutch'), b: .05, why: 'A Botvinnik opening appeared' },
      ],
    },
    {
      id: 'kramnik', name: 'Vladimir Kramnik', years: 'b. 1975', nick: 'The Berlin Wall', color: '#4d5f4a',
      v: { aggression: .3, sacrifice: .15, precision: .9, speed: .4, tempo: .3, simplify: .85, safety: .8, chaos: .1, theory: .85, endurance: .6 },
      item: { e: '🧱', n: 'A brick from the Berlin Wall', t: 'In London 2000 he neutralised Kasparov with the Berlin Defence and won the world title without losing a game.' },
      bio: 'Kramnik was deeply prepared, hard to break, and happy to trade queens and win the endgame that followed.',
      quote: null,
      tags: [
        { t: (c) => has(c, 'Berlin', 'Catalan'), b: .1, why: 'The Berlin or the Catalan, his signature lines' },
        { t: (c) => c.result === 'draw', b: .05, why: 'You held the draw' },
      ],
    },
    {
      id: 'anand', name: 'Viswanathan Anand', years: 'b. 1969', nick: 'The Lightning Kid', color: '#c07a1e',
      v: { aggression: .6, sacrifice: .35, precision: .85, speed: .95, tempo: .75, theory: .8, chaos: .25, safety: .7 },
      item: { e: '⚡', n: 'A lightning bolt', t: 'He was famous for playing near-perfect moves almost instantly, and remained World Champion for years.' },
      bio: 'Anand plays fast, prepares well, and stays calm. He is a gentleman champion who made India a chess superpower.',
      quote: null,
      tags: [
        { t: (c) => c.f.speed > .65 && c.f.precision > .7, b: .07, why: 'You played fast and accurately' },
      ],
    },
    {
      id: 'nimzowitsch', name: 'Aron Nimzowitsch', years: '1886–1935', nick: 'The Hypermodern Prophet', color: '#5e4b8b',
      v: { aggression: .3, sacrifice: .2, precision: .6, speed: .4, tempo: .3, theory: .5, knights: .7, pawnStorm: .3, kingWalk: .5, safety: .6, chaos: .35 },
      item: { e: '🤸', n: 'Gym exercises between moves', t: 'He was famous for doing physical exercises in the tournament hall, and he wrote "My System".' },
      bio: 'Nimzowitsch preached blockade, overprotection and controlling the centre from the flanks. He was eccentric, brilliant and endlessly quotable.',
      quote: 'The threat is stronger than the execution.',
      tags: [
        { t: (c) => c.s.flankOpening, b: .06, why: 'You opened from the flank, Hypermodern-style' },
        { t: (c) => has(c, 'Nimzo', 'Nimzowitsch', 'French'), b: .06, why: 'One of his openings appeared' },
      ],
    },
    {
      id: 'lasker', name: 'Emanuel Lasker', years: '1868–1941', nick: 'The Psychologist', color: '#7a5230',
      v: { aggression: .55, sacrifice: .4, precision: .65, speed: .5, tempo: .4, endurance: .8, chaos: .5, theory: .2, simplify: .4 },
      item: { e: '🧠', n: 'A mathematician’s cigar', t: 'He held the world title for 27 years, smoked cigars, and also published work in mathematics.' },
      bio: 'Lasker played the opponent as much as the position. He was willing to make a "bad" move if it was the one his opponent least wanted to face.',
      quote: 'When you see a good move, look for a better one.',
      tags: [
        { t: (c) => c.s.comeback, b: .12, why: 'You fought back from a worse position' },
      ],
    },
    {
      id: 'alekhine', name: 'Alexander Alekhine', years: '1892–1946', nick: 'The Beast of Prey', color: '#5c2a2a',
      v: { aggression: .85, sacrifice: .7, precision: .75, speed: .55, tempo: .45, chaos: .6, theory: .6, pawnStorm: .5 },
      item: { e: '🐈', n: 'A cat named Chess', t: 'Alekhine’s Siamese cat, called Chess, was said to sit by him at tournaments as a lucky charm.' },
      bio: 'Alekhine built combinations on top of combinations and even gave his name to the provocative 1.e4 Nf6.',
      quote: 'During a chess competition a chessmaster should be a combination of a beast of prey and a monk.',
      tags: [
        { t: (c) => has(c, 'Alekhine'), b: .15, why: 'You played his own defence!' },
        { t: (c) => c.s.sacs >= 2, b: .04, why: 'More than one sacrifice' },
      ],
    },
    {
      id: 'larsen', name: 'Bent Larsen', years: '1935–2010', nick: 'The Great Dane', color: '#a03a3a',
      v: { aggression: .65, sacrifice: .45, precision: .55, speed: .6, tempo: .55, chaos: .7, theory: .15, pawnStorm: .65, kingWalk: .4 },
      item: { e: '🐝', n: '1.b3', t: 'He named an opening after himself by playing it a lot. He also pushed his h-pawn with famous optimism.' },
      bio: 'Larsen was a fighting optimist who played offbeat systems, avoided draws, and was Fischer’s most unpredictable Western rival.',
      quote: null,
      tags: [
        { t: (c) => c.userColor === 'w' && (c.s.firstMove === 'b3' || c.s.firstMove === 'f4'), b: .15, why: 'You opened with a Larsen move' },
        { t: (c) => c.s.castleSide === 'q', b: .03, why: 'You castled queenside' },
      ],
    },
    {
      id: 'steinitz', name: 'Wilhelm Steinitz', years: '1836–1900', nick: 'The Father of Positional Chess', color: '#55605a',
      v: { aggression: .4, sacrifice: .2, precision: .7, speed: .3, tempo: .2, kingWalk: .9, queenEarly: .6, safety: .3, simplify: .4, endurance: .6 },
      item: { e: '👑', n: 'The first official crown', t: 'He was the first official World Champion, in 1886, and believed the king could look after itself.' },
      bio: 'Steinitz turned chess into a science of small advantages, and he walked his king around in the middlegame with complete confidence.',
      quote: 'The king is a fighting piece. Use it!',
      tags: [
        { t: (c) => c.s.kingWalks >= 2, b: .08, why: 'Your king went for walks with the queens still on' },
      ],
    },
    {
      id: 'ivanchuk', name: 'Vasyl Ivanchuk', years: 'b. 1969', nick: 'The Unpredictable Genius', color: '#3f6a8a',
      v: { aggression: .6, sacrifice: .5, precision: .65, speed: .4, tempo: .45, theory: .2, chaos: .85, timeTrouble: .8, knights: .55 },
      item: { e: '🎲', n: 'A loaded die', t: 'Brilliant one day, baffling the next. Nobody, Ivanchuk included, knows which version will turn up.' },
      bio: 'Ivanchuk has played almost every opening, and his games are full of beautiful ideas, time-trouble scrambles, and nearly anything else.',
      quote: null,
      tags: [
        { t: (c) => c.s.weirdFirst, b: .1, why: 'You started with a truly unusual move' },
        { t: (c) => c.s.underpromo, b: .1, why: 'You underpromoted!' },
      ],
    },
    {
      id: 'bronstein', name: 'David Bronstein', years: '1924–2006', nick: 'The Sorcerer’s Apprentice', color: '#6a4c7a',
      v: { aggression: .7, sacrifice: .6, precision: .6, speed: .15, tempo: .4, timeTrouble: 1, chaos: .6, theory: .4 },
      item: { e: '⏳', n: 'An hourglass running out', t: 'Legend has it he once spent around 40 minutes on his very first move. He was in time trouble constantly, and creative all the same.' },
      bio: 'Bronstein drew a world title match with Botvinnik in 1951. He was an inventor at the board who valued imagination more than results.',
      quote: null,
      tags: [
        { t: (c) => c.s.longFirstThink, b: .15, why: 'You thought for ages over your very first move' },
        { t: (c) => c.f.timeTrouble > .5, b: .05, why: 'You lived dangerously on the clock' },
      ],
    },
    {
      id: 'caruana', name: 'Fabiano Caruana', years: 'b. 1992', nick: 'The Preparation Machine', color: '#2d5c6e',
      v: { aggression: .55, sacrifice: .25, precision: .9, speed: .35, tempo: .25, theory: 1, safety: .8, chaos: .15, endurance: .6 },
      item: { e: '📚', n: 'A 50-gigabyte opening file', t: 'He is known for having some of the deepest preparation in chess history. He scored 7/7 at the 2014 Sinquefield Cup.' },
      bio: 'Caruana is a classical player of precision and stamina. He drew all 12 classical games in the 2018 World Championship against Carlsen.',
      quote: null,
      tags: [
        { t: (c) => c.s.bookPlies >= 10, b: .1, why: 'You stayed in known theory for a long time' },
      ],
    },
    {
      id: 'spassky', name: 'Boris Spassky', years: '1937–2025', nick: 'The Universal Player', color: '#806040',
      v: { aggression: .65, sacrifice: .45, precision: .75, speed: .6, tempo: .5, theory: .5, safety: .65, chaos: .3 },
      item: { e: '👏', n: 'Applause for the opponent', t: 'In Reykjavík 1972 he applauded Fischer’s brilliant Game 6, and he was a gracious sportsman to the end.' },
      bio: 'Spassky could attack, defend and grind equally well. He also beat Fischer with the King’s Gambit long before their famous match.',
      quote: null,
      tags: [
        { t: (c) => has(c, "King's Gambit"), b: .12, why: 'The King’s Gambit, Boris’s surprise weapon' },
        { t: (c) => c.s.balanced, b: .04, why: 'Your style had no obvious weak spot' },
      ],
    },
    {
      id: 'hou', name: 'Hou Yifan', years: 'b. 1994', nick: 'The Scholar Champion', color: '#9a4f5e',
      v: { aggression: .5, sacrifice: .3, precision: .8, speed: .6, tempo: .5, theory: .6, safety: .7, simplify: .5, chaos: .2, endurance: .5 },
      item: { e: '🎓', n: 'A Rhodes Scholarship', t: 'She was four-time Women’s World Champion, then went to Oxford as a Rhodes Scholar and became a professor.' },
      bio: 'Hou has a calm, universal style: solid where she needs to be, sharp when it pays, and always clear.',
      quote: null,
      tags: [
        { t: (c) => c.s.balanced, b: .06, why: 'You played a calm, balanced game' },
      ],
    },
    {
      id: 'firouzja', name: 'Alireza Firouzja', years: 'b. 2003', nick: 'The Young Blitz Storm', color: '#2f7a6a',
      v: { aggression: .85, sacrifice: .5, precision: .7, speed: .95, tempo: .95, chaos: .55, pawnStorm: .6, theory: .5 },
      item: { e: '🚀', n: 'A rocket-fast premove', t: 'He reached 2800 as a teenager, the youngest ever at the time, and he is ferocious online.' },
      bio: 'Firouzja plays modern, energetic chess with a lot of risk. He likes speed, initiative and pressure on the clock.',
      quote: null,
      tags: [
        { t: (c) => (c.tc.id === 'bullet' || c.tc.id === 'blitz') && c.result === 'win', b: .06, why: 'You won a fast game' },
      ],
    },
  ];

  global.PLAYERS = PLAYERS;
})(typeof window !== 'undefined' ? window : globalThis);
