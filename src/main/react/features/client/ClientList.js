import React, {useEffect, useState} from "react";

import {ClientClient} from "../../clients/ClientClient";
import Card from "@material-ui/core/Card";
import {CardContent, makeStyles} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  root: {
    padding: 10
  },
  fab: {
    position: 'absolute',
    bottom: "25px",
    right: "25px"
  }
});

export function ClientList({reload, onItemClick}) {

  const classes = useStyles();

  const [list, setList] = useState([])

  useEffect(() => {
    ClientClient.findAllByPage(0)
      .then(res => setList(res))
  }, [reload])

  const handleItem = (it) => (ev) => {
    onItemClick && onItemClick(it)
  }

  return (<Grid container className={classes.root} spacing={1}>
    {list.map(it => (<Grid item xs={12} key={`clients-${it.code}`}>
      <Card  onClick={handleItem(it)}>
        <CardContent>
          <Typography variant="h6" >
            {it.name}
          </Typography>
        </CardContent>
      </Card>
    </Grid>))}
  </Grid>)
}
