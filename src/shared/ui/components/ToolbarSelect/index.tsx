import React from "react";
import cx from "classnames";

import ToolbarButton, { IToolbarButtonprops } from "../ToolbarButton";

import "./ToolbarSelect.scss";

export interface IToolbarOption<T> {
  name?: string;
  description?: string;
  value: T;
}

interface IToolbarSelectProps<T> extends Omit<IToolbarButtonprops, "name" | "showCaret" | "onClick"> {
  onItemClick?: (option: IToolbarOption<T>) => void;
  displayedValue?: string;
  selected?: T;
  options?: IToolbarOption<T>[];
}

function ToolbarSelect<T>({ displayedValue, selected, options = [], onItemClick, disabled, ...props }: IToolbarSelectProps<T>): React.ReactElement {
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
    <div
      ref={ref} //
      className={cx("toolbar-select", open && "open")}
      onMouseEnter={!disabled ? () => setOpen(true) : undefined}
      onMouseLeave={!disabled ? () => setOpen(false) : undefined}
    >
      <ToolbarButton {...props} disabled={disabled} active={false} name={name} showCaret={true} />
      <ul className="toolbar-select__inner">
        {options.map((option, i) => {
          const handleItemClick = () => {
            onItemClick(option);
            setOpen(false);
          };
          return (
            <li key={i} className={cx("toolbar-select-item", selected === option.value && "selected")} onClick={handleItemClick}>
              <span className="toolbar-select-item__name">{option.name || option.value}</span>
              {option.description && <span className="toolbar-select-item__description">{option.description}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ToolbarSelect;
