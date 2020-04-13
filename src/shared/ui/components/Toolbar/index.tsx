import React from "react";

import "./Toolbar.scss";

const Toolbar: React.FunctionComponent = ({ children }) => {
  return <div className="toolbar">{children}</div>;
};

export default Toolbar;
