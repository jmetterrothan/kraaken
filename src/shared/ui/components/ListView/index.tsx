import { PropsWithChildren } from "react";
import cx from "classnames";

import "./ListView.scss";

type ListViewProps = {
  className?: string;
};

const ListView = ({ className, children }: PropsWithChildren<ListViewProps>) => {
  return <ul className={cx("list-view", className)}>{children}</ul>;
};

type ListViewItemProps = {
  className?: string;
};

const ListViewItem = ({ className, children }: PropsWithChildren<ListViewItemProps>) => {
  return <li className={cx("list-view__item", className)}>{children}</li>;
};

ListView.Item = ListViewItem;

export default ListView;
