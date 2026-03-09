import { PropsWithChildren } from "react";
import cx from "classnames";

import "./Panel.scss";

type PanelProps = {
  className?: string;
};

const Panel = ({ className, children, ...props }: PropsWithChildren<PanelProps>) => {
  return (
    <div className={cx("panel", className)} {...props}>
      {children}
    </div>
  );
};

const PanelHeader = ({ children }: PropsWithChildren) => {
  return <header className="panel__header">{children}</header>;
};

type PanelTitleProps = {
  icon?: string;
};

const PanelTitle = ({ icon, children }: PropsWithChildren<PanelTitleProps>) => {
  return (
    <h4 className="panel__title">
      {icon && <i className={cx("fas", "fa-lg", `fa-${icon}`)} />}
      {children}
    </h4>
  );
};

const PanelBody = ({ children }: PropsWithChildren) => {
  return <div className="panel__body">{children}</div>;
};

const PanelFooter = ({ children }: PropsWithChildren) => {
  return <footer className="panel__footer">{children}</footer>;
};

Panel.Header = PanelHeader;
Panel.Title = PanelTitle;
Panel.Body = PanelBody;
Panel.Footer = PanelFooter;

export default Panel;
