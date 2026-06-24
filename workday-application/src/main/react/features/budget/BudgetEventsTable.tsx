import {
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { BudgetEvent } from '../../wirespec/model';

interface BudgetEventsTableProps {
  events: BudgetEvent[];
  onEditEvent?: (eventCode: string) => void;
}

const euro = (value: number) =>
  value.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });

const date = (iso: string) =>
  new Date(iso).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const categoryLabel: Record<string, string> = {
  HACK: 'Hack',
  TRAINING: 'Training',
};

export function BudgetEventsTable({
  events,
  onEditEvent,
}: Readonly<BudgetEventsTableProps>) {
  if (events.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Events
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell align="right">Hours</TableCell>
              <TableCell align="right">Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow
                key={`${event.eventCode}-${event.category}`}
                hover={Boolean(onEditEvent)}
                onClick={
                  onEditEvent ? () => onEditEvent(event.eventCode) : undefined
                }
                sx={onEditEvent ? { cursor: 'pointer' } : undefined}
              >
                <TableCell>{event.description}</TableCell>
                <TableCell>{date(event.from)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={categoryLabel[event.category] ?? event.category}
                  />
                </TableCell>
                <TableCell align="right">
                  {event.hours.toLocaleString('nl-NL', {
                    maximumFractionDigits: 1,
                  })}
                  h
                </TableCell>
                <TableCell align="right">
                  {event.category === 'TRAINING' ? euro(event.cost ?? 0) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
