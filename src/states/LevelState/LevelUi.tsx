import React from "react";

import Ui from "@src/shared/ui";
import Toolbar from "@src/shared/ui/components/Toolbar";
import ToolbarButton from "@src/shared/ui/components/ToolbarButton";

const LevelUi: React.FC = () => {
  return (
    <Ui>
      <Toolbar>
        <ToolbarButton
          icon="edit" //
          name="Edit level"
          active={false}
          onClick={undefined}
        />
      </Toolbar>
    </Ui>
  );
};

export default LevelUi;
