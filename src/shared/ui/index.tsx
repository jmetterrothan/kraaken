import { PropsWithChildren } from "react";

const Ui = ({ children }: PropsWithChildren) => {
  return <div className="ui">{children}</div>;
};

export default Ui;
