import React, {useEffect, useState} from "react";
import HolidayClient from "./HolidayClient";
import {Card, Typography} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";

export function HolidayList({userCode, refresh, onClickRow}) {

  const [list, setList] = useState([]);

  useEffect(() => {
    if (userCode) {
      HolidayClient.fetchAllByUserCode(userCode)
        .then(res => setList(res))
    } else {
      HolidayClient.fetchAll()
        .then(res => setList(res))
    }
  }, [userCode, refresh]);

  function handleClickRow(item) {
    return function (ev) {
      onClickRow && onClickRow(item)
    }
  }

  function renderItem(item) {
    return (<Grid item xs={12} key={`holiday-list-item-${item.id}`}>
      <Card onClick={handleClickRow(item)}>
        <CardContent>
          <Typography variant="h6" >{item.description ? item.description : 'empty'}</Typography>
          <Typography>Van: {item.from.format("DD-MM-YYYY")}</Typography>
          <Typography>Tot: {item.to.format("DD-MM-YYYY")}</Typography>
          <Typography>Aantal dagen: {item.dayOff.length}</Typography>
        </CardContent>
      </Card>
    </Grid>)
  }

  return <Grid container spacing={1}>{list.map(renderItem)}</Grid>

}
