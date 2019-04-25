
import React from 'react';
import ReactDOM from 'react-dom';

import Game from '@src/Game';

import '@sass/main.scss';

const game = Game.create({
  allowFullscreen: true,
  height: 640,
  width: 1024,
  root: document.getElementById('game'),
});

game.run();

ReactDOM.render(<div/>, document.getElementById('root'));
