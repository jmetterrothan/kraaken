
import React from 'react';
import ReactDOM from 'react-dom';

import Game from '@src/Game';

import '@sass/main.scss';

const game = Game.create({
  allowFullscreen: true,
  height: 600,
  width: 800,
});

game.run();

ReactDOM.render(<div/>, document.getElementById('root'));
