import React from "react";
import cx from "classnames";

import "./ToolbarButton.scss";

export interface IToolbarButtonprops {
  active: boolean;
  disabled?: boolean;
  theme?: "blue" | "red";
  name: string;
  icon?: string;
  showCaret?: boolean;
  onClick?: () => void;
}

const ToolbarButton: React.FC<IToolbarButtonprops> = ({ theme = "blue", name, icon, active, disabled, showCaret, children, onClick }) => {
  return (
    <button
      title={name} //
      type="button"
      className={cx("toolbar-button", theme && `toolbar-button--${theme}`, disabled && "disabled", active && "active")}
      onClick={disabled ? undefined : onClick}
    >
      <div className="button__inner">
        <span className="toolbar-button__icon">
          <i className={cx("far", `fa-${icon}`)} />
        </span>
        <span className="toolbar-button__name">
          {name}
          {showCaret && <i className={cx("fas", "fa-caret-down", "caret")} />}
        </span>
      </div>
      {children}
    </button>
  );
};

export default ToolbarButton;
