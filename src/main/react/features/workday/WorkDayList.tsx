import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import { WorkDayClient } from "../../clients/WorkDayClient";
import { WorkDayListItem } from "./WorkDayListItem";

type WorkDayListProps = {
  personId?: string;
  refresh: boolean;
  onClickRow: (item: any) => void;
  onClickStatus: (status: any, item: any) => void;
};
export function WorkDayList({
  personId,
  refresh,
  onClickRow,
  onClickStatus,
}: WorkDayListProps) {
  const [state, setState] = useState([]);

  useEffect(() => {
    if (personId) {
      WorkDayClient.findAllByPersonUuid(personId).then((res) =>
        setState(res)
      );
    }
  }, [personId, refresh]);

  function renderItem(item, key) {
    return (
      <Grid key={`workday-list-item-${key}`} item xs={12}>
        <WorkDayListItem
          value={item}
          onClick={() => onClickRow(item)}
          onClickStatus={(status) => onClickStatus(status, item)}
          hasAuthority={"WorkDayAuthority.ADMIN"}
        />
      </Grid>
    );
  }

  if (state.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No workdays</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={1}>
      {state.map(renderItem)}
    </Grid>
  );
}
