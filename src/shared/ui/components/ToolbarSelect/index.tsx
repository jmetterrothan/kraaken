import React from "react";
import cx from "classnames";

import ToolbarButton, { IToolbarButtonprops } from "../ToolbarButton";

import "./ToolbarSelect.scss";

interface IToolbarOption<T> {
  name?: string;
  value: T;
}

interface IToolbarSelectProps<T> extends Omit<IToolbarButtonprops, "name" | "showCaret" | "onClick"> {
  onItemClick?: (option: IToolbarOption<T>) => void;
  selected?: T;
  options?: IToolbarOption<T>[];
}

function ToolbarSelect<T>({ selected, options = [], onItemClick, ...props }: IToolbarSelectProps<T>) {
  const ref = React.useRef<HTMLDivElement>(null);

  const [open, setOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", fn);

    return () => {
      window.removeEventListener("mousedown", fn);
    };
  }, [ref]);

  const handleBtnClick = () => {
    setOpen(!open);
  };

  const selection = options.find((option) => option.value === selected);

  return (
    <div ref={ref} className={cx("toolbar-select", open && "open")}>
      <ToolbarButton {...props} name={selection ? selection.name : "Select Layer"} showCaret={true} onClick={handleBtnClick} />
      {open && (
        <ul className="toolbar-select__inner">
          {options.map((option, i) => {
            const handleItemClick = () => {
              onItemClick(option);
              setOpen(false);
            };
            return (
              <li key={i} className={cx(selected === option.value && "selected")} onClick={handleItemClick}>
                {option.name || option.value}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ToolbarSelect;
