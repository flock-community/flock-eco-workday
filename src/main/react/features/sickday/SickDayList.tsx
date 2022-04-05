import React, {useEffect, useState} from "react";
import {Card, Typography} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import {SickDayClient} from "../../clients/SickDayClient";
import {DayListItem} from "../../components/DayListItem";

type SickDayListProps = {
  refresh: boolean;
  personId?: string;
  onClickRow: (item: any) => void;
  onClickStatus: (status: string, item: any) => void;
};

export function SickDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: SickDayListProps) {
  const [list, setList] = useState([]);

  useEffect(() => {
    if (personId) {
      SickDayClient.findAllByPersonId(personId).then((res) => setList(res));
    } else {
      setList([]);
    }
  }, [personId, refresh]);

  function renderItem(item, key) {
    return (
      <Grid item xs={12} key={`sickday-list-item-${key}`}>
        <DayListItem
          value={item}
          onClick={() => onClickRow(item)}
          onClickStatus={(status) => onClickStatus(status, item)}
          hasAuthority={"SickdayAuthority.ADMIN"}
        />
      </Grid>
    );
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No sick days</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={1}>
      {list.map(renderItem)}
    </Grid>
  );
}
