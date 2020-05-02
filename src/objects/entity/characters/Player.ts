import { Howl, Howler } from "howler";

import Vector2 from "@shared/math/Vector2";
import Character from "@src/objects/entity/Character";

import { IPlayer } from "@shared/models/entity.model";

import jumpSoundFX from "@src/data/level1/assets/sounds/jump.wav";

class Player extends Character {
  protected jumpSoundFX: Howl;

  constructor(uuid: string, x: number, y: number, direction: Vector2, data: IPlayer) {
    super(uuid, x, y, direction, data);

    this.jumpSoundFX = new Howl({
      src: jumpSoundFX,
      autoplay: false,
      volume: 0.1,
    });
  }

  public jump() {
    this.jumpSoundFX.play();
  }

  protected die() {
    if (this.dead) {
      return;
    }

    this.dead = true;
  }

  public handleKeyboardInput(key: string, active: boolean) {
    switch (key) {
      case "ArrowLeft":
        this.left = active;
        break;

      case "ArrowRight":
        this.right = active;
        break;

      case "ArrowUp":
        this.up = active;
        break;

      case "ArrowDown":
        this.down = active;
        break;

      case " ":
        this.usePrimaryWeapon = active;
        break;
    }
  }
}

export default Player;
