import { Card, CardContent, CardHeader } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { AlignedLoader } from "@workday-core/components/AlignedLoader";
import { MissingHoursDetailDialog } from "./MissingHoursDetailDialog";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";

type MissingHoursCardProps = {
  totalPerPersonMe: any;
};
export type AggregationPersonObject = {
  monthYear: string;
  missing: number;
  id: string;
  name: string;
  contractTypes: string[];
  sickDays: number;
  workDays: number;
  assignment: number;
  event: number;
  total: number;
  leaveDayUsed: number;
  leaveDayBalance: number;
  paidParentalLeaveUsed: number;
  unpaidParentalLeaveUsed: number;
  revenue: {};
  cost: number;
};

export function MissingHoursCard({ totalPerPersonMe }: MissingHoursCardProps) {
  const [data, setData] = useState<AggregationPersonObject[]>([]);
  const [missingHoursDetailsOpen, setMissingHoursDetailsOpen] =
    useState<boolean>(false);
  const [missingHoursDetailsItem, setMissingHoursDetailsItem] =
    useState<AggregationPersonObject>();

  const toAggregationPersonObject = (item: any): AggregationPersonObject => {
    return { ...item } as AggregationPersonObject;
  };

  useEffect(() => {
    if (totalPerPersonMe) {
      const data: AggregationPersonObject[] = Object.keys(totalPerPersonMe)
        .map((monthYear) => ({ ...totalPerPersonMe[monthYear], monthYear }))
        .filter((it) => it !== null)
        .filter((it) => it.assignment > 0)
        .map((it) => ({
          ...it,
          missing: Math.max(
            0,
            it.total -
              (it.workDays +
                it.leaveDayUsed +
                it.sickDays +
                it.event +
                it.paidParentalLeaveUsed +
                it.unpaidParentalLeaveUsed)
          ),
        }))
        .filter((it) => it.missing > 0)
        .map((it) => toAggregationPersonObject(it));
      setData(data);
    }
  }, [totalPerPersonMe]);

  if (!totalPerPersonMe) return <AlignedLoader />;

  const openWorkDayDialog = (item: AggregationPersonObject) => {
    setMissingHoursDetailsOpen(true);
    setMissingHoursDetailsItem(item);
  };

  const handleCLoseWorkdayDialog = () => {
    setMissingHoursDetailsOpen(false);
    setMissingHoursDetailsItem(undefined);
  };

  function renderItem(item: AggregationPersonObject, index: number) {
    return (
      <ListItem key={index} onClick={() => openWorkDayDialog(item)} button>
        <ListItemText
          primary={`You have missing hours in
                    ${new Date(item.monthYear).toLocaleString("en-EN", {
                      month: "long",
                    })}`}
        />
      </ListItem>
    );
  }

  return (
    <>
      <Card variant={"outlined"} style={{ borderRadius: 0 }}>
        <CardHeader title={"Missing hours"} />
        {data.length === 0 && (
          <CardContent>
            <Typography display={"block"}>YEAH! You're up to date!</Typography>
          </CardContent>
        )}
        {data.length > 0 && (
          <CardContent>
            <List>{data.map((it, idx) => renderItem(it, idx))}</List>
          </CardContent>
        )}
      </Card>

      <MissingHoursDetailDialog
        open={missingHoursDetailsOpen}
        item={missingHoursDetailsItem}
        onComplete={handleCLoseWorkdayDialog}
      />
    </>
  );
}
