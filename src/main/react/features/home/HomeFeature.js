import React, {useState, useEffect} from 'react'
import Typography from '@material-ui/core/Typography';
import {makeStyles} from "@material-ui/core/styles";
import UserClient from "@flock-eco/feature-user/src/main/react/user/UserClient";

const useStyles = makeStyles({
  root: {
    padding: 20
  },
  fab: {
    position: 'absolute',
    bottom: "25px",
    right: "25px"
  }
});

export function HomeFeature() {

  const classes = useStyles();

  const [user, setUser] = useState()

  useEffect(() => {
    fetch('/api/users/me')
      .then(res => {
        if(res.ok){
          res.json()
            .then(setUser)
        }
      })
  }, [])

  return (<div className={classes.root}>
    <Typography variant="h2">Welcome in workday 123</Typography>
    <Typography>You are logged in as {user && user.name}</Typography>
  </div>)
}
