import React, { useEffect, useState } from "react";

import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ExpensesIcon from "@material-ui/icons/Money";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import PublishIcon from "@material-ui/icons/Publish";
import { InvoiceClient } from "../../clients/InvoiceClient";

export function ExactonlineListInvoices() {
  const [list, setList] = useState([]);

  useEffect(() => {
    InvoiceClient.all().then((accounts) => {
      setList(accounts);
    });
  }, []);

  const handleClickInvoice = (invoice) => () =>
    InvoiceClient.uploadInvoice(invoice.id);

  return (
    <List>
      {list.map((it) => (
        <ListItem key={it.id}>
          <ListItemAvatar>
            <Avatar>
              <ExpensesIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={`${it.description}`}
            secondary={`${it.type}`}
          />
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={handleClickInvoice(it)}>
              <PublishIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}

ExactonlineListInvoices.propTypes = {};
