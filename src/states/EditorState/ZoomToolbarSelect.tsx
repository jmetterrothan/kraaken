import React from "react";

import ToolbarSelect, { IToolbarOption } from "@src/shared/ui/components/ToolbarSelect";

import { registerEvent } from "@shared/utility/Utility";

import * as GameEventTypes from "@src/shared/events/constants";
import * as GameEvents from "@src/shared/events";

interface IZoomToolbarSelectProps {
  onClick?: (option: IToolbarOption<number>) => void;
}

const ZoomToolbarSelect: React.FC<IZoomToolbarSelectProps> = ({ onClick }) => {
  const [scale, setScale] = React.useState<number>(1);

  React.useEffect(() => {
    const unsubscribe = registerEvent(GameEventTypes.ZOOM_EVENT, (e: GameEvents.ZoomEvent) => {
      // TODO: those checks should ne be here
      let scale = e.detail.scale;

      if (scale < 1) {
        scale = 1;
      }
      if (scale > 20) {
        scale = 20;
      }

      setScale(scale);
    });

    return unsubscribe;
  }, []);

  return (
    <ToolbarSelect<number>
      icon="search-plus" //
      selected={scale}
      active={false}
      displayedValue={`x${scale}`}
      onItemClick={onClick}
      options={[
        { name: "x1", value: 1 },
        { name: "x2", value: 2 },
        { name: "x4", value: 4 },
        { name: "x6", value: 6 },
        { name: "x8", value: 8 },
        { name: "x10", value: 10 },
        { name: "x12", value: 12 },
        { name: "x14", value: 14 },
        { name: "x16", value: 16 },
        { name: "x18", value: 18 },
        { name: "x20", value: 20 },
      ]}
    />
  );
};

export default ZoomToolbarSelect;
