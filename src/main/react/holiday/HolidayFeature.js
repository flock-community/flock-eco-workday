import React, {useEffect, useState} from 'react'

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import {HolidayDialog} from "./HolidayDialog";
import {HolidayList} from "./HolidayList";
import {makeStyles} from "@material-ui/core/styles";
import {HolidayUserSelector} from "./HolidayUserSelector";
import HolidayClient from "./HolidayClient";

const useStyles = makeStyles({
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
    HolidayClient.getUsers()
        .then(res => {
          if(res.status === 200) {
            setUsers(res)
          } else {
            setUsers([])
          }
        })
  }, []);

  function handleCompleteDialog(){
    setRefresh(!refresh)
    setOpen(false)
  }

  function handleClickAdd(){
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
    })
    setOpen(true)
  }

  function handleUserChange(user) {
    setUserId(user.id);
  }

  return (<>
    <HolidayUserSelector users={users} onUserChange={handleUserChange} />

    <HolidayList userId={userId} refresh={refresh} onClickRow={handleClickRow}/>

    <HolidayDialog open={open} value={value} onComplete={handleCompleteDialog}/>

    <Fab color="primary" className={classes.fab} onClick={handleClickAdd}>
      <AddIcon/>
    </Fab>

  </>)
}
