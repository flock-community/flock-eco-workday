import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import { CardContent } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import { HolidayClient } from "../../clients/HolidayClient";
import { DayListItem } from "../../components/DayListItem";

type HolidayListProps = {
  personId?: string;
  refresh: boolean;
  onClickRow: (item: any) => void;
  onClickStatus: (status: string, item: any) => void;
};

export function HolidayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: HolidayListProps) {
  const [list, setList] = useState([]);
  const [update] = useState(refresh);

  useEffect(() => {
    if (personId) {
      HolidayClient.findAllByPersonId(personId).then((res) => setList(res));
    } else {
      setList([]);
    }
  }, [personId, refresh, update]);

  function renderItem(item, key) {
    return (
      <Grid item xs={12} key={`holiday-list-item-${key}`}>
        <DayListItem
          value={item}
          onClick={() => onClickRow(item)}
          onClickStatus={(status) => onClickStatus(status, item)}
          hasAuthority={"HolidayAuthority.ADMIN"}
        />
      </Grid>
    );
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No holidays.</Typography>
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
