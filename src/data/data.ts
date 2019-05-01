import { IWorldData } from '@src/shared/models/world.model';

import imgAtlas32x32 from '@assets/textures/atlas32x32.png';
import imgAtlas48x48 from '@assets/textures/atlas48x48.png';
import imgTileset from '@assets/textures/tileset.png';

const data: IWorldData = {
  level: {
    physics: {
      gravity: { x: 0, y: 20 },
    },
    tileMap: {
      cols: 49,
      rows: 26,
      tileSize: 16,
      tileTypes: {
        0: { row: 7, col: 17, collision: false },
        1: { row: 7, col: 17, collision: true },
      },
      tiles: [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      ],
    },
    player: {
      ref: 'fox',
      spawn: { x: (49 * 16) / 2, y: 4 * 16 },
      direction: { x: 1, y: 1 },
      debug: true,
    },
    loots: [
      {
        ref: 'health-potion',
        spawn: { x: 13 * 16, y: 6 * 16 },
        direction: { x: -1, y: 1 },
        debug: false,
      },
    ],
    entities: [
      {
        ref: 'frog',
        spawn: { x: 22 * 16, y: 7 * 16 },
        direction: { x: -1, y: 1 },
        debug: false,
      },
    ],
  },
  sprites : [
    {
      src: imgTileset,
      name: 'tileset',
      tileWidth: 16,
      tileHeight: 16,
    },
    {
      src: imgAtlas32x32,
      name: 'atlas',
      tileWidth: 32,
      tileHeight: 32,
    },
    {
      src: imgAtlas48x48,
      name: 'atlas2',
      tileWidth: 48,
      tileHeight: 48,
    },
  ],
  sfx: {
    star: {
      metadata: { },
      defaultAnimationKey: 'default',
      animationList: {
        default: {
          sprite: 'atlas',
          loop:  false,
          keyframes: [
              { row: 2, col:  3, duration: 50 },
              { row: 2, col:  2, duration: 50 },
              { row: 2, col:  1, duration: 50 },
              { row: 2, col:  0, duration: 25 },
          ],
        },
      },
    },
    explosion: {
      metadata: { },
      defaultAnimationKey: 'default',
      animationList: {
        default: {
          sprite: 'atlas2',
          loop:  false,
          keyframes: [
            { row: 0, col:  5, duration: 25 },
            { row: 0, col:  4, duration: 50 },
            { row: 0, col:  3, duration: 50 },
            { row: 0, col:  2, duration: 50 },
            { row: 0, col:  1, duration: 50 },
            { row: 0, col:  0, duration: 10 },
          ],
        },
      },
    },
  },
  loots: {
    'health-potion': {
      metadata: {
        sfx: 'star',
      },
      ref: 'cherry',
    },
    'damage-potion': {
      metadata: {
        sfx: 'explosion',
      },
      ref: 'gemstone',
    },
  },
  entities: {
    frog:  {
      metadata: {
        bbox: { w: 26, h: 19 },
      },
      defaultAnimationKey: 'default',
      animationList: {
        default: {
          sprite: 'atlas2',
          loop:  true,
          keyframes: [
            { row: 2, col:  2, duration: 100 },
            { row: 2, col:  3, duration: 150 },
            { row: 2, col:  4, duration: 550 },
            { row: 2, col:  5, duration: 100 },
          ],
        },
      },
    },
    fox: {
      metadata: {
        bbox: { w: 14, h: 20 },
      },
      defaultAnimationKey: 'idle',
      animationList: {
        idle: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 0, col:  12, duration: 125 },
            { row: 1, col:  11, duration: 125 },
            { row: 2, col:  13, duration: 125 },
          ],
        },
        climbing: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 0, col:  10, duration: 150 },
            { row: 1, col:  10, duration: 150 },
            { row: 0, col:  10, duration: 150 },
            { row: 1, col:  12, duration: 150 },
          ],
        },
        death: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 1, col:  13, duration: 150 },
            { row: 2, col:  11, duration: 150 },
          ],
        },
        ducking: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 1, col:  14, duration: 125 },
            { row: 2, col:  10, duration: 125 },
          ],
        },
        jumping: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 0, col:  14, duration: 0 },
          ],
        },
        falling: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 0, col:  13, duration: 0 },
          ],
        },
        walking: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 3, col:  10, duration: 85 },
            { row: 3, col:  11, duration: 85 },
            { row: 3, col:  12, duration: 85 },
            { row: 3, col:  13, duration: 85 },
            { row: 3, col:  14, duration: 85 },
          ],
        },
      },
    },
    cherry: {
      metadata: {
        bbox: { w: 14, h: 14 },
      },
      defaultAnimationKey: 'default',
      animationList: {
        default: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 1, col:  0, duration: 75 },
            { row: 1, col:  1, duration: 75 },
            { row: 1, col:  2, duration: 75 },
            { row: 1, col:  3, duration: 75 },
            { row: 1, col:  4, duration: 75 },
            { row: 1, col:  5, duration: 75 },
            { row: 1, col:  6, duration: 75 },
          ],
        },
      },
    },
    gemstone: {
      metadata: {
        bbox: { w: 14, h: 12 },
      },
      defaultAnimationKey: 'default',
      animationList: {
        default: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 0, col:  0, duration: 125 },
            { row: 0, col:  1, duration: 125 },
            { row: 0, col:  2, duration: 125 },
            { row: 0, col:  3, duration: 125 },
            { row: 0, col:  4, duration: 125 },
          ],
        },
      },
    },
  },
};

export default data;
