import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import {HolidayForm} from "./HolidayForm";
import React, {useEffect, useState} from "react";
import HolidayClient from "./HolidayClient";
import * as moment from "moment";


export function HolidayDialog({value, userCode, open, onChange, onComplete}) {

  const [state, setState] = useState(value)

  useEffect(() => {
    onChange && onChange(state)
  }, [state])

  function handleChangeForm(it) {
    setState({
      ...value,
      ...it
    })
  }

  function handleClickSave() {
    if (state.id) {
      HolidayClient.putHoliday(state.id, {
        description: state.description,
        from: state.dates[0].format(moment.HTML5_FMT.DATE),
        to: state.dates[1].format(moment.HTML5_FMT.DATE),
        dayOff: state.dayOff,
      }).then((res) => {
        onComplete && onComplete(res)
      })
    } else {
      HolidayClient.postHoliday({
        description: state.description,
        from: state.dates[0].format(moment.HTML5_FMT.DATE),
        to: state.dates[1].format(moment.HTML5_FMT.DATE),
        dayOff: state.dayOff,
        userCode,
      }).then((res) => {
        onComplete && onComplete(res)
      })
    }
  }

  function handleClose(ev) {
    onComplete && onComplete()
  }

  function handleDelete(ev) {
    HolidayClient.deleteHoliday(state.id).then(() => {
      onComplete && onComplete()
    })
  }

  return (<Dialog open={open} onClose={handleClose}>
    <DialogTitle>Holiday form</DialogTitle>
    <DialogContent>
      <HolidayForm value={value} onChange={handleChangeForm}/>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Close</Button>
      <Button onClick={handleDelete}>Delete</Button>
      <Button onClick={handleClickSave} variant="contained" color="primary">Save</Button>
    </DialogActions>
  </Dialog>)

}
