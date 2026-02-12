import React from "react";

import Ui from "@src/shared/ui";
import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";

import dispatch, * as GameEvents from "@src/shared/events";
import keyBindings from "@src/keyBindings";

const useLevelActions = () => {
  return React.useMemo(
    () => ({
      edit: (id: string) => dispatch(GameEvents.editEvent(id)),
    }),
    []
  );
};

interface ILevelUiProps {
  projectId: string;
}

const LevelUi: React.FC<ILevelUiProps> = ({ projectId }) => {
  const actions = useLevelActions();

  return (
    <Ui>
      <Toolbar style={{ width: "fit-content" }}>
        <ToolbarButton
          icon="edit" //
          name="Edit level"
          kbd={keyBindings.level.edit.toString()}
          active={false}
          onClick={() => actions.edit(projectId)}
        />
      </Toolbar>
    </Ui>
  );
};

export default LevelUi;
