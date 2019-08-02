import React, {useEffect, useState} from 'react'

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import {HolidayDialog} from "./HolidayDialog";
import {HolidayList} from "./HolidayList";
import {makeStyles} from "@material-ui/core/styles";
import {HolidayUserSelector} from "./HolidayUserSelector";
import HolidayClient from "./HolidayClient";

const useStyles = makeStyles({
  root:{
    padding: 20
  },
  fab: {
    position: 'absolute',
    bottom: "25px",
    right: "25px"
  }
});

export function HolidayFeature() {

  const classes = useStyles();

  const [refresh, setRefresh] = useState(false)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(null)
  const [userId, setUserId] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    HolidayClient.getAllUsers()
        .then(users => {
          setUsers(users)
        })
  },[]);

  function handleCompleteDialog(){
    setRefresh(!refresh)
    setOpen(false)
    setValue(null)
  }

  function handleClickAdd(){
    setValue(null)
    setOpen(true)
  }

  function handleClickRow(item){

    const dayOff = Object
      .keys(item.dayOff)
      .map(key => (item.dayOff[key]))
      .map(it => it.hours)

    setValue({
      ...item,
      dayOff
    });

    setOpen(true)
  }

  function handleChangeUser(user) {
    user && setUserId(user.id);
  }

  return (<div className={classes.root}>

    <HolidayUserSelector users={users} onChange={handleChangeUser} />

    <HolidayList userId={userId} refresh={refresh} onClickRow={handleClickRow}/>

    <HolidayDialog open={open} value={value} onComplete={handleCompleteDialog}/>

    <Fab color="primary" className={classes.fab} onClick={handleClickAdd}>
      <AddIcon/>
    </Fab>

  </div>)
}
