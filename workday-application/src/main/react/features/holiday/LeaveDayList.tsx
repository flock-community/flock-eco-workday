import { Box, CardContent } from '@mui/material';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import {
  LEAVE_DAY_PAGE_SIZE,
  LeaveDayClient,
} from '../../clients/LeaveDayClient';
import { DayListItem } from '../../components/DayListItem';

// Components
import { FlockPagination } from '../../components/pagination/FlockPagination';

// Types
import type { DayListProps, DayProps } from '../../types';

const PREFIX = 'LeaveDayList';

const classes = {
  list: `${PREFIX}List`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
  [`& .${classes.list}`]: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
});

export function LeaveDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: DayListProps) {
  const [list, setList] = useState<DayProps[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [_loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    if (personId) {
      setLoading(true);
      LeaveDayClient.findAllByPersonId(personId, page).then(
        ({ list, count }: { list: DayProps[]; count: number }) => {
          setList(list);
          setCount(count);
          setLoading(false);
        },
      );
    } else {
      setList([]);
    }
  }, [refresh, personId, page]);

  function renderItem(item: DayProps, key: number) {
    return (
      <Grid size={{ xs: 12 }} key={`holiday-list-item-${key}`}>
        <DayListItem
          value={item}
          onClick={() => onClickRow(item)}
          onClickStatus={(status) => onClickStatus(status, item)}
          hasAuthority={'LeaveDayAuthority.ADMIN'}
        />
      </Grid>
    );
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No leave days.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Root>
      <Grid container spacing={1} className={classes.list}>
        {list.map(renderItem)}
      </Grid>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={LEAVE_DAY_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </Root>
  );
}
