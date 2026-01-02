import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
// types
import type { DayProps } from '../types';
import { StatusMenu } from './status/StatusMenu';

const PREFIX = 'DayListItem';

const classes = {
  root: `${PREFIX}Root`,
  status: `${PREFIX}Status`,
};

const StyledCard = styled(Card)(({ theme }) => ({
  [`& .${classes.root}`]: {
    position: 'relative',
  },

  [`& .${classes.status}`]: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

type DayListItemProps = {
  value: DayProps;
  onClick: () => void;
  onClickStatus: (status: string) => void;
  hasAuthority: string;
};

export function DayListItem({
  value,
  onClick,
  onClickStatus,
  hasAuthority,
}: DayListItemProps) {
  return (
    <StyledCard onClick={onClick}>
      <CardContent className={classes.root}>
        <Typography variant="h6">
          {value.description ? value.description : 'empty'}
        </Typography>
        {value.type && <Typography>Type: {value.type}</Typography>}
        <Typography>
          Period: {value.from.format('DD-MM-YYYY')} -{' '}
          {value.to.format('DD-MM-YYYY')}
        </Typography>
        <Typography>
          Aantal dagen: {value.to.diff(value.from, 'days') + 1}
        </Typography>
        <Typography>Aantal uren: {value.hours}</Typography>
        <div className={classes.status}>
          <StatusMenu
            onChange={onClickStatus}
            disabled={!UserAuthorityUtil.hasAuthority(hasAuthority)}
            value={value.status}
          />
        </div>
      </CardContent>
    </StyledCard>
  );
}
