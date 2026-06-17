import BackIcon from '@mui/icons-material/ChevronLeft';
import NextIcon from '@mui/icons-material/ChevronRight';
import { Box, CardContent } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AggregationClient } from '../../clients/AggregationClient';
import { useChartColors } from '../../theme/chartColors';

export function MonthFeature() {
  const [date, setDate] = useState(dayjs().startOf('month'));
  const [totalPerPersonState, setTotalPerPersonState] = useState<any>();
  const [clientHourOverviewState, setClientHourOverviewState] = useState<any>();

  const colors = useChartColors();
  const history = useHistory();

  useEffect(() => {
    let cancel = false;
    AggregationClient.totalPerPersonByYearMonth(
      date.year(),
      date.month() + 1,
    ).then((res) => !cancel && setTotalPerPersonState(res));
    return () => {
      cancel = true;
    };
  }, [date]);

  useEffect(() => {
    let cancel = false;
    AggregationClient.clientHourOverviewByYearMonth(
      date.year(),
      date.month() + 1,
    ).then((res) => !cancel && setClientHourOverviewState(res));
    return () => {
      cancel = true;
    };
  }, [date]);

  const handleMonth = (amount) => () => {
    setDate(date.add(amount, 'month'));
  };

  if (!totalPerPersonState || !clientHourOverviewState)
    return <AlignedLoader />;

  const totalPerPersonData = totalPerPersonState
    .filter((it) => it.assignment > 0)
    .map((it) => ({
      ...it,
      missing: Math.max(
        it.total -
          (it.workDays +
            it.leaveDayUsed +
            it.sickDays +
            it.event +
            it.paidParentalLeaveUsed +
            it.unpaidParentalLeaveUsed),
        0,
      ),
    }));

  const totalHours = totalPerPersonData.reduce(
    (acc, cur) => acc + cur.workDays,
    0,
  );

  const renderChart = (x) => {
    if (x.length === 0)
      return (
        <Typography color="text.secondary" variant="body2">
          No persons in this group for this month.
        </Typography>
      );
    const height = 50 + x.length * 50;
    return (
      <ResponsiveContainer height={height}>
        <BarChart data={x} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="name" width={150} />
          <Tooltip
            // @ts-expect-error
            formatter={(value) => new Intl.NumberFormat().format(value)}
          />
          <Legend />
          <Bar
            stackId="days"
            dataKey="workDays"
            name="worked hours"
            fill={colors.worked}
          />
          <Bar
            stackId="days"
            dataKey="leaveDayUsed"
            name="leave hours"
            fill={colors.leave}
          />
          <Bar
            stackId="days"
            dataKey="paidParentalLeaveUsed"
            name="paid parental leave"
            fill={colors.paidParentalLeave}
          />
          <Bar
            stackId="days"
            dataKey="unpaidParentalLeaveUsed"
            name="unpaid parental leave"
            fill={colors.unpaidParentalLeave}
          />
          <Bar
            stackId="days"
            dataKey="sickDays"
            name="sick hours"
            fill={colors.sick}
          />
          <Bar
            stackId="days"
            dataKey="event"
            name="event hours"
            fill={colors.event}
          />
          <Bar
            stackId="days"
            dataKey="missing"
            name="missing hours"
            fill={colors.missing}
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              display="block"
            >
              Workforce overview
            </Typography>
            <Typography variant="h5">
              Month: {date.format('YYYY-MM')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Total persons: {totalPerPersonData.length} &middot; Total hours:{' '}
              {totalHours}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton onClick={handleMonth(-1)} aria-label="Previous month">
              <BackIcon />
            </IconButton>
            <Button
              variant="text"
              onClick={() => setDate(dayjs().startOf('month'))}
            >
              Today
            </Button>
            <IconButton onClick={handleMonth(1)} aria-label="Next month">
              <NextIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Internal" />
        <CardContent>
          {renderChart(
            totalPerPersonData
              .filter((it) => it.contractTypes != null)
              .filter(
                (it) =>
                  it.contractTypes.includes('ContractInternal') ||
                  it.contractTypes.includes('ContractManagement'),
              ),
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="External" />
        <CardContent>
          {renderChart(
            totalPerPersonData
              .filter((it) => it.contractTypes != null)
              .filter(
                (it) =>
                  it.contractTypes.length === 0 ||
                  it.contractTypes.includes('ContractExternal'),
              ),
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader title="Hours per client per person" />
        <CardContent>
          <Typography>
            This report has been improved and can now be found under the
            "Reports" menu item.
          </Typography>
          <Box mt={2}>
            <Button onClick={() => history.push('/reports/assignment')}>
              Open report
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
