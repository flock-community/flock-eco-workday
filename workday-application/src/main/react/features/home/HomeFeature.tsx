import { Box } from '@mui/material';
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
import { QuickLinks } from '../../components/quick-links/QuickLinks';
import { useLoginStatus } from '../../hooks/StatusHook';
import { useUserMe } from '../../hooks/UserMeHook';
import { HighlightSpan } from '../../theme/theme-light';
import type { Expense } from '../../wirespec/model/Expense';

export function HomeFeature() {
  const [user] = useUserMe();
  const status = useLoginStatus();
  const [withinNWeek] = useState<number>(6);
  const [contracts, setContracts] = useState<any[]>([]);
  const [personEvents, setPersonEvents] = useState<PersonEvent[]>([]);
  const [totalPerPersonMe, setTotalPerPersonMe] = useState<any>(undefined);
  const [personHolidayDetails, setPersonHolidayDetails] =
    useState<PersonHolidayDetails>();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [hackdayRefreshKey, setHackdayRefreshKey] = useState(0);

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

  return (
    <div
      className={'content flow'}
      style={{ marginTop: '24px', paddingBottom: '24px' }}
      flow-gap={'wide'}
    >
      <section className={'flow'}>
        <Box style={{ paddingInline: '16px' }}>
          <Typography variant="h2">
            Hi, <HighlightSpan>{user?.name}!</HighlightSpan>
          </Typography>
        </Box>
        {!hasAccess && (
          <div>
            <Typography>No roles are assigned to your account.</Typography>
          </div>
        )}
      </section>
      {(showContractsEnding || showPersonEvents) && (
        <section className={'flow'}>
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
        <section className={'flow'}>
          <QuickLinks />

          <div className={'gid-auto-fit'}>
            <HolidayCard item={personHolidayDetails} />
            <HackdayCard refreshKey={hackdayRefreshKey} />
          </div>

          <HoursOverviewCard totalPerPersonMe={totalPerPersonMe} />

          <div className={'gid-auto-fit'}>
            <MissingHoursCard totalPerPersonMe={totalPerPersonMe} />
            <ExpensesCard items={expenses} />
          </div>

          <div className={'gid-auto-fit'}>
            <HackDayEventsCard onToggle={handleHackdayToggle} />
            <div />
          </div>
        </section>
      )}
    </div>
  );
}
