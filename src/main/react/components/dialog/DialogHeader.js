import React from "react"
import PropTypes from "prop-types"
import {makeStyles} from "@material-ui/styles"
import {Typography, Button, DialogTitle} from "@material-ui/core"
import {Close} from "@material-ui/icons"

const useStyles = makeStyles(() => ({
  closeBtn: {
    alignSelf: "start",
    marginLeft: "auto",
    minWidth: "unset", // override material button property
  },
  dialogTitle: {
    alignItems: "center",
    display: "flex",
  },
  iconWrapper: {
    "& > svg": {
      height: 40,
      width: 40,
    },
  },
  titleText: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "1rem",
  },
}))

export function DialogHeader(props) {
  const {icon, headline, subheadline, onClose} = props

  const classes = useStyles()

  return (
    <DialogTitle>
      <div className={classes.dialogTitle}>
        <div className={classes.iconWrapper}>{icon}</div>
        <div className={classes.titleText}>
          <Typography variant="body1">{headline}</Typography>
          <Typography variant="caption">{subheadline}</Typography>
        </div>
        <Button className={classes.closeBtn} onClick={onClose}>
          <Close />
        </Button>
      </div>
    </DialogTitle>
  )
}

DialogHeader.propTypes = {
  icon: PropTypes.any,
  headline: PropTypes.string,
  subheadline: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}
