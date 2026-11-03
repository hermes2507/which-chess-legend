/* Famous games for the "closest game" match. Move lists are validated with chess.js at load
   (any game that fails to replay is silently dropped). */
(function (global) {
  'use strict';
  const GAMES = [
    {
      id: 'opera', title: 'The Opera Game', white: 'Paul Morphy', black: 'Duke Karl & Count Isouard', event: 'Paris Opera', year: 1858, result: '1-0',
      story: 'Played in a box at the Paris opera during a performance. Morphy develops quickly, opens lines, sacrifices, and mates with his last pieces. It is still the standard lesson on development.',
      pgn: 'e4 e5 Nf3 d6 d4 Bg4 dxe5 Bxf3 Qxf3 dxe5 Bc4 Nf6 Qb3 Qe7 Nc3 c6 Bg5 b5 Nxb5 cxb5 Bxb5+ Nbd7 O-O-O Rd8 Rxd7 Rxd7 Rd1 Qe6 Bxd7+ Nxd7 Qb8+ Nxb8 Rd8#',
    },
    {
      id: 'immortal', title: 'The Immortal Game', white: 'Adolf Anderssen', black: 'Lionel Kieseritzky', event: 'London (casual)', year: 1851, result: '1-0',
      story: 'A King’s Gambit in which White gives up both rooks, a bishop and the queen, then mates with three minor pieces. The high point of Romantic chess.',
      pgn: 'e4 e5 f4 exf4 Bc4 Qh4+ Kf1 b5 Bxb5 Nf6 Nf3 Qh6 d3 Nh5 Nh4 Qg5 Nf5 c6 g4 Nf6 Rg1 cxb5 h4 Qg6 h5 Qg5 Qf3 Ng8 Bxf4 Qf6 Nc3 Bc5 Nd5 Qxb2 Bd6 Bxg1 e5 Qxa1+ Ke2 Na6 Nxg7+ Kd8 Qf6+ Nxf6 Be7#',
    },
    {
      id: 'evergreen', title: 'The Evergreen Game', white: 'Adolf Anderssen', black: 'Jean Dufresne', event: 'Berlin', year: 1852, result: '1-0',
      story: 'An Evans Gambit that ends in a combination people still admire: a rook sacrifice, a queen sacrifice and a double-bishop mate.',
      pgn: 'e4 e5 Nf3 Nc6 Bc4 Bc5 b4 Bxb4 c3 Ba5 d4 exd4 O-O d3 Qb3 Qf6 e5 Qg6 Re1 Nge7 Ba3 b5 Qxb5 Rb8 Qa4 Bb6 Nbd2 Bb7 Ne4 Qf5 Bxd3 Qh5 Nf6+ gxf6 exf6 Rg8 Rad1 Qxf3 Rxe7+ Nxe7 Qxd7+ Kxd7 Bf5+ Ke8 Bd7+ Kf8 Bxe7#',
    },
    {
      id: 'legal', title: 'Légal’s Mate', white: 'Sire de Légal', black: 'Saint Brie', event: 'Café de la Régence, Paris', year: 1750, result: '1-0',
      story: 'The oldest trap in the book. White lets the queen go and mates with the minor pieces in seven moves.',
      pgn: 'e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1 Bxf7+ Ke7 Nd5#',
    },
    {
      id: 'century', title: 'The Game of the Century', white: 'Donald Byrne', black: 'Bobby Fischer', event: 'Rosenwald Memorial, New York', year: 1956, result: '0-1',
      story: 'A 13-year-old Fischer gives up his queen for a swarm of minor pieces, and they chase the white king up and down the board until mate.',
      pgn: 'Nf3 Nf6 c4 g6 Nc3 Bg7 d4 O-O Bf4 d5 Qb3 dxc4 Qxc4 c6 e4 Nbd7 Rd1 Nb6 Qc5 Bg4 Bg5 Na4 Qa3 Nxc3 bxc3 Nxe4 Bxe7 Qb6 Bc4 Nxc3 Bc5 Rfe8+ Kf1 Be6 Bxb6 Bxc4+ Kg1 Ne2+ Kf1 Nxd4+ Kg1 Ne2+ Kf1 Nc3+ Kg1 axb6 Qb4 Ra4 Qxb6 Nxd1 h3 Rxa2 Kh2 Nxf2 Re1 Rxe1 Qd8+ Bf8 Nxe1 Bd5 Nf3 Ne4 Qb8 b5 h4 h5 Ne5 Kg7 Kg1 Bc5+ Kf1 Ng3+ Ke1 Bb4+ Kd1 Bb3+ Kc1 Ne2+ Kb1 Nc3+ Kc1 Rc2#',
    },
    {
      id: 'kasparov-topalov', title: 'Kasparov’s Immortal', white: 'Garry Kasparov', black: 'Veselin Topalov', event: 'Wijk aan Zee', year: 1999, result: '1-0',
      story: 'Kasparov sacrifices a rook on d4, then chases the black king from a5 across to d1 in one of the deepest combinations ever played.',
      pgn: 'e4 d6 d4 Nf6 Nc3 g6 Be3 Bg7 Qd2 c6 f3 b5 Nge2 Nbd7 Bh6 Bxh6 Qxh6 Bb7 a3 e5 O-O-O Qe7 Kb1 a6 Nc1 O-O-O Nb3 exd4 Rxd4 c5 Rd1 Nb6 g3 Kb8 Na5 Ba8 Bh3 d5 Qf4+ Ka7 Rhe1 d4 Nd5 Nbxd5 exd5 Qd6 Rxd4 cxd4 Re7+ Kb6 Qxd4+ Kxa5 b4+ Ka4 Qc3 Qxd5 Ra7 Bb7 Rxb7 Qc4 Qxf6 Kxa3 Qxa6+ Kxb4 c3+ Kxc3 Qa1+ Kd2 Qb2+ Kd1 Bf1 Rd2 Rd7 Rxd7 Bxc4 bxc4 Qxh8 Rd3 Qa8 c3 Qa4+ Ke1 f4 f5 Kc1 Rd2 Qa7',
    },
    {
      id: 'deepblue', title: 'Deep Blue vs Kasparov, Game 6', white: 'Deep Blue', black: 'Garry Kasparov', event: 'New York rematch', year: 1997, result: '1-0',
      story: 'The game in which a machine beat the World Champion in a match. Kasparov allowed a known knight sacrifice on e6 and resigned after only 19 moves.',
      pgn: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Ng5 Ngf6 Bd3 e6 N1f3 h6 Nxe6 Qe7 O-O fxe6 Bg6+ Kd8 Bf4 b5 a4 Bb7 Re1 Nd5 Bg3 Kc8 axb5 cxb5 Qd3 Bc6 Bf5 exf5 Rxe7 Bxe7 c4',
    },
    {
      id: 'fischer-spassky-6', title: 'Fischer vs Spassky, Game 6', white: 'Bobby Fischer', black: 'Boris Spassky', event: 'World Championship, Reykjavík', year: 1972, result: '1-0',
      story: 'Fischer, a lifelong 1.e4 player, opens with 1.c4 and wins a model positional game. Spassky joined the audience in applauding.',
      pgn: 'c4 e6 Nf3 d5 d4 Nf6 Nc3 Be7 Bg5 O-O e3 h6 Bh4 b6 cxd5 Nxd5 Bxe7 Qxe7 Nxd5 exd5 Rc1 Be6 Qa4 c5 Qa3 Rc8 Bb5 a6 dxc5 bxc5 O-O Ra7 Be2 Nd7 Nd4 Qf8 Nxe6 fxe6 e4 d4 f4 Qe7 e5 Rb8 Bc4 Kh8 Qh3 Nf8 b3 a5 f5 exf5 Rxf5 Nh7 Rcf1 Qd8 Qg3 Re7 h4 Rbb7 e6 Rbc7 Qe5 Qe8 a4 Qd8 R1f2 Qe8 R2f3 Qd8 Bd3 Qe8 Qe4 Nf6 Rxf6 gxf6 Rxf6 Kg8 Bc4 Kh8 Qf4',
    },
    {
      id: 'reti-tartakower', title: 'Réti vs Tartakower', white: 'Richard Réti', black: 'Savielly Tartakower', event: 'Vienna', year: 1910, result: '1-0',
      story: 'A Caro-Kann over in 11 moves: a queen sacrifice on d8, a double check, and mate with a bishop.',
      pgn: 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nf6 Qd3 e5 dxe5 Qa5+ Bd2 Qxe5 O-O-O Nxe4 Qd8+ Kxd8 Bg5+ Kc7 Bd8#',
    },
    {
      id: 'lasker-thomas', title: 'The Great King Hunt', white: 'Edward Lasker', black: 'George Thomas', event: 'London', year: 1912, result: '1-0',
      story: 'A queen sacrifice on h7 pulls the black king all the way to g1, where a quiet king move gives mate.',
      pgn: 'd4 e6 Nf3 f5 Nc3 Nf6 Bg5 Be7 Bxf6 Bxf6 e4 fxe4 Nxe4 b6 Ne5 O-O Bd3 Bb7 Qh5 Qe7 Qxh7+ Kxh7 Nxf6+ Kh6 Neg4+ Kg5 h4+ Kf4 g3+ Kf3 Be2+ Kg2 Rh2+ Kg1 Kd2#',
    },
    {
      id: 'steinitz-bardeleben', title: 'Steinitz vs von Bardeleben', white: 'Wilhelm Steinitz', black: 'Curt von Bardeleben', event: 'Hastings', year: 1895, result: '1-0',
      story: 'A Giuoco Piano. Steinitz’s rook checks again and again on the seventh rank, and von Bardeleben left the hall instead of resigning.',
      pgn: 'e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+ Nc3 d5 exd5 Nxd5 O-O Be6 Bg5 Be7 Bxd5 Bxd5 Nxd5 Qxd5 Bxe7 Nxe7 Re1 f6 Qe2 Qd7 Rac1 c6 d5 cxd5 Nd4 Kf7 Ne6 Rhc8 Qg4 g6 Ng5+ Ke8 Rxe7+ Kf8 Rf7+ Kg8 Rg7+ Kh8 Rxh7+',
    },
    {
      id: 'short-timman', title: 'Short’s King Walk', white: 'Nigel Short', black: 'Jan Timman', event: 'Tilburg', year: 1991, result: '1-0',
      story: 'In an Alekhine’s Defence, with the queens still on, Short walks his king from g1 up to g5 to support the mating attack.',
      pgn: 'e4 Nf6 e5 Nd5 d4 d6 Nf3 g6 Bc4 Nb6 Bb3 Bg7 Qe2 Nc6 O-O O-O h3 a5 a4 dxe5 dxe5 Nd4 Nxd4 Qxd4 Re1 e6 Nd2 Nd5 Nf3 Qc5 Qe4 Qb4 Bc4 Nb6 b3 Nxc4 bxc4 Re8 Rd1 Qc5 Qh4 b6 Be3 Qc6 Bh6 Bh8 Rd8 Bb7 Rad1 Bg7 R8d7 Rf8 Bxg7 Kxg7 R1d4 Rae8 Qf6+ Kg8 h4 h5 Kh2 Rc8 Kg3 Rce8 Kf4 Bc8 Kg5',
    },
    {
      id: 'zugzwang', title: 'The Immortal Zugzwang Game', white: 'Friedrich Sämisch', black: 'Aron Nimzowitsch', event: 'Copenhagen', year: 1923, result: '0-1',
      story: 'A Queen’s Indian that is pure Hypermodern chess. White ends up with no useful move at all and resigns while still holding material.',
      pgn: 'd4 Nf6 c4 e6 Nf3 b6 g3 Bb7 Bg2 Be7 Nc3 O-O O-O d5 Ne5 c6 cxd5 cxd5 Bf4 a6 Rc1 b5 Qb3 Nc6 Nxc6 Bxc6 h3 Qd7 Kh2 Nh5 Bd2 f5 Qd1 b4 Nb1 Bb5 Rg1 Bd6 e4 fxe4 Qxh5 Rxf2 Qg5 Raf8 Kh1 R8f5 Qe3 Bd3 Rce1 h6',
    },
    {
      id: 'bongcloud', title: 'The Double Bongcloud', white: 'Magnus Carlsen', black: 'Hikaru Nakamura', event: 'Online rapid event', year: 2021, result: '1/2-1/2',
      story: 'Two of the best players in the world, already qualified, play 2.Ke2 and 2...Ke7 and repeat moves for a draw. The internet loved it.',
      pgn: 'e4 e5 Ke2 Ke7 Ke1 Ke8 Ke2 Ke7 Ke1 Ke8',
    },
  ];
  global.FAMOUS_GAMES = GAMES;
})(typeof window !== 'undefined' ? window : globalThis);
