import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  EVENT_PAGE_SIZE,
  EventClient,
  EventType,
  type FullFlockEvent,
} from '../../clients/EventClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import { EventTypeMapping } from '../../utils/mappings';
import { isDefined } from '../../utils/validation';

type EventListProps = {
  refresh: boolean;
  onClickRow: (item: FullFlockEvent) => void;
  onClickAdd: () => void;
};

type TypeFilter = EventType | 'ALL';

const currentYear = new Date().getFullYear();
const selectableYears = [currentYear, currentYear - 1, currentYear - 2];
const YEAR_FETCH_SIZE = 500;

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
  onClickAdd,
}: Readonly<EventListProps>) => {
  const [allItems, setAllItems] = useState<FullFlockEvent[]>([]);
  const [page, setPage] = useState(0);
  const [year, setYear] = useState(currentYear);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    setLoading(true);

    EventClient.getAll(0, year, YEAR_FETCH_SIZE)
      .then((res) => {
        setAllItems(res.list);
        setPage(0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refresh, year]);

  const filtered = allItems.filter((item) => {
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    const matchesSearch =
      search.trim() === '' ||
      item.description.toLowerCase().includes(search.trim().toLowerCase());
    return matchesType && matchesSearch;
  });
  const paged = filtered.slice(
    page * EVENT_PAGE_SIZE,
    (page + 1) * EVENT_PAGE_SIZE,
  );

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

  const toolbar = (
    <>
      <TextField
        size="small"
        placeholder="Search events"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(0);
        }}
        sx={{ minWidth: 200 }}
      />
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="event-type-label">Type</InputLabel>
        <Select
          labelId="event-type-label"
          label="Type"
          value={typeFilter}
          onChange={(event) => {
            setTypeFilter(event.target.value as TypeFilter);
            setPage(0);
          }}
        >
          <MenuItem value="ALL">All types</MenuItem>
          {Object.values(EventType).map((type) => (
            <MenuItem key={type} value={type}>
              {EventTypeMapping[type]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 110 }}>
        <InputLabel id="event-year-label">Year</InputLabel>
        <Select
          labelId="event-year-label"
          label="Year"
          value={year}
          onChange={(event) => {
            setYear(Number(event.target.value));
            setPage(0);
          }}
        >
          {selectableYears.map((selectableYear) => (
            <MenuItem key={selectableYear} value={selectableYear}>
              {selectableYear}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );

  const addButton = (
    <Button variant="contained" startIcon={<AddIcon />} onClick={onClickAdd}>
      Add
    </Button>
  );

  return (
    <Box>
      <TableCard
        title="Events"
        toolbar={toolbar}
        action={addButton}
        loading={loading}
      >
        <TableContainer>
          <Table size="small" sx={{ minWidth: 800 }}>
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
              {filtered.length === 0 ? (
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
                paged.map(renderItem)
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={filtered.length}
        itemsPerPage={EVENT_PAGE_SIZE}
        changePageCb={setPage}
      />
    </Box>
  );
};
