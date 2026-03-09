import Game from "@src/Game";

import { GameState, isGameState } from "./shared/models/game.model";
import { EditorMode, isEditorMode } from "./shared/models/editor.model";

const searchParams = new URLSearchParams(window.location.search);

const projectId = searchParams.get("projectId");
const levelId = searchParams.get("levelId");
const gameState = searchParams.has("gameState") ? Number.parseInt(searchParams.get("gameState") ?? "", 10) : GameState.LEVEL;
const mode = searchParams.has("editor:mode") ? Number.parseInt(searchParams.get("editor:mode") ?? "", 10) : EditorMode.TERRAIN;

if (!isGameState(gameState)) {
  throw new Error("Invalid game state requested");
}

if (!isEditorMode(mode)) {
  throw new Error("Invalid editor mode requested");
}

if (!projectId) {
  throw new Error("Missing project id");
}

const game = Game.create({
  allowFullscreen: true,
  width: "auto",
  height: "auto",
});

game.load(gameState, { projectId, levelId, mode });

game.run();
