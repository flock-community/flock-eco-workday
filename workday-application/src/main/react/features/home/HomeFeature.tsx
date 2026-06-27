import AddIcon from '@mui/icons-material/Add';
import AirplaneIcon from '@mui/icons-material/AirplaneTicket';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Box, Button } from '@mui/material';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import {
  AggregationClient,
  type PersonHolidayDetails,
} from '../../clients/AggregationClient';
import { ContractClient } from '../../clients/ContractClient';
import { ExpenseClient } from '../../clients/ExpenseClient';
import {
  type PersonEvent,
  PersonEventClient,
} from '../../clients/PersonEventClient';
import ContractsEnding from '../../components/contracts/ContractsEnding';
import { ExpensesCard } from '../../components/expenses-card/ExpensesCard';
import { HackDayEventsCard } from '../../components/hackday-card/HackDayEventsCard';
import { HackdayCard } from '../../components/hackday-card/HackdayCard';
import { HolidayCard } from '../../components/holiday-card/HolidayCard';
import { HoursOverviewCard } from '../../components/hours-overview-card/HoursOverviewCard';
import { MissingHoursCard } from '../../components/missing-hours-card/MissingHoursCard';
import PersonEvents from '../../components/person/PersonEvents';
import { ExpenseDialog } from '../expense/ExpenseDialog';
import { LeaveDayDialog } from '../holiday/LeaveDayDialog';
import { WorkDayDialog } from '../workday/WorkDayDialog';
import { useLoginStatus } from '../../hooks/StatusHook';
import { useUserMe } from '../../hooks/UserMeHook';
import { usePerson } from '../../hooks/PersonHook';
import { addError } from '../../hooks/ErrorHook';
import { HighlightSpan } from '../../theme/theme-light';
import type { Expense } from '../../wirespec/model/Expense';

const twoCol: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(360px, 100%), 1fr))',
  gap: '16px',
};

export function HomeFeature() {
  const [user] = useUserMe();
  const [person] = usePerson();
  const status = useLoginStatus();
  const [withinNWeek] = useState<number>(6);
  const [contracts, setContracts] = useState<any[]>([]);
  const [personEvents, setPersonEvents] = useState<PersonEvent[]>([]);
  const [totalPerPersonMe, setTotalPerPersonMe] = useState<any>(undefined);
  const [personHolidayDetails, setPersonHolidayDetails] =
    useState<PersonHolidayDetails>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hackdayRefreshKey, setHackdayRefreshKey] = useState(0);

  const [workDayOpen, setWorkDayOpen] = useState(false);
  const [leaveDayOpen, setLeaveDayOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);

  const handleHackdayToggle = useCallback(() => {
    setHackdayRefreshKey((k) => k + 1);
  }, []);

  const hasAccess =
    status?.authorities !== undefined && status?.authorities?.length > 0;

  const showContractsEnding =
    status?.authorities?.includes('ContractAuthority.ADMIN') ?? false;

  const showPersonEvents =
    status?.authorities?.includes('PersonAuthority.READ') ?? false;

  useEffect(() => {
    const today: Date = new Date();
    const nWeeksFromNow: Date = dayjs().add(withinNWeek, 'weeks').toDate();
    showContractsEnding &&
      ContractClient.findAllByToBetween(today, nWeeksFromNow).then(
        (contracts) => setContracts(contracts),
      );
    showPersonEvents &&
      PersonEventClient.findAllBetween(today, nWeeksFromNow).then(
        (personEvents) => setPersonEvents(personEvents),
      );
    if (hasAccess) {
      AggregationClient.totalPerPersonMe().then((totalPerPersonMe) =>
        setTotalPerPersonMe(totalPerPersonMe),
      );
      AggregationClient.holidayDetailsMeYear(new Date().getFullYear()).then(
        (res) => setPersonHolidayDetails(res),
      );
      ExpenseClient.findAllByPersonIdNEW(status?.personId, 0, null).then(
        (res) => setExpenses(res.list),
      );
    }
  }, [status, hasAccess, showContractsEnding, showPersonEvents, withinNWeek]);

  const openAddWorkDay = () => {
    if (person === null) {
      addError('No person selected');
    } else {
      setWorkDayOpen(true);
    }
  };

  return (
    <div
      className={'content flow'}
      style={{ marginTop: '24px', paddingBottom: '24px' } as React.CSSProperties}
      flow-gap={'wide'}
    >
      <section style={{ paddingLeft: 16, paddingRight: 16 }}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <Typography variant="h2">
            Hi, <HighlightSpan>{user?.name}!</HighlightSpan>
          </Typography>
          {hasAccess && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddWorkDay}
                sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 600 }}
              >
                Workday
              </Button>
              <Button
                variant="outlined"
                startIcon={<AirplaneIcon />}
                onClick={() => setLeaveDayOpen(true)}
                sx={{ borderRadius: '999px', textTransform: 'none' }}
              >
                Holiday
              </Button>
              <Button
                variant="outlined"
                startIcon={<ReceiptIcon />}
                onClick={() => {
                  if (person === null) {
                    addError('No person selected');
                  } else {
                    setExpenseOpen(true);
                  }
                }}
                sx={{ borderRadius: '999px', textTransform: 'none' }}
              >
                Expense
              </Button>
            </Box>
          )}
        </Box>
        {!hasAccess && (
          <Typography>No roles are assigned to your account.</Typography>
        )}
      </section>

      {(showContractsEnding || showPersonEvents) && (
        <section className={'flow'} style={{ '--flow-gap': '16px' } as React.CSSProperties}>
          {showContractsEnding && (
            <ContractsEnding withinNWeeks={withinNWeek} contracts={contracts} />
          )}
          {showPersonEvents && (
            <PersonEvents
              withinNWeeks={withinNWeek}
              personEvents={personEvents}
            />
          )}
        </section>
      )}

      {hasAccess && (
        <section
          className={'flow'}
          style={{ '--flow-gap': '16px' } as React.CSSProperties}
        >
          <div style={twoCol}>
            <HolidayCard item={personHolidayDetails} />
            <HackdayCard refreshKey={hackdayRefreshKey} />
          </div>

          <HoursOverviewCard totalPerPersonMe={totalPerPersonMe} />

          <div style={twoCol}>
            <ExpensesCard items={expenses} />
            <div
              className={'flow'}
              style={{ '--flow-gap': '16px' } as React.CSSProperties}
            >
              <MissingHoursCard totalPerPersonMe={totalPerPersonMe} />
              <HackDayEventsCard onToggle={handleHackdayToggle} />
            </div>
          </div>
        </section>
      )}

      <WorkDayDialog
        personFullName={person?.fullName}
        open={workDayOpen}
        code={undefined}
        onComplete={() => setWorkDayOpen(false)}
      />
      <LeaveDayDialog
        open={leaveDayOpen}
        code={undefined}
        personId={person?.uuid}
        onComplete={() => setLeaveDayOpen(false)}
      />
      <ExpenseDialog
        open={expenseOpen}
        id={undefined}
        personId={person?.uuid}
        personFullName={person?.fullName ?? ''}
        onComplete={() => setExpenseOpen(false)}
        expenseType={'COST'}
      />
    </div>
  );
}
