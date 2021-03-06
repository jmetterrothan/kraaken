import React from "react";

import ToolbarButton from "@src/shared/ui/components/ToolbarButton";

import eventStackSvc from "@src/shared/services/EventStackService";

interface IRedoToolbarButtonProps {
  onClick: () => void;
}

export const useRedoSize = (): number => {
  const [size, setSize] = React.useState(0);

  React.useEffect(() => {
    const eventStackRedoChangeSub = eventStackSvc.redoStack.subscribe((n: number) => {
      setSize(n);
    });

    return eventStackRedoChangeSub.unsubscribe;
  }, []);

  return size;
};

const RedoToolbarButton: React.FC<IRedoToolbarButtonProps> = ({ onClick }) => {
  const size = useRedoSize();

  return (
    <ToolbarButton
      icon="redo" //
      name="Redo"
      active={false}
      disabled={size === 0}
      onClick={onClick}
    />
  );
};

export default RedoToolbarButton;
