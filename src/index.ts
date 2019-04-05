import '@sass/main.scss';

import Game from '@src/Game';

const game = Game.create({
  width: 800,
  height: 480,
  allowFullscreen: true
});

game.run();