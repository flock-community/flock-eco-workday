import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import {HolidayForm} from "./HolidayForm";
import React, {useEffect, useState} from "react";
import HolidayClient from "./HolidayClient";


export function HolidayDialog({value, open, onChange, onComplete}) {

  const [state, setState] = useState(value)

  useEffect(()=> {
    onChange && onChange(state)
  }, [state])

  function handleOnChangeForm(it){
    setState(it)
  }

  function handleClickSave(){
    HolidayClient.postHoliday({
      description: state.description,
      from: state.dates[0],
      to: state.dates[1],
      dayOff:state.dayOff
    }).then((res) => {
      onComplete && onComplete(res)
    })
  }

  return (<Dialog open={open}>
    <DialogTitle>Holiday form</DialogTitle>
    <DialogContent>
      <HolidayForm onChange={handleOnChangeForm}/>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClickSave}>Save</Button>
    </DialogActions>
  </Dialog>)

}
