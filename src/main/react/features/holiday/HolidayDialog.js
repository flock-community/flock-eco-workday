import React, {useState} from "react"
import PropTypes from "prop-types"
import {Dialog, DialogContent} from "@material-ui/core"
import moment, {HTML5_FMT} from "moment"
import HolidayIcon from "@material-ui/icons/WbSunny"
import Typography from "@material-ui/core/Typography"
import {ConfirmDialog} from "@flock-eco/core/src/main/react/components/ConfirmDialog"
import {DialogFooter, DialogHeader} from "../../components/dialog"
import {HolidayClient} from "../../clients/HolidayClient"
import {HOLIDAY_FORM_ID, HolidayForm} from "./HolidayForm"
import {isDefined} from "../../utils/validation"
import {TransitionSlider} from "../../components/transitions/Slide"

export function HolidayDialog({holidayCode, personCode, open, onComplete}) {
  const [openDelete, setOpenDelete] = useState(false)

  const handleSubmit = it => {
    if (it.code) {
      HolidayClient.putHoliday(it.code, {
        description: it.description,
        status: it.status,
        from: it.period.dates[0].format(HTML5_FMT.DATE),
        to: it.period.dates[1].format(HTML5_FMT.DATE),
        days: it.period.days,
        hours: it.period.days.reduce((acc, cur) => acc + parseInt(cur, 10), 0),
      }).then(res => {
        if (isDefined(onComplete)) onComplete(res)
      })
    } else {
      HolidayClient.postHoliday({
        description: it.description,
        from: it.period.dates[0].format(moment.HTML5_FMT.DATE),
        to: it.period.dates[1].format(moment.HTML5_FMT.DATE),
        days: it.period.days,
        hours: it.period.days.reduce((acc, cur) => acc + parseInt(cur, 10), 0),
        personCode,
      }).then(res => {
        if (isDefined(onComplete)) onComplete(res)
      })
    }
  }

  const handleDelete = () => {
    HolidayClient.delete(holidayCode).then(() => {
      if (isDefined(onComplete)) onComplete()
      setOpenDelete(false)
    })
  }

  function handleClose() {
    if (isDefined(onComplete)) onComplete()
  }

  const handleDeleteOpen = () => {
    setOpenDelete(true)
  }
  const handleDeleteClose = () => {
    setOpenDelete(false)
  }

  return (
    <>
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
          <HolidayForm code={holidayCode} onSubmit={handleSubmit} />
        </DialogContent>
        <DialogFooter
          formId={HOLIDAY_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
        />
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      >
        <Typography>Are you sure you want to remove this Holiday.</Typography>
      </ConfirmDialog>
    </>
  )
}

HolidayDialog.propTypes = {
  holidayCode: PropTypes.string,
  personCode: PropTypes.string,
  open: PropTypes.bool,
  onComplete: PropTypes.func,
}
