import React, {useEffect, useState} from "react";
import Typography from "@material-ui/core/Typography";
import {useUserMe} from "../../hooks/UserMeHook";
import {Box} from "@material-ui/core";
import ContractsEnding from "../../components/contracts/ContractsEnding";
import PersonEvents from "../../components/person/PersonEvents";
import {highLightClass} from "../../theme/theme-light";
import {QuickLinks} from "../../components/quick-links/QuickLinks";
import {MissingHoursCard} from "../../components/missing-hours-card/MissingHoursCard";
import {HolidayCard} from "../../components/holiday-card/HolidayCard";
import {ContractClient} from "../../clients/ContractClient";
import dayjs from "dayjs";
import {PersonEvent, PersonEventClient} from "../../clients/PersonEventClient";
import {AggregationClient, PersonHolidayDetails} from "../../clients/AggregationClient";
import {ExpensesCard} from "../../components/expenses-card/ExpensesCard";
import {ExpenseClient} from "../../clients/ExpenseClient";
import {useLoginStatus} from "../../hooks/StatusHook";
import {Expense} from "../../models/Expense";
import {UpcomingEventsCard} from "../../components/upcoming-events/UpcomingEventsCard";
import {EventClient, FlockEvent} from "../../clients/EventClient";

export function HomeFeature() {
    const [user] = useUserMe();
    const status = useLoginStatus();
    const [withinNWeek] = useState<number>(6);
    const [contracts, setContracts] = useState<any[]>([]);
    const [personEvents, setPersonEvents] = useState<PersonEvent[]>([]);
    const [totalPerPersonMe, setTotalPerPersonMe] = useState<any>(undefined);
    const [personHolidayDetails, setPersonHolidayDetails] = useState<PersonHolidayDetails>();
    const [expenses, setExpenses] = useState<Expense[]>([]);
  const [flockEvents, setFlockEvents] = useState<FlockEvent[]>([]);

    const hasAccess = status?.authorities?.length > 0;

    const showContractsEnding =
        status?.authorities?.includes("ContractAuthority.ADMIN") ?? false;

    const showPersonEvents =
        status?.authorities?.includes("PersonAuthority.READ") ?? false;

    const classes = highLightClass();

    useEffect(() => {
        const today: Date = new Date();
        const nWeeksFromNow: Date = dayjs().add(withinNWeek, "weeks").toDate();
        showContractsEnding && ContractClient.findAllByToBetween(today, nWeeksFromNow).then((contracts) => setContracts(contracts));
        showPersonEvents && PersonEventClient.findAllBetween(today, nWeeksFromNow).then((personEvents) => setPersonEvents(personEvents));
        if (hasAccess) {
            AggregationClient.totalPerPersonMe().then(totalPerPersonMe => setTotalPerPersonMe(totalPerPersonMe));
            AggregationClient.holidayDetailsMeYear(new Date().getFullYear()).then(res => setPersonHolidayDetails(res));
            ExpenseClient.findAllByPersonIdNEW(status?.personId, 0, null).then(
                res=> setExpenses(res.list));
          EventClient.getUpcoming(dayjs(), dayjs().add(1, 'month').endOf('month')).then((res) => setFlockEvents(res));
        }
    }, [status]);

    return (
        <div className={'content flow'} style={{marginTop: '24px', paddingBottom: '24px'}} flow-gap={'wide'}>
            <section className={'flow'}>
                <Box style={{paddingInline: "16px"}}>
                    <Typography variant="h2">Hi, <span
                        className={classes.highlight}>{user && user.name}!</span></Typography>
                </Box>
                {!hasAccess && (
                    <div>
                        <Typography>No roles are assigned to your account.</Typography>
                    </div>
                )}
            </section>
            { (showContractsEnding || showPersonEvents) && (
              <section className={'flow'}>
                {showContractsEnding && (
                    <ContractsEnding withinNWeeks={withinNWeek} contracts={contracts}/>
                )}
                {showPersonEvents && (
                    <PersonEvents withinNWeeks={withinNWeek} personEvents={personEvents}/>
                )}
              </section>
            )}
            {hasAccess && (
                <section className={'flow'}>
                  <QuickLinks/>

                  <div className={'gid-auto-fit'}>
                      <MissingHoursCard totalPerPersonMe={totalPerPersonMe}/>
                      <HolidayCard item={personHolidayDetails}/>
                  </div>

                  <div className={'gid-auto-fit'}>
                    <ExpensesCard items={expenses} />
                    <UpcomingEventsCard items={flockEvents}/>
                  </div>

                </section>)}
        </div>
    );
}
