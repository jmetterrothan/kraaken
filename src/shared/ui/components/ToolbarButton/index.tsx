import React from "react";
import cx from "classnames";

import "./ToolbarButton.scss";

export interface IToolbarButtonprops {
  active: boolean;
  theme?: "blue" | "red";
  name: string;
  icon?: string;
  showCaret?: boolean;
  onClick?: () => void;
}

const ToolbarButton: React.FunctionComponent<IToolbarButtonprops> = ({ theme = "blue", name, icon, active, showCaret, onClick }) => {
  return (
    <button title={name} type="button" className={cx("toolbar-button", theme && `toolbar-button--${theme}`, active && "active")} onClick={onClick}>
      <span className="toolbar-button__icon">
        <i className={cx("far", `fa-${icon}`)} />
      </span>
      <span className="toolbar-button__name">
        {name}
        {showCaret && <i className={cx("fas", "fa-caret-down", "caret")} />}
      </span>
    </button>
  );
};

export default ToolbarButton;
