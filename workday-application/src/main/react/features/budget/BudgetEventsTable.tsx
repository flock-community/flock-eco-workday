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

const absenceLabel: Record<string, string> = {
  HOLIDAY: 'holiday',
  SICK: 'sick',
};

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
      <CardContent
        sx={{
          '& tbody tr:last-child td, & tbody tr:last-child th': {
            borderBottom: 0,
          },
        }}
      >
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
            {events.map((event) => {
              const editable = Boolean(onEditEvent) && !event.absence;
              return (
                <TableRow
                  key={`${event.eventCode}-${event.category}-${event.from}-${event.absence ?? ''}`}
                  hover={editable}
                  onClick={
                    editable ? () => onEditEvent?.(event.eventCode) : undefined
                  }
                  sx={editable ? { cursor: 'pointer' } : undefined}
                >
                  <TableCell>
                    {event.description}
                    {event.absence && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {` (missed: ${absenceLabel[event.absence] ?? event.absence})`}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{date(event.from)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={categoryLabel[event.category] ?? event.category}
                      color={
                        event.category === 'TRAINING' ? 'accent' : 'primary'
                      }
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {event.hours.toLocaleString('nl-NL', {
                      maximumFractionDigits: 1,
                    })}
                    h
                  </TableCell>
                  <TableCell align="right">
                    {event.category === 'TRAINING' ? (
                      euro(event.cost ?? 0)
                    ) : (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        no cost
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
