import { PropsWithChildren } from "react";
import cx from "classnames";

import "./SidePanel.scss";

type SidePanelProps = {
  className?: string;
};

const SidePanel = ({ className, children }: PropsWithChildren<SidePanelProps>) => {
  return <div className={cx("side-panel", className)}>{children}</div>;
};

const SidePanelTitle = ({ children }: PropsWithChildren) => {
  return <h4 className="side-panel__title">{children}</h4>;
};

SidePanel.Title = SidePanelTitle;

export default SidePanel;
