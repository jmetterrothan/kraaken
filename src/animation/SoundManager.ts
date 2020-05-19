import { Howl } from "howler";

interface ISoundProperties {
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
  mute?: boolean;
  pool?: number;
}

class SoundManager {
  private static MAPPING: Map<string, string> = new Map<string, string>();

  public static async register(src: string, name: string) {
    if (!src || !name) {
      throw new Error("Invalid sound details");
    }

    SoundManager.MAPPING.set(name, src);
  }

  public static create(name, options: ISoundProperties = {}): Howl {
    if (!SoundManager.MAPPING.has(name)) {
      throw new Error(`Undefined sound "${name}"`);
    }

    return new Howl({
      src: SoundManager.MAPPING.get(name),
      preload: true,
      autoplay: false,
      ...options,
    });
  }
}

export default SoundManager;
