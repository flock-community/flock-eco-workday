import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ClientList } from "./ClientList";
import { ClientDialog } from "./ClientDialog";
import { AddActionFab } from "../../components/FabButtons";

export function ClientFeature() {

  const [reload, setReload] = useState(false);

  const [dialog, setDialog] = useState({
    open: false,
    code: undefined,
  });

  const handleAdd = () => {
    setDialog({
      open: true,
      code: undefined,
    });
  };

  const handleItem = (it) => {
    setDialog({
      open: true,
      code: it.code,
    });
  };

  const handleClose = () => {
    setDialog({
      open: false,
      code: undefined,
    });
    setReload(!reload);
  };

  return (
    <>
      <ClientList reload={reload} onItemClick={handleItem} />
      <ClientDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
      <AddActionFab color="primary" onClick={handleAdd} />
    </>
  );
}
