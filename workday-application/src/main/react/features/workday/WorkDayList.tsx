import {
  Box,
  Card,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';
import { WORK_DAY_PAGE_SIZE, WorkDayClient } from '../../clients/WorkDayClient';
// Components
import { FlockPagination } from '../../components/pagination/FlockPagination';
// Types
import type { DayListProps, DayProps } from '../../types';
import { WorkDayListItem } from './WorkDayListItem';

const PREFIX = 'WorkDayList';

const classes = {
  card: `${PREFIX}Card`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
  [`& .${classes.card}`]: (loading) => ({
    marginTop: '10px',
    opacity: loading ? 0.5 : 1,
  }),
});

export function WorkDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: DayListProps) {
  const [list, setList] = useState<DayProps[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    WorkDayClient.findAllByPersonUuid(personId, page).then(
      (res: { list: DayProps[]; count: number }) => {
        setList(res.list);
        setCount(res.count);
        setLoading(false);
      },
    );
  }, [personId, page]);

  function renderItem(item) {
    return (
      <WorkDayListItem
        key={item.id}
        value={item}
        onClick={() => onClickRow(item)}
        onClickStatus={(status) => onClickStatus(status, item)}
        hasAuthority={'WorkDayAuthority.ADMIN'}
      />
    );
  }

  const renderItems = () => {
    if (list.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8}>No workdays</TableCell>
        </TableRow>
      );
    }

    return list.map(renderItem);
  };

  return (
    <Root>
      <Card className={classes.card}>
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell>Assignment</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell align="right">Days</TableCell>
                  <TableCell align="right">Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>{renderItems()}</TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={WORK_DAY_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </Root>
  );
}
