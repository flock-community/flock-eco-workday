import React, { useState } from "react";
import { ClientList } from "./ClientList";
import { ClientDialog } from "./ClientDialog";
import { Box, Card, CardContent, CardHeader } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";

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
    <Box
      className={"flow"}
      flow-gap={"wide"}
      style={{ paddingBottom: "1.5rem" }}
    >
      <Card>
        <CardHeader
          title="Clients"
          action={
            <Button onClick={handleAdd}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <ClientList reload={reload} onItemClick={handleItem} />
        </CardContent>
      </Card>
      <ClientDialog
        code={dialog.code}
        open={dialog.open}
        onClose={handleClose}
      />
    </Box>
  );
}
