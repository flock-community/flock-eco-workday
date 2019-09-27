import React, {useEffect, useState} from "react";
import SickdayClient from "./SickdayClient";
import {Card, Typography} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";

export function SickdayList({userCode, refresh, onClickRow}) {

  const [list, setList] = useState([]);

  useEffect(() => {
    if (userCode) {
      SickdayClient.fetchAllByUserCode(userCode)
        .then(res => {console.log(res);setList(res)})
    } else {
      SickdayClient.fetchAll()
        .then(res => setList(res))
    }
  }, [userCode, refresh]);

  function handleClickRow(item) {
    return function (ev) {
      onClickRow && onClickRow(item)
    }
  }

  function renderItem(item) {
    return (<Grid item xs={12} key={`sickday-list-item-${item.id}`}>
      <Card onClick={handleClickRow(item)}>
        <CardContent>
          <Typography variant="h6" >{item.description ? item.description : 'empty'}</Typography>
          <Typography>Type: {item.days[0].type}</Typography>
          <Typography>Period: {item.from.format("DD-MM-YYYY")} - {item.to.format("DD-MM-YYYY")}</Typography>
          <Typography>Aantal dagen: {item.days.filter(day => day.hours > 0).length}</Typography>
        </CardContent>
      </Card>
    </Grid>)
  }

  return <Grid container spacing={1}>{list && list.map(renderItem)}</Grid>

}
