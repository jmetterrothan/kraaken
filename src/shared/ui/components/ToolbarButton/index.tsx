import { PropsWithChildren } from "react";
import cx from "classnames";

import "./ToolbarButton.scss";

export interface IToolbarButtonProps {
  active: boolean;
  disabled?: boolean;
  theme?: "blue" | "red";
  name: string;
  icon?: string;
  showCaret?: boolean;
  onClick?: () => void;
}

const ToolbarButton = ({ theme = "blue", name, icon, active, disabled, showCaret, children, onClick }: PropsWithChildren<IToolbarButtonProps>) => {
  return (
    <button
      type="button" //
      className={cx("toolbar-button", theme && `toolbar-button--${theme}`, disabled && "disabled", active && "active")}
      onClick={disabled ? undefined : onClick}
    >
      <div className="button__inner">
        {icon && (
          <span className="toolbar-button__icon">
            <i className={cx("fas", `fa-${icon}`)} />
          </span>
        )}
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
