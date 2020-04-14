import React from "react";

import tilesetSrc from "@src/data/level2/assets/graphics/tileset.png";

import { ITileTypeData } from "../models/tilemap.model";

import Toolbar from "./components/Toolbar";
import ToolbarButton from "./components/ToolbarButton";
import ToolbarTileset from "./components/ToolbarTileset";
import ToolbarSelect, { IToolbarOption } from "./components/ToolbarSelect";

const tileTypeChange = (id: string) => {
  return new CustomEvent("change_tiletype", {
    detail: {
      id,
    },
  });
};

const layerChange = (id: number) => {
  return new CustomEvent("change_layer", {
    detail: {
      id,
    },
  });
};

enum EditorMode {
  FILL = 0,
  ERASE = 1,
}

export default ({ level }) => {
  const [mode, setMode] = React.useState<EditorMode>(0);
  const [layerId, setLayerId] = React.useState<number>(1);
  const [tileTypeId, setTileTypeId] = React.useState<string>("1");

  const tileTypes: Record<string, ITileTypeData> = level.tileMap.tileTypes;

  const setFillMode = () => setMode(EditorMode.FILL);

  const setEraseMode = () => setMode(EditorMode.ERASE);

  const handleLayerSelection = (option: IToolbarOption<number>) => {
    setLayerId(option.value);
  };

  React.useEffect(() => {
    window.dispatchEvent(tileTypeChange(tileTypeId));
  }, [tileTypeId]);

  React.useEffect(() => {
    window.dispatchEvent(layerChange(layerId));
  }, [layerId]);

  return (
    <div className="ui">
      <Toolbar>
        <ToolbarButton
          icon="fill" //
          name="Fill"
          active={mode === EditorMode.FILL}
          onClick={setFillMode}
        />
        <ToolbarButton
          icon="eraser" //
          name="Erase"
          active={mode === EditorMode.ERASE}
          onClick={setEraseMode}
        />
        <ToolbarSelect<number>
          icon="layer-group" //
          active={false}
          selected={layerId}
          onItemClick={handleLayerSelection}
          options={[
            // { name: "Layer 0", value: 0 },
            { name: "Layer 1", value: 1 },
            { name: "Layer 2", value: 2 },
          ]}
        />
        <ToolbarTileset
          selected={tileTypeId} //
          onSelect={setTileTypeId}
          src={tilesetSrc}
          tileSize={16}
          tileTypes={tileTypes}
        />
      </Toolbar>
      {/*

      <div className="tiles">
        <select
          value={layerId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setLayerId(parseInt(e.target.value, 10));
          }}
        >
          <option value={1}>layer 1</option>
          <option value={2}>layer 2</option>
        </select>

        <select
          value={tileTypeId}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setTileTypeId(e.target.value);
          }}
        >
          {Object.entries(tileTypes).map(([id, tileType]) => (
            <option key={id} value={id}>
              {tileType.key}
            </option>
          ))}
        </select>
      </div>
      */}
    </div>
  );
};
