import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core"
import React from "react"
import moment, {HTML5_FMT} from "moment"
import HolidayClient from "../../clients/HolidayClient"
import {HOLIDAY_FORM_ID, HolidayForm} from "./HolidayForm"

export function HolidayDialog({value, userCode, open, onComplete}) {
  const handleSubmit = it => {
    if (it.id) {
      HolidayClient.putHoliday(it.code, {
        description: it.description,
        status: it.status,
        from: it.period.dates[0].format(HTML5_FMT.DATE),
        to: it.period.dates[1].format(HTML5_FMT.DATE),
        days: it.period.days,
      }).then(res => {
        onComplete && onComplete(res)
      })
    } else {
      console.log(it)
      HolidayClient.postHoliday({
        description: it.description,
        from: it.period.dates[0].format(moment.HTML5_FMT.DATE),
        to: it.period.dates[1].format(moment.HTML5_FMT.DATE),
        days: it.period.days,
        userCode,
      }).then(res => {
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

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Holiday form</DialogTitle>
      <DialogContent>
        <HolidayForm code={value && value.code} onSubmit={handleSubmit} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={handleDelete}>Delete</Button>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            form={HOLIDAY_FORM_ID}
          >
            Save
          </Button>
        </DialogActions>{" "}
      </DialogActions>
    </Dialog>
  )
}
