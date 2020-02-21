import React from "react"
import PropTypes from "prop-types"
import {Dialog, DialogContent, Divider} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import HealingIcon from "@material-ui/icons/Healing"
import moment, {HTML5_FMT} from "moment"
import {SickdayClient} from "../../clients/SickdayClient"
import {TransitionSlider} from "../../components/transitions/Slide"
import {DialogFooter, DialogHeader} from "../../components/dialog"
import {SICKDAY_FORM_ID, SickdayForm} from "./SickdayForm"
import {isDefined} from "../../utils/validation"

const useStyles = makeStyles(() => ({
  dialogContent: {
    margin: "auto",
    maxWidth: 768, // should be a decent medium-sized breakpoint
  },
}))

export function SickdayDialog({open, personCode, onComplete}) {
  const classes = useStyles()

  const handleSubmit = it => {
    console.log(it)
    if (it.code) {
      SickdayClient.put(it.code, {
        from: it.period.dates[0].format(HTML5_FMT.DATE),
        to: it.period.dates[1].format(HTML5_FMT.DATE),
        days: it.period.days,
      }).then(res => {
        if (isDefined(onComplete)) onComplete(res)
      })
    } else {
      SickdayClient.post({
        from: it.period.dates[0].format(moment.HTML5_FMT.DATE),
        to: it.period.dates[1].format(moment.HTML5_FMT.DATE),
        days: it.period.days,
        personCode,
      }).then(res => {
        if (isDefined(onComplete)) onComplete(res)
      })
    }
  }

  const handleClose = () => {
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
        icon={<HealingIcon />}
        headline="Create Sickday"
        subheadline="Add your sickdays. Hope you feel better soon."
        onClose={handleClose}
      />
      <DialogContent className={classes.dialogContent}>
        <SickdayForm onSubmit={handleSubmit} />
      </DialogContent>
      <Divider />
      <DialogFooter formId={SICKDAY_FORM_ID} onClose={handleClose} />
    </Dialog>
  )
}

SickdayDialog.propTypes = {
  open: PropTypes.bool,
  personCode: PropTypes.string,
  onComplete: PropTypes.func,
}
