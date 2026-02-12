import Game from "@src/Game";

const game = Game.create({
  allowFullscreen: true,
  width: "auto",
  height: "auto",
  root: document.getElementById("game")!,
  projectId: "H2DAzdU049HDkTwWfmKL",
});

game.run();
