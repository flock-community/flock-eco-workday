import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Button, Dialog, DialogContent, Divider} from "@material-ui/core"
import * as moment from "moment"
import {PeriodForm} from "../../components/PeriodForm"
import SickdayClient from "./SickdayClient"
import {isDefined} from "../../utils/validation"
import {TransitionSlider} from "../../components/transitions/Slide"
import {makeStyles} from "@material-ui/styles"
import {DialogHeader, DialogFooter} from "../../components/dialog"
import HealingIcon from "@material-ui/icons/Healing"

const useStyles = makeStyles(() => ({}))

export function SickdayDialog(props) {
  const {value, userCode, open, onChange, onComplete} = props
  const [state, setState] = useState(value)

  const classes = useStyles()

  useEffect(() => {
    if (isDefined(onChange)) onChange(state)
  }, [state])

  function handleChangeForm(it) {
    setState({
      ...value,
      ...it,
    })
  }

  function handleClickSave() {
    if (state.id) {
      SickdayClient.putSickday(state.id, {
        description: state.description,
        from: state.dates[0].format(moment.HTML5_FMT.DATE),
        to: state.dates[1].format(moment.HTML5_FMT.DATE),
        days: state.days,
        type: state.type,
      }).then(res => {
        if (isDefined(onComplete)) onComplete(res)
      })
    } else {
      SickdayClient.postSickday({
        description: state.description,
        from: state.dates[0].format(moment.HTML5_FMT.DATE),
        to: state.dates[1].format(moment.HTML5_FMT.DATE),
        days: state.days,
        type: state.type,
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
    SickdayClient.deleteSickday(state.id).then(() => {
      if (isDefined(onComplete)) onComplete()
    })
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
      <DialogContent>
        <PeriodForm value={value} onChange={handleChangeForm} />
      </DialogContent>
      <Divider />
      <DialogFooter
        submitButton={
          <Button type="submit" form="" color="primary">
            Save
          </Button>
        }
        onClose={handleClose}
      />
    </Dialog>
  )
}

SickdayDialog.propTypes = {
  value: PropTypes.any,
  userCode: PropTypes.any,
  open: PropTypes.any,
  onChange: PropTypes.any,
  onComplete: PropTypes.any,
}
