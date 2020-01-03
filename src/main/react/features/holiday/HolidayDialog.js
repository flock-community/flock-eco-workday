import React from "react"
import PropTypes from "prop-types"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core"
import moment, {HTML5_FMT} from "moment"
import HolidayClient from "../../clients/HolidayClient"
import {HOLIDAY_FORM_ID, HolidayForm} from "./HolidayForm"
import {isDefined} from "../../utils/validation"

export function HolidayDialog(props) {
  const {value, userCode, open, onComplete} = props

  const handleSubmit = it => {
    if (it.id) {
      HolidayClient.putHoliday(it.code, {
        description: it.description,
        status: it.status,
        from: it.period.dates[0].format(HTML5_FMT.DATE),
        to: it.period.dates[1].format(HTML5_FMT.DATE),
        days: it.period.days,
      }).then(res => {
        if (isDefined(onComplete)) onComplete(res)
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
        if (isDefined(onComplete)) onComplete(res)
      })
    }
  }

  function handleClose() {
    if (isDefined(onComplete)) onComplete()
  }

  function handleDelete() {
    HolidayClient.deleteHoliday(value.code).then(() => {
      if (isDefined(onComplete)) onComplete()
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

HolidayDialog.propTypes = {
  value: PropTypes.string,
  userCode: PropTypes.string,
  open: PropTypes.bool,
  onComplete: PropTypes.func,
}
