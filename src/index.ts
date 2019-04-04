import '@sass/main.scss';

import Game from '@src/Game';

const game = Game.create({
  width: 800,
  height: 480,
  allowFullscreen: true
});

game.on('resize', (frameSize: any, innerSize: any) => {
  // console.log(`frame size: ${JSON.stringify(frameSize)}`);
  // console.log(`inner size: ${JSON.stringify(innerSize)}`);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'f') {
    game.fullscreen = !game.fullscreen;
  }
});

game.run();