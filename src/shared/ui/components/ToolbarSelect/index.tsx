import React from "react";
import cx from "classnames";

import ToolbarButton, { IToolbarButtonprops } from "../ToolbarButton";

import "./ToolbarSelect.scss";

export interface IToolbarOption<T> {
  name?: string;
  value: T;
}

interface IToolbarSelectProps<T> extends Omit<IToolbarButtonprops, "name" | "showCaret" | "onClick"> {
  onItemClick?: (option: IToolbarOption<T>) => void;
  displayedValue?: string;
  selected?: T;
  options?: IToolbarOption<T>[];
}

function ToolbarSelect<T>({ displayedValue, selected, options = [], onItemClick, ...props }: IToolbarSelectProps<T>): React.ReactElement {
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

  const selection = options.find((option) => option.value === selected);
  const name = displayedValue ? displayedValue : selection ? selection.name : "Select";

  return (
    <div ref={ref} className={cx("toolbar-select", open && "open")} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <ToolbarButton {...props} active={false} name={name} showCaret={true} />
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
    </div>
  );
}

export default ToolbarSelect;
