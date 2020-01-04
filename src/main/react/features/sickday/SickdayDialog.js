import React, {useState} from "react"
import PropTypes from "prop-types"
import {Dialog, DialogContent, Divider} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import HealingIcon from "@material-ui/icons/Healing"
import {PeriodForm} from "../../components/PeriodForm"
import {SickdayClient} from "./SickdayClient"
import {TransitionSlider} from "../../components/transitions/Slide"
import {DialogHeader, DialogFooter} from "../../components/dialog"

const useStyles = makeStyles(() => ({
  dialogContent: {
    margin: "auto",
    maxWidth: 768, // should be a decent medium-sized breakpoint
  },
}))

export const SICKDAY_FORM_ID = "sickday-form"

export function SickdayDialog(props) {
  const {value, personCode, open, onClose} = props
  const [state, setState] = useState(value)

  const classes = useStyles()

  function handleChangePeriod(it) {
    setState({...it, ...value})
  }

  function handleSubmit() {
    if (state.code) {
      SickdayClient.put(state.code, [state, personCode])
        .then(() => onClose())
        .catch(err => console.log(err))
    } else {
      SickdayClient.post([state, personCode])
        .then(() => onClose())
        .catch(err => console.log(err))
    }
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={TransitionSlider}
      TransitionProps={{direction: "right"}}
    >
      <DialogHeader
        icon={<HealingIcon />}
        headline="Create Sickday"
        subheadline="Add your sickdays. Hope you feel better soon."
        onClose={onClose}
      />
      <DialogContent className={classes.dialogContent}>
        <form id={SICKDAY_FORM_ID} noValidate onSubmit={handleSubmit}>
          <PeriodForm value={value} onChange={handleChangePeriod} />
        </form>
      </DialogContent>
      <Divider />
      <DialogFooter formId={SICKDAY_FORM_ID} onClose={onClose} />
    </Dialog>
  )
}

SickdayDialog.propTypes = {
  value: PropTypes.any,
  personCode: PropTypes.any,
  open: PropTypes.any,
  onClose: PropTypes.func,
}
