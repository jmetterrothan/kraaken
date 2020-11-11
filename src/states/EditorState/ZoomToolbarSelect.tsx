import React from "react";

import ToolbarSelect, { IToolbarOption } from "@src/shared/ui/components/ToolbarSelect";

interface IZoomToolbarSelectProps {
  value: number;
  onClick?: (option: IToolbarOption<number>) => void;
}

const ZoomToolbarSelect: React.FC<IZoomToolbarSelectProps> = ({ value, onClick }) => {
  return (
    <ToolbarSelect<number>
      icon="search-plus" //
      selected={value}
      active={false}
      displayedValue={`x${value}`}
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
