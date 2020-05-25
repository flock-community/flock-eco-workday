import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {Dialog, DialogContent, Divider} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import WorkIcon from "@material-ui/icons/Work"
import {HTML5_FMT} from "moment"
import {ConfirmDialog} from "@flock-eco/core/src/main/react/components/ConfirmDialog"
import Typography from "@material-ui/core/Typography"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import {WorkDayClient} from "../../clients/WorkDayClient"
import {TransitionSlider} from "../../components/transitions/Slide"
import {DialogFooter, DialogHeader} from "../../components/dialog"
import {WORKDAY_FORM_ID, WorkDayForm, schema} from "./WorkDayForm"
import {isDefined} from "../../utils/validation"

const useStyles = makeStyles(() => ({
  dialogContent: {
    margin: "auto",
    maxWidth: 768, // should be a decent medium-sized breakpoint
  },
}))

export function WorkDayDialog({open, code, onComplete}) {
  const classes = useStyles()
  const [openDelete, setOpenDelete] = useState(false)

  const [state, setState] = useState(null)

  useEffect(() => {
    if (open) {
      if (code) {
        WorkDayClient.get(code).then(res => {
          setState({
            assignmentCode: res.assignment.code,
            from: res.from,
            to: res.to,
            days: res.days,
            hours: res.hours,
            status: res.status,
            sheets: res.sheets,
          })
        })
      } else {
        setState(schema.cast())
      }
    }
  }, [open, code])

  const handleSubmit = it => {
    const body = {
      from: it.from.format(HTML5_FMT.DATE),
      to: it.to.format(HTML5_FMT.DATE),
      days: it.days ? it.days : null,
      hours: it.days
        ? it.days.reduce((acc, cur) => acc + parseInt(cur, 10), 0)
        : it.hours,
      assignmentCode: it.assignmentCode,
      status: it.status,
      sheets: it.sheets,
    }
    if (code) {
      WorkDayClient.put(code, body).then(res => {
        if (isDefined(onComplete)) onComplete(res)
        setState(null)
      })
    } else {
      WorkDayClient.post(body).then(res => {
        if (isDefined(onComplete)) onComplete(res)
        setState(null)
      })
    }
  }

  const handleDelete = () => {
    WorkDayClient.delete(code).then(() => {
      if (isDefined(onComplete)) onComplete()
      setOpenDelete(false)
    })
  }
  const handleDeleteOpen = () => {
    setOpenDelete(true)
  }
  const handleDeleteClose = () => {
    setOpenDelete(false)
  }
  const handleClose = () => {
    if (isDefined(onComplete)) onComplete()
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
          icon={<WorkIcon />}
          headline="Create Workday"
          subheadline="Add your workday."
          onClose={handleClose}
        />
        <DialogContent className={classes.dialogContent}>
          {state && <WorkDayForm value={state} onSubmit={handleSubmit} />}
        </DialogContent>
        <Divider />
        <DialogFooter
          formId={WORKDAY_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
          disableDelete={
            !UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          disableEdit={
            !UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
        />
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      >
        <Typography>Are you sure you want to remove this workday.</Typography>
      </ConfirmDialog>
    </>
  )
}

WorkDayDialog.propTypes = {
  open: PropTypes.bool,
  code: PropTypes.string,
  onComplete: PropTypes.func,
}
