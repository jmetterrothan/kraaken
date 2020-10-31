import pako from 'pako';

import AbstractDriver from '@src/shared/drivers/AbstractDriver';

import { IWorldBlueprint } from '@shared/models/world.model';
import { ILevelBlueprint } from '@shared/models/world.model';

import { db } from '@src/firebase';

class FirebaseDriver extends AbstractDriver {
  public async load(id: string): Promise<IWorldBlueprint> {
    const levelRef = await db.collection('levels').doc(id);
    const levelDoc = await levelRef.get();

    if (!levelDoc.exists) {
      throw new Error(`Unknown level "${id}"`);
    }

    const levelData = levelDoc.data() as ILevelBlueprint;

    const level = {
      ...levelData,
      tileMapLayer1: JSON.parse(atob(pako.inflate(levelData.tileMapLayer1, { to: 'string' }))),
      tileMapLayer2: JSON.parse(atob(pako.inflate(levelData.tileMapLayer2, { to: 'string' }))),
      tileMapLayer3: JSON.parse(atob(pako.inflate(levelData.tileMapLayer3, { to: 'string' })))
    };

    const { default: entities } = await import(`@src/data/${id}/entities.json`);
    const { default: resources } = await import(`@src/data/${id}/resources.json`);

    return {
      level, entities, sprites: resources.sprites, sounds: resources.sounds
    }
  }

  public async save(id: string, levelData: Partial<ILevelBlueprint>): Promise<void> {
    const levelRef = await db.collection('levels').doc(id);

    let temp = levelData as any;
   
    if ('tileMapLayer1' in temp) {
      temp = {
        ...temp,
        tileMapLayer1: Array.from(pako.deflate(btoa(JSON.stringify(temp.tileMapLayer1)))),
      }
    }

    if ('tileMapLayer2' in temp) {
      temp = {
        ...temp,
        tileMapLayer2: Array.from(pako.deflate(btoa(JSON.stringify(temp.tileMapLayer2)))),
      }
    }

    if ('tileMapLayer3' in temp) {
      temp = {
        ...temp,
        tileMapLayer3: Array.from(pako.deflate(btoa(JSON.stringify(temp.tileMapLayer3)))),
      }
    }

    await levelRef.set(temp, { merge: true })
  }
}

export default FirebaseDriver;

/*
levelSvc.save("H2DAzdU049HDkTwWfmKL", {
  title: "Level 0",
  background: { r: 2, g: 23, b: 33, a: 255 },
  gravity: 580,
  spawnPoints: [
    {
      type: "hero",
      uuid: "player",
      position: { x: 390, y: 470 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "health_potion",
      uuid: "2",
      position: { x: 408, y: 320 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "coin",
      uuid: "3",
      position: { x: 424, y: 304 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "coin",
      uuid: "4",
      position: { x: 440, y: 304 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "coin",
      uuid: "5",
      position: { x: 456, y: 304 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "coin",
      uuid: "6",
      position: { x: 472, y: 304 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "coin",
      uuid: "7",
      position: { x: 488, y: 304 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "bat",
      uuid: "8",
      position: { x: 400, y: 370 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "ghost",
      uuid: "9",
      position: { x: 500, y: 280 },
      direction: { x: -1, y: 1 },
    },
    {
      type: "bat",
      uuid: "10",
      position: { x: 250, y: 420 },
      direction: { x: -1, y: 1 },
    },
    {
      type: "dino",
      uuid: "11",
      position: { x: 300, y: 420 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "skeleton",
      uuid: "12",
      position: { x: 500, y: 300 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "ghost",
      uuid: "13",
      position: { x: 100, y: 420 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "ammo_box",
      uuid: "14",
      position: { x: 200, y: 420 },
      direction: { x: 1, y: 1 },
    },
    {
      type: "ammo_box",
      uuid: "15",
      position: { x: 600, y: 420 },
      direction: { x: 1, y: 1 },
    },
  ],
  defaultTileType: 515,
  tileSize: 16,
  tileSet: "tiles",
  tileGroups: {
    default: { display: null, name: "Default" },
    pillars: { display: "4x2", name: "Pillars" },
    plants: { display: null, name: "Plants" },
  },
  tileTypes: [
    { key: "rock", row: 12, col: 11, group: "default" },
    { key: "rock_lava", row: 10, col: 9, group: "default" },
    { key: "rock_square_lava", row: 12, col: 9, group: "default" },
    { key: "rock_square", row: 10, col: 11, group: "default" },
    { key: "rock_arrow", row: 10, col: 13, group: "default" },
    { key: "rock_cracked", row: 12, col: 13, group: "default" },
    { key: "lava", row: 14, col: 9, group: "default" },
    { key: "pillar_1", row: 7, col: 33, group: "pillars" },
    { key: "pillar_simple_1", row: 7, col: 35, group: "pillars" },
    { key: "pillar_2", row: 8, col: 33, group: "pillars" },
    { key: "pillar_simple_2", row: 8, col: 35, group: "pillars" },
    { key: "pillar_3", row: 9, col: 33, group: "pillars" },
    { key: "pillar_simple_3", row: 9, col: 35, group: "pillars" },
    { key: "pillar_4", row: 10, col: 33, group: "pillars" },
    { key: "pillar_simple_4", row: 10, col: 35, group: "pillars" },
    { key: "plant_1", row: 11, col: 20, group: "plants" },
    { key: "plant_2", row: 11, col: 22, group: "plants" },
  ],
  tileMapCols: 100,
  tileMapRows: 32,
  tileMapLayer1: [120, 156, 237, 212, 193, 9, 0, 64, 8, 3, 65, 211, 127, 211, 34, 216, 66, 114, 30, 236, 60, 124, 26, 136, 96, 21, 128, 131, 52, 220, 17, 51, 188, 25, 246, 253, 0, 222, 227, 95, 93, 34, 5, 238, 241, 181, 173, 199, 221, 82, 226, 4, 158, 12, 5, 52, 178, 118, 0, 136],
  tileMapLayer2: [120, 156, 237, 209, 177, 9, 0, 48, 12, 3, 65, 107, 255, 165, 131, 33, 19, 4, 94, 16, 248, 43, 92, 90, 32, 205, 72, 146, 36, 61, 203, 162, 35, 246, 176, 25, 248, 255, 142, 164, 176, 199, 215, 110, 61, 116, 75, 141, 9, 152, 140, 20, 28, 100, 106, 0, 127],
  tileMapLayer3: [120, 156, 237, 193, 49, 1, 0, 0, 0, 194, 160, 245, 79, 109, 11, 47, 160, 0, 0, 0, 62, 6, 12, 128, 0, 1],
});
*/
