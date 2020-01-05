import React from "react"
import PropTypes from "prop-types"
import {Dialog, DialogContent} from "@material-ui/core"
import moment, {HTML5_FMT} from "moment"
import HolidayIcon from "@material-ui/icons/WbSunny"
import {DialogHeader, DialogFooter} from "../../components/dialog"
import HolidayClient from "../../clients/HolidayClient"
import {HOLIDAY_FORM_ID, HolidayForm} from "./HolidayForm"
import {isDefined} from "../../utils/validation"
import {TransitionSlider} from "../../components/transitions/Slide"

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

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={TransitionSlider}
      TransitionProps={{direction: "right"}}
    >
      <DialogHeader
        icon={<HolidayIcon />}
        headline="Holidays"
        subheadline="Have the best time of your life, beside working for flock"
        onClose={handleClose}
      />
      <DialogContent>
        <HolidayForm code={value && value.code} onSubmit={handleSubmit} />
      </DialogContent>
      <DialogFooter formId={HOLIDAY_FORM_ID} onClose={handleClose} />
    </Dialog>
  )
}

HolidayDialog.propTypes = {
  value: PropTypes.string,
  userCode: PropTypes.string,
  open: PropTypes.bool,
  onComplete: PropTypes.func,
}
