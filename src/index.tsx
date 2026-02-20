import Game from "@src/Game";

const searchParams = new URLSearchParams(window.location.search);

const projectId = searchParams.get("projectId");
const levelId = searchParams.get("levelId");

if (!projectId) {
  throw new Error("Missing project id");
}

const game = Game.create({
  allowFullscreen: true,
  width: "auto",
  height: "auto",
  root: document.getElementById("game"),
});

game.load(projectId, levelId);

game.run();
