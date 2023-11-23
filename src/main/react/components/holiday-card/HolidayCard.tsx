import {Card, CardContent, CardHeader} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import React, {useEffect, useState} from "react";
import {AggregationClient, leaveDayReportMeNew, PersonHolidayDetails} from "../../clients/AggregationClient";
import {hoursFormatter} from "../../utils/Hours";
import {makeStyles} from "@material-ui/core/styles";
import {highLightClass} from "../../theme/theme-light";
import HealingIcon from "@material-ui/icons/Healing";
import {LeaveDayReport} from "../tables/DashboardLeaveDayTable";
import {HolidayDetailDialog} from "./HolidayDetailDialog";
import {AggregationPersonObject} from "../missing-hours-card/MissingHoursCard";

const useStyles = makeStyles(() => ({
  hoursLeft: {
    fontSize: '10rem',
    position: "relative",
    textAlign: "center",
    zIndex: 2,
  }
}));

type HolidayCardProps = {
  item: PersonHolidayDetails
}

export function HolidayCard({ item }: HolidayCardProps) {
  const [available, setAvailable] = useState<number>(0);
  const classes = useStyles();
  const highLightClasses = highLightClass();
  const [holidayHoursDetails, setHolidayHoursDetails] = useState<PersonHolidayDetails>();
  const [leaveDayDetailsOpen, setLeaveDayDetailsOpen] = useState<boolean>(false);
  const [leaveDayDetailsItem, setLeaveDayDetailsItem] = useState<PersonHolidayDetails>();

  useEffect(() => {
    if (item) {
      setHolidayHoursDetails(item);
      setAvailable(item.totalHoursRemaining);
    }
  }, [item]);

  const openLeaveDayDetailsDialog = () => {
    setLeaveDayDetailsOpen(true);
    setLeaveDayDetailsItem(holidayHoursDetails);
  }

  const handleCloseLeaveDayDetailDialog = () => {
    setLeaveDayDetailsOpen(false);
    setLeaveDayDetailsItem(undefined);
  }

  return (<>
    <Card variant={"outlined"} style={{borderRadius: 0}} onClick={() => openLeaveDayDetailsDialog()}>
      <CardHeader title={"Holidays"}/>
      <CardContent>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end'}}>
          <span>You have</span>
          <div className={classes.hoursLeft}>
            <span className={highLightClasses.highlight}>{hoursFormatter.format(available)}</span>
          </div>
          <span>hours left</span>
        </div>
      </CardContent>
    </Card>

    <HolidayDetailDialog
      open={leaveDayDetailsOpen}
      item={leaveDayDetailsItem}
      onComplete={handleCloseLeaveDayDetailDialog}
    />
  </>);
}
