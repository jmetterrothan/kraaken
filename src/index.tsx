import Game from "@src/Game";

const searchParams = new URLSearchParams(window.location.search);

const projectId = searchParams.get("projectId");

if (!projectId) {
  throw new Error("Missing project id");
}

const root = document.getElementById("game");

if (!root) {
  throw new Error("Missing root elment");
}

const game = Game.create({
  allowFullscreen: true,
  width: "auto",
  height: "auto",
  root,
  projectId,
});

game.run();
