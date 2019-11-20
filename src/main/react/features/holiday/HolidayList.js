import React, {useEffect, useState} from "react";
import HolidayClient from "../../clients/HolidayClient";
import {Card, makeStyles, Typography} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";


const useStyles = makeStyles(theme => ({
  content:{
    position:'relative',
    cursor:'pointer'
  },
  status: {
    position:'absolute',
    top:theme.spacing(2),
    right:theme.spacing(2),
  },
}));

export function HolidayList({userCode, refresh, onClickRow}) {

  const classes = useStyles();

  const [list, setList] = useState([]);

  useEffect(() => {
    if (userCode) {
      HolidayClient.findAllByUserCode(userCode)
        .then(res => {setList(res)})
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
        <CardContent className={classes.content}>
          <Typography variant="h6" >{item.description ? item.description : 'empty'}</Typography>
          <Typography>Period: {item.period.from.format("DD-MM-YYYY")} - {item.period.to.format("DD-MM-YYYY")}</Typography>
          <Typography>Aantal dagen: {item.period.days.filter(day => day.hours > 0).length}</Typography>
          <Typography>Aantal uren: {item.period.days.reduce((acc, cur) => (cur.hours + acc), 0)}</Typography>
          <Typography className={classes.status}>{item.status}</Typography>
        </CardContent>
      </Card>
    </Grid>)
  }

  return <Grid container spacing={1}>{list && list.map(renderItem)}</Grid>

}
