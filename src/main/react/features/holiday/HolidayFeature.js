import React, {useContext, useEffect, useState} from 'react'

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import {HolidayDialog} from "./HolidayDialog";
import {HolidayList} from "./HolidayList";
import {makeStyles} from "@material-ui/core/styles";
import {UserSelector} from "../../components/UserSelector";
import HolidayClient from "../../clients/HolidayClient";
import {ApplicationContext} from "../../application/ApplicationContext";
import Grid from "@material-ui/core/Grid";

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

/**
 * @return {null}
 */
export function HolidayFeature() {

  const classes = useStyles();

  const [refresh, setRefresh] = useState(false)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(null)
  const [userCode, setUserCode] = useState(null)
  const [users, setUsers] = useState([])
  const {authorities, user} = useContext(ApplicationContext);

  useEffect(() => {
    if (isSuperUser()) {
      HolidayClient.getAllUsers()
        .then(users => {
          setUsers(users)
        })
    }

    user && setUserCode(user.code)

  }, [authorities, user]);

  function handleCompleteDialog() {
    setRefresh(!refresh)
    setOpen(false)
    setValue(null)
  }

  function handleClickAdd() {
    setValue(null)
    setOpen(true)
  }

  function isSuperUser() {
    return authorities && authorities.includes("HolidayAuthority.ADMIN");
  }

  function handleClickRow(item) {

    setValue({
      ...item,
      period:{
        ...item.period,
        days: item.period.days
          .map(it => it.hours),
      }
    });

    setOpen(true)
  }

  function handleChangeUser(user) {
    user && setUserCode(user.code);
  }

  if (!userCode) {
    return null
  }

  return (<div className={classes.root}>

    <Grid container spacing={1}>
      <Grid item xs={12}>
        {isSuperUser() && <UserSelector users={users} onChange={handleChangeUser}/>}
      </Grid>
      <Grid item xs={12}>
        <HolidayList userCode={userCode} refresh={refresh} onClickRow={handleClickRow}/>
      </Grid>
    </Grid>
    <HolidayDialog open={open} userCode={userCode} value={value} onComplete={handleCompleteDialog}/>

    <Fab color="primary" className={classes.fab} onClick={handleClickAdd}>
      <AddIcon/>
    </Fab>

  </div>)
}
