import DeleteIcon from '@mui/icons-material/Delete';
import KeyIcon from '@mui/icons-material/Key';
import PasswordIcon from '@mui/icons-material/Password';
import PersonIcon from '@mui/icons-material/Person';
import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from '@mui/material';
import type { UserAccount } from '@workday-user/user/response/user';

type UserAccountListProps = {
  accounts?: UserAccount[];
  onDelete: (account: UserAccount) => void;
};

function describe(account: UserAccount): string {
  switch (account.type) {
    case 'OAUTH':
      return account.provider ? `OAuth (${account.provider})` : 'OAuth';
    case 'KEY':
      return account.label ? `API key (${account.label})` : 'API key';
    case 'PASSWORD':
      return 'Password';
    default:
      return account.type ?? 'Account';
  }
}

function icon(type?: string) {
  switch (type) {
    case 'OAUTH':
      return <PersonIcon />;
    case 'KEY':
      return <KeyIcon />;
    default:
      return <PasswordIcon />;
  }
}

export function UserAccountList({ accounts, onDelete }: UserAccountListProps) {
  return (
    <List subheader={<ListSubheader disableGutters>Accounts</ListSubheader>}>
      {(!accounts || accounts.length === 0) && (
        <Typography color="textSecondary">No accounts</Typography>
      )}
      {accounts?.map((account) => (
        <ListItem
          key={account.id}
          disableGutters
          secondaryAction={
            <IconButton
              edge="end"
              aria-label="delete account"
              onClick={() => onDelete(account)}
            >
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemIcon>{icon(account.type)}</ListItemIcon>
          <ListItemText
            primary={describe(account)}
            secondary={
              account.created
                ? new Date(account.created).toLocaleString()
                : undefined
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
