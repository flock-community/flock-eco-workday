import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  CONTRACT_PAGE_SIZE,
  ContractClient,
} from '../../clients/ContractClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { ContractType } from './ContractType';

const formatDate = (date) => (date ? date.format('DD-MM-YYYY') : <em>now</em>);

function compensation(it): string {
  switch (it.type) {
    case ContractType.EXTERNAL:
      return `€ ${it.hourlyRate} /h`;
    case ContractType.INTERNAL:
      return `€ ${it.monthlySalary} /mo`;
    case ContractType.MANAGEMENT:
      return `€ ${it.monthlyFee} /mo`;
    case ContractType.SERVICE:
      return `€ ${it.monthlyCost} /mo`;
    default:
      return '-';
  }
}

const hasHoursPerWeek = (type) =>
  type === ContractType.EXTERNAL || type === ContractType.INTERNAL;

type ContractListProps = {
  refresh: boolean;
  personId?: string;
  onItemClick: (item: any) => void;
};
export function ContractList({
  refresh,
  personId,
  onItemClick,
}: Readonly<ContractListProps>) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    if (personId) {
      setLoading(true);
      ContractClient.findAllByPersonId(personId, page).then((res) => {
        setItems(res.list);
        setCount(res.count);
        setLoading(false);
      });
    }
  }, [refresh, personId, page]);

  const handleClickItem = (it) => () => {
    if (onItemClick) onItemClick(it);
  };

  return (
    <>
      <TableContainer sx={{ opacity: loading ? 0.5 : 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell align="right">Hours/week</TableCell>
              <TableCell align="right">Compensation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No contracts</TableCell>
              </TableRow>
            ) : (
              items.map((it) => (
                <TableRow
                  key={it.code}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={handleClickItem(it)}
                >
                  <TableCell>{it.type}</TableCell>
                  <TableCell>{formatDate(it.from)}</TableCell>
                  <TableCell>{formatDate(it.to)}</TableCell>
                  <TableCell align="right">
                    {hasHoursPerWeek(it.type) ? it.hoursPerWeek : '-'}
                  </TableCell>
                  <TableCell align="right">{compensation(it)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={CONTRACT_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}
