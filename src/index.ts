import '@sass/main.scss';

import Game from '@src/Game';

const dimension = { w: 800, h: 600 };
const game = Game.instance();

game.on('resize', (w: number, h: number) => {
  console.log(`w: ${w}, h: ${h}`);

  if (game.fullscreen) {
    game.resize(window.screen.width, window.screen.height);
  }
});

game.on('fullscreen', (b: boolean) => {
  console.log(`f: ${b}`);
  
  if (b) {
    game.resize(window.screen.width, window.screen.height);
  }
  else {
    game.resize(dimension.w, dimension.h);
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'f') {
    game.fullscreen = !game.fullscreen;
  }
});

game.resize(dimension.w, dimension.h);
game.run();