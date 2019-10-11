import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import {PeriodForm} from "../../components/PeriodForm";
import React, {useEffect, useState} from "react";
import HolidayClient from "../../clients/HolidayClient";
import * as moment from "moment";
import {CLIENT_FORM_ID} from "../client/ClientForm";
import {HOLIDAY_FORM_ID, HolidayForm} from "./HolidayForm";

export function HolidayDialog({value, userCode, open, onComplete}) {


  const handleSubmit = (it) => {
    console.log('---', it)
    if (it.id) {
      HolidayClient.putHoliday(it.id, {
        description: it.description,
        from: it.dates[0].format(moment.HTML5_FMT.DATE),
        to: it.dates[1].format(moment.HTML5_FMT.DATE),
        days: it.days,
      }).then((res) => {
        onComplete && onComplete(res)
      })
    } else {
      HolidayClient.postHoliday({
        description: it.description,
        from: it.dates[0].format(moment.HTML5_FMT.DATE),
        to: it.dates[1].format(moment.HTML5_FMT.DATE),
        days: it.days,
        user: userCode,
      }).then((res) => {
        onComplete && onComplete(res)
      })
    }
  }

  function handleClose(ev) {
    onComplete && onComplete()
  }

  function handleDelete(ev) {
    HolidayClient.deleteHoliday(state.code).then(() => {
      onComplete && onComplete()
    })
  }

  return (<Dialog open={open} onClose={handleClose}>
    <DialogTitle>Holiday form</DialogTitle>
    <DialogContent>
      <HolidayForm code={value && value.code} onSubmit={handleSubmit}/>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Close</Button>
      <Button onClick={handleDelete}>Delete</Button>
      <DialogActions>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          form={HOLIDAY_FORM_ID}>Save</Button>
      </DialogActions>    </DialogActions>
  </Dialog>)

}
