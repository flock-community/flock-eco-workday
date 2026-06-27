import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  EVENT_PAGE_SIZE,
  EventClient,
  EventType,
  type FlockEvent,
  type FullFlockEvent,
} from '../../clients/EventClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import { EventTypeMapping } from '../../utils/mappings';
import { isDefined } from '../../utils/validation';

type EventListProps = {
  refresh: boolean;
  onClickRow: (item: FullFlockEvent) => void;
};

function eventTypeChip(type: EventType) {
  if (type === EventType.FLOCK_HACK_DAY) {
    return { color: 'primary', variant: 'filled' } as const;
  }
  if (type === EventType.CONFERENCE) {
    return { color: 'accent', variant: 'filled' } as const;
  }
  return { variant: 'outlined' } as const;
}

export const EventList = ({
  refresh,
  onClickRow,
}: Readonly<EventListProps>) => {
  const [items, setItems] = useState<FlockEvent[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    setLoading(true);

    EventClient.getAll(page)
      .then((res) => {
        setItems(res.list);
        setCount(res.count);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refresh, page]);

  function handleClickRow(item: FullFlockEvent) {
    return () => {
      if (isDefined(onClickRow)) onClickRow(item);
    };
  }

  function renderItem(item: FullFlockEvent) {
    return (
      <TableRow
        key={`event-list-item-${item.id}`}
        hover
        sx={{ cursor: 'pointer' }}
        onClick={handleClickRow(item)}
      >
        <TableCell>{item.description}</TableCell>
        <TableCell>
          <Chip
            label={EventTypeMapping[item.type]}
            size="small"
            {...eventTypeChip(item.type)}
          />
        </TableCell>
        <TableCell>{item.from.format('DD-MM-YYYY')}</TableCell>
        <TableCell>{item.to ? item.to.format('DD-MM-YYYY') : 'now'}</TableCell>
        <TableCell align="right">
          {item.to ? item.to.diff(item.from, 'days') + 1 : '-'}
        </TableCell>
        <TableCell align="right">{item.persons.length}</TableCell>
        <TableCell align="right">{item.hours}</TableCell>
        <TableCell align="right">
          {item.costs.toLocaleString('nl-NL', {
            style: 'currency',
            currency: 'EUR',
          })}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <Box>
      <TableCard loading={loading}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Event</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>From</TableCell>
                <TableCell>To</TableCell>
                <TableCell align="right">Days</TableCell>
                <TableCell align="right">People</TableCell>
                <TableCell align="right">Hours</TableCell>
                <TableCell align="right">Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{ py: 4, color: 'text.secondary' }}
                  >
                    No events
                  </TableCell>
                </TableRow>
              ) : (
                items.map(renderItem)
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TableCard>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={EVENT_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </Box>
  );
};
