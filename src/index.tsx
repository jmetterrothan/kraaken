import Game from "@src/Game";

import "@sass/main.scss";

const game = Game.create({
  allowFullscreen: true,
  width: 1440,
  height: 800,
  root: document.getElementById("game"),
  debug: false,
});

game.run();
