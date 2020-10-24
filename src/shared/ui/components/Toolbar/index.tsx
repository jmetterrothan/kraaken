import React from "react";

import "./Toolbar.scss";

const Toolbar: React.FC = ({ children }) => {
  return <div className="toolbar">{children}</div>;
};

export default Toolbar;
