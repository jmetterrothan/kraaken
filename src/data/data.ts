import { IWorldData } from '@src/shared/models/world.model';

import imgAtlas32x32 from '@assets/textures/atlas32x32.png';
import imgAtlas48x48 from '@assets/textures/atlas48x48.png';
import imgTileset from '@assets/textures/tileset.png';

const data: IWorldData = {
  level: {
    tileMap: {
      cols: 48,
      rows: 16,
      tileSize: 16,
      tileTypes: {
        0: undefined,
        1: { row: 1, col: 1, solid: true },
        2: { row: 1, col: 3, solid: true },
        3: { row: 1, col: 5, solid: true },
        4: { row: 2, col: 0, solid: true },
        5: { row: 2, col: 2, solid: true },
        6: { row: 2, col: 4, solid: true },
        7: { row: 4, col: 0, solid: true },
        8: { row: 4, col: 2, solid: true },
        9: { row: 4, col: 4, solid: true },
      },
      tiles: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    player: {
      key: 'fox',
      spawn: {
        x: 24 * 16,
        y: 8 * 16 - 10,
      },
    },
    entities: [
      {
        key: 'frog',
        spawn: { x: 64, y: 64 },
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
      metadata: {
        direction: { x: 1, y: 1 },
      },
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
      metadata: {
        direction: { x: 1, y: 1 },
      },
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
  loot: {
    'health-potion': {
      metadata: {
        sfx: 'star',
      },
      entity: 'cherry',
    },
    'damage-potion': {
      metadata: {
        sfx: 'explosion',
      },
      entity: 'gemstone',
    },
  },
  entities: {
    frog:  {
      metadata: {
        bbox: { w: 26, h: 19 },
        direction: { x: 1, y: 1 },
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
        bbox: { w: 16, h: 20 },
        direction: { x: 1, y: 1 },
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
        bbox: { w: 16, h: 16 },
        direction: { x: 1, y: 1 },
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
        direction: { x: 1, y: 1 },
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
