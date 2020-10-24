import React from "react";

import Ui from "@src/shared/ui";
import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";

import { dispatch, editEvent } from "@src/shared/events";

const useLevelActions = () => {
  return React.useMemo(
    () => ({
      edit: (id: number) => dispatch(editEvent(id)),
    }),
    []
  );
};

const LevelUi: React.FC = () => {
  const actions = useLevelActions();

  return (
    <Ui>
      <Toolbar>
        <ToolbarButton
          icon="edit" //
          name="Edit level"
          active={false}
          onClick={() => actions.edit(0)}
        />
      </Toolbar>
    </Ui>
  );
};

export default LevelUi;
