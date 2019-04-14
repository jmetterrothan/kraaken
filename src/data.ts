import { IWorldData } from '@src/shared/models/world.model';

import imgAtlas32x32 from '@assets/textures/atlas32x32.png';

const data: IWorldData = {
  rows: 16,
  cols: 16,
  sprites : [
    {
      src: imgAtlas32x32,
      name: 'atlas',
      tileWidth: 32,
      tileHeight: 32
    }
  ],
  characters: {
    fox: {
      defaultState: {
        orientation: {
          x: 1,
          y: 1
        }
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
          ]
        },
        climbing: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 0, col:  10, duration: 150 },
            { row: 1, col:  10, duration: 150 },
            { row: 0, col:  10, duration: 150 },
            { row: 1, col:  12, duration: 150 },
          ]
        },
        death: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 1, col:  13, duration: 150 },
            { row: 2, col:  11, duration: 150 },
          ]
        },
        ducking: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 1, col:  14, duration: 125 },
            { row: 2, col:  10, duration: 125 },
          ]
        },
        jumping: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 0, col:  14, duration: 0 },
          ]
        },
        falling: {
          sprite: 'atlas',
          loop:  true,
          keyframes: [
            { row: 0, col:  13, duration: 0 },
          ]
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
          ]
        },
      }
    },
    cherry: {
      defaultState: {
        orientation: {
          x: 1,
          y: 1
        }
      },
      defaultAnimationKey: 'idle',
      animationList: {
        idle: {
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
          ]
        }
      }
    }
  }
};

export default data;