import { Box, Card, CardContent, Typography } from '@mui/material';
import dayjs from 'dayjs';
import {
  HackBudgetBar,
  HackBudgetLegend,
  type HackBudgetRow,
  hackDays,
  hackOver,
  hackOverColor,
  hackOverText,
  hackUpcomingTotal,
} from '../../components/charts/HackBudgetBar';
import type { BudgetSummaryResponse } from '../../wirespec/model';

type HackBudgetBarCardProps = {
  name: string;
  summary: BudgetSummaryResponse;
};

const toRow = (name: string, summary: BudgetSummaryResponse): HackBudgetRow => {
  const today = dayjs();
  const row: HackBudgetRow = {
    name,
    budget: summary.hackTimeBudget.budget,
    attended: 0,
    holiday: 0,
    sick: 0,
    left: 0,
    upcoming: { attended: 0, holiday: 0, sick: 0 },
  };
  for (const event of summary.events) {
    if (event.category !== 'HACK') continue;
    const upcoming = !dayjs(event.from).isBefore(today, 'day');
    const key =
      event.absence === 'HOLIDAY'
        ? 'holiday'
        : event.absence === 'SICK'
          ? 'sick'
          : 'attended';
    // Planned holiday is left out until the hack day has passed; until then it still counts as left.
    if (key === 'holiday' && upcoming) continue;
    row[key] += event.hours;
    if (upcoming) row.upcoming[key] += event.hours;
  }
  row.left = Math.max(row.budget - row.attended - row.holiday - row.sick, 0);
  return row;
};

export function HackBudgetBarCard({
  name,
  summary,
}: Readonly<HackBudgetBarCardProps>) {
  if (summary.hackTimeBudget.budget <= 0) return null;
  const row = toRow(name, summary);
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Typography variant="overline" color="text.secondary">
            Hack budget
          </Typography>
          <HackBudgetLegend />
        </Box>
        <HackBudgetBar row={row} />
        {hackOver(row) > 0 ? (
          <Typography
            variant="body2"
            sx={{ mt: 1, color: hackOverColor(row), fontWeight: 600 }}
          >
            {hackOverText(row)}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {hackDays(row.left)} left · {hackDays(hackUpcomingTotal(row))} can
            still be cancelled
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
