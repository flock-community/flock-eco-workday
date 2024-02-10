import { Card, CardContent, CardHeader } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { PersonHolidayDetails } from "../../clients/AggregationClient";
import { hoursFormatter } from "../../utils/Hours";
import { makeStyles } from "@material-ui/core/styles";
import { highLightClass } from "../../theme/theme-light";
import { HolidayDetailDialog } from "./HolidayDetailDialog";

const useStyles = makeStyles(() => ({
  containerWrapper: {
    containerType: "inline-size",
  },
  hoursLeftWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "baseline",
    "@container (max-width: 500px)": {
      flexDirection: "column",
      alignItems: "center",
    },
  },
  hoursLeft: {
    fontSize: "clamp(6rem, 25cqw, 11rem)",
    position: "relative",
    textAlign: "center",
    zIndex: 2,
    marginInline: "2.5rem",
    "@container (max-width: 500px)": {
      fontSize: "clamp(6rem, 40cqw, 9rem)",
    },
  },
}));

type HolidayCardProps = {
  item: PersonHolidayDetails;
};

export function HolidayCard({ item }: HolidayCardProps) {
  const [available, setAvailable] = useState<number>(0);
  const classes = useStyles();
  const highLightClasses = highLightClass();
  const [holidayHoursDetails, setHolidayHoursDetails] =
    useState<PersonHolidayDetails>();
  const [leaveDayDetailsOpen, setLeaveDayDetailsOpen] =
    useState<boolean>(false);
  const [leaveDayDetailsItem, setLeaveDayDetailsItem] =
    useState<PersonHolidayDetails>();

  useEffect(() => {
    if (item) {
      setHolidayHoursDetails(item);
      setAvailable(item.totalHoursRemaining);
    }
  }, [item]);

  const openLeaveDayDetailsDialog = () => {
    setLeaveDayDetailsOpen(true);
    setLeaveDayDetailsItem(holidayHoursDetails);
  };

  const handleCloseLeaveDayDetailDialog = () => {
    setLeaveDayDetailsOpen(false);
    setLeaveDayDetailsItem(undefined);
  };

  return (
    <>
      <Card
        variant={"outlined"}
        style={{ borderRadius: 0, cursor: "pointer" }}
        onClick={() => openLeaveDayDetailsDialog()}
      >
        <CardHeader title={"Holidays"} />
        <CardContent className={classes.containerWrapper}>
          <div className={classes.hoursLeftWrapper}>
            <span>You have</span>
            <div className={classes.hoursLeft}>
              <span className={highLightClasses.highlight}>
                {hoursFormatter.format(available)}
              </span>
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
    </>
  );
}
