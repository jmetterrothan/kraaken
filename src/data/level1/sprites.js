import tileset from "./assets/textures/tileset.png";
import atlas32x32 from "./assets/textures/atlas32x32.png";
import atlas48x48 from "./assets/textures/atlas48x48.png";

export default [
  {
    src: tileset,
    name: "tileset",
    tileWidth: 16,
    tileHeight: 16
  },
  {
    src: atlas32x32,
    name: "atlas",
    tileWidth: 32,
    tileHeight: 32
  },
  {
    src: atlas48x48,
    name: "atlas2",
    tileWidth: 48,
    tileHeight: 48
  }
];
