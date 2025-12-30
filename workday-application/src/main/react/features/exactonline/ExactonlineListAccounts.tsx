import React, { useEffect, useState } from "react";

import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import { ExactonlineClient } from "../../clients/ExactonlineClient";

export function ExactonlineListAccounts() {
  const [list, setList] = useState<any>([]);

  useEffect(() => {
    ExactonlineClient.accounts().then((accounts) => {
      setList(accounts);
    });
  }, []);

  return (
    <List>
      {list.map((it) => (
        <ListItemText key={it.ID} primary={`${it.Name} (${it.Code.trim()})`} />
      ))}
    </List>
  );
}

ExactonlineListAccounts.propTypes = {};
