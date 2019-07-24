import React, {useEffect, useState} from "react";
import HolidayClient from "./HolidayClient";
import {Card, Typography} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

export function HolidayList({userId, refresh, onClickRow}) {

  const [list, setList] = useState([]);

  useEffect(() => {
    if (userId) {
      HolidayClient.fetchById(userId)
        .then(res => setList(res))
    }
  }, [userId, refresh]);

  function handleClickRow(item) {
    return function (ev) {
      onClickRow && onClickRow(item)
    }
  }

  function renderItem(item) {
    return (<Grid item xs={12} key={`holiday-list-item-${item.id}`}>
      <Card onClick={handleClickRow(item)}>
        <Typography>{item.from.toString()} - {item.to.toString()}</Typography>
        <Typography>{item.description}</Typography>
      </Card>
    </Grid>)
  }

  return <Grid container spacing={1}>{list.map(renderItem)}</Grid>

}
