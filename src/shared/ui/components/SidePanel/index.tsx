import { PropsWithChildren } from "react";
import cx from "classnames";

import "./SidePanel.scss";

type SidePanelSize = "auto" | "xxs" | "xs" | "s" | "m" | "l" | "xl" | "xxl";

type SidePanelProps = {
  size?: SidePanelSize;
  anchor?: "left" | "right";
  className?: string;
};

const SidePanel = ({ size = "l", anchor = "right", className, children }: PropsWithChildren<SidePanelProps>) => {
  return <div className={cx("side-panel", anchor && `side-panel--anchor-${anchor}`, `side-panel--${size}`, className)}>{children}</div>;
};

export default SidePanel;
