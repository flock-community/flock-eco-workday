import ExpensesIcon from '@mui/icons-material/Money';
import PublishIcon from '@mui/icons-material/Publish';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useState } from 'react';
import { InvoiceClient } from '../../clients/InvoiceClient';

export function ExactonlineListInvoices() {
  const [list, setList] = useState<any>([]);

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
            <IconButton
              edge="end"
              onClick={handleClickInvoice(it)}
              size="large"
            >
              <PublishIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}
