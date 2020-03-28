import React from "react";
import ReactDOM from "react-dom";

import Game from "@src/Game";

import "@sass/main.scss";

const game = Game.create({
  allowFullscreen: true,
  width: 1440,
  height: 800,
  root: document.getElementById("game")
});

game.run();

ReactDOM.render(<div />, document.getElementById("root"));
