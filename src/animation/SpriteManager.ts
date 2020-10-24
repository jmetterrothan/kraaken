import md5 from "md5";

import SpriteAtlas from "@src/animation/SpriteAtlas";

class SpriteManager {
  private static LOADED_SPRITES: Map<string, SpriteAtlas> = new Map<string, SpriteAtlas>();
  private static LOADED_FILES: Map<string, HTMLImageElement> = new Map<string, HTMLImageElement>();

  public static async load(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const hash: string = md5(src);

      if (SpriteManager.LOADED_FILES.has(hash) === true) {
        resolve(SpriteManager.LOADED_FILES.get(hash));
      }

      const image: HTMLImageElement = new Image();

      image.onload = () => {
        SpriteManager.LOADED_FILES.set(hash, image);
        resolve(image);
      };
      image.onerror = () => {
        reject(`Could not load sprite @ ${src}`);
      };

      // request permission if the origin is not the same
      if (new URL(src).origin !== window.location.origin) {
        image.crossOrigin = "anonymous";
      }
      image.src = src;
    });
  }

  public static async create(src: string, alias: string, tw: number, th: number): Promise<SpriteAtlas> {
    if (SpriteManager.LOADED_SPRITES.has(alias) === true) {
      return SpriteManager.LOADED_SPRITES.get(alias);
    }

    const sprite = new SpriteAtlas(src, alias, tw, th);
    await sprite.init();
    SpriteManager.LOADED_SPRITES.set(alias, sprite);

    return sprite;
  }

  public static get(alias: string): SpriteAtlas {
    if (!SpriteManager.LOADED_SPRITES.has(alias)) {
      throw new Error(`Sprite referenced by alias "${alias}" is missing`);
    }
    return SpriteManager.LOADED_SPRITES.get(alias);
  }
}

export default SpriteManager;
