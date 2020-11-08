import React from "react";
import cx from "classnames";

import "./Toolbar.scss";

interface IToolbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const Toolbar: React.FC<IToolbarProps> = ({ className, style, children }) => {
  return (
    <div className={cx("toolbar", className)} style={style}>
      {children}
    </div>
  );
};

export default Toolbar;
