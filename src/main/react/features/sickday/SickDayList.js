import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Card, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import { SickDayClient } from "../../clients/SickDayClient";
import { DayListItem } from "../../components/DayListItem";

export function SickDayList({
  personCode,
  refresh,
  onClickRow,
  onClickStatus
}) {
  const [list, setList] = useState([]);

  useEffect(() => {
    SickDayClient.findAllByPersonCode(personCode).then(res => setList(res));
  }, [personCode, refresh]);

  function renderItem(item, key) {
    return (
      <Grid item xs={12} key={`sickday-list-item-${key}`}>
        <DayListItem
          value={item}
          onClick={e => onClickRow(e, item)}
          onClickStatus={status => onClickStatus(status, item)}
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

SickDayList.propTypes = {
  refresh: PropTypes.bool,
  personCode: PropTypes.string,
  onClickRow: PropTypes.func,
  onClickStatus: PropTypes.func
};
