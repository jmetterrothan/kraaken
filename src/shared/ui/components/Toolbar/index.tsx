import React, { PropsWithChildren } from "react";
import cx from "classnames";

import "./Toolbar.scss";

interface IToolbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const Toolbar = ({ className, style, children }: PropsWithChildren<IToolbarProps>) => {
  return (
    <div className={cx("toolbar", className)} style={style}>
      {children}
    </div>
  );
};

export default Toolbar;
