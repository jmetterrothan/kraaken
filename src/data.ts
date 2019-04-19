import { IWorldData } from '@src/shared/models/world.model';

import imgAtlas32x32 from '@assets/textures/atlas32x32.png';
import imgAtlas48x48 from '@assets/textures/atlas48x48.png';

const data: IWorldData = {
  level: {
    cols: 24,
    rows: 16,
    player: {
      key: 'fox',
      spawn: { x: 512, y: 512 },
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
        bbox: { w: 20, h: 32 },
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
