import React, {useEffect, useState} from "react";
import HolidayClient from "./HolidayClient";
import {Card, Typography} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions"
import Button from '@material-ui/core/Button';
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
      <Card>
        <CardContent>
          <Typography>{item.description ? item.description : 'Vakantie zonder beschrijving'}</Typography>
          <Typography>Van: {item.from.toString()}</Typography>
          <Typography>Tot: {item.to.toString()}</Typography>
          <Typography>Dagen: {item.dayOff.length}</Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={handleClickRow(item)}>Edit</Button>
          <Button size="small" onClick={handleClickRow(item)}>Delete</Button>
        </CardActions>
      </Card>
    </Grid>)
  }

  return <Grid container spacing={1}>{list.map(renderItem)}</Grid>

}
