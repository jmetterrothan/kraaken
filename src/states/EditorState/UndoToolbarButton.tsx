import React from "react";

import ToolbarButton from "@src/shared/ui/components/ToolbarButton";

import eventStackSvc from "@src/shared/services/EventStackService";

interface IUndoToolbarButtonProps {
  onClick: () => void;
}

export const useUndoSize = (): number => {
  const [size, setSize] = React.useState(0);

  React.useEffect(() => {
    const eventStackUndoChangeSub = eventStackSvc.undoStack.subscribe((n: number) => {
      setSize(n);
    });

    return eventStackUndoChangeSub.unsubscribe;
  }, []);

  return size;
};

const UndoToolbarButton: React.FC<IUndoToolbarButtonProps> = ({ onClick }) => {
  const size = useUndoSize();

  return (
    <ToolbarButton
      icon="undo" //
      name="Undo"
      active={false}
      disabled={size === 0}
      onClick={onClick}
    />
  );
};

export default UndoToolbarButton;
