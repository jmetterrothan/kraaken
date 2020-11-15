import Game from "@src/Game";

import "@sass/kraken.scss";

const game = Game.create({
  allowFullscreen: true,
  width: "auto",
  height: "auto",
  root: document.getElementById("game"),
  levelId: "H2DAzdU049HDkTwWfmKL",
});

game.run();
