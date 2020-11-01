import React from "react";

import Ui from "@src/shared/ui";
import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";

import dispatch, * as GameEvents from "@src/shared/events";

const useLevelActions = () => {
  return React.useMemo(
    () => ({
      edit: (id: string) => dispatch(GameEvents.editEvent(id)),
    }),
    []
  );
};

interface ILevelUiProps {
  levelId: string;
}

const LevelUi: React.FC<ILevelUiProps> = ({ levelId }) => {
  const actions = useLevelActions();

  return (
    <Ui>
      <Toolbar>
        <ToolbarButton
          icon="edit" //
          name="Edit level"
          active={false}
          onClick={() => actions.edit(levelId)}
        />
      </Toolbar>
    </Ui>
  );
};

export default LevelUi;
