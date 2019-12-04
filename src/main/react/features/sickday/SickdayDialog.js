import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core"
import * as moment from "moment"
import {PeriodForm} from "../../components/PeriodForm"
import SickdayClient from "./SickdayClient"
import {isDefined} from "../../utils/validation"

export function SickdayDialog(props) {
  const {value, userCode, open, onChange, onComplete} = props
  const [state, setState] = useState(value)

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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Sickday form</DialogTitle>
      <DialogContent>
        <PeriodForm value={value} onChange={handleChangeForm} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button onClick={handleDelete}>Delete</Button>
        <Button onClick={handleClickSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
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
