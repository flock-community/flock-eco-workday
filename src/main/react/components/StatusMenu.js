import Button from "@material-ui/core/Button"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import {makeStyles} from "@material-ui/core"
import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import clsx from "clsx"

const useStyles = makeStyles(theme => ({
  status: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
  buttonDefault: {
    backgroundColor: "unset",
  },
  buttonRequested: {
    backgroundColor: "unset",
  },
  buttonApproved: {
    backgroundColor: theme.palette.success[500],
  },
  buttonRejected: {
    backgroundColor: theme.palette.error[500],
  },
}))

export function StatusMenu({onClickStatus, hasAuthority, value}) {
  const classes = useStyles()

  const [anchorEl, setAnchorEl] = useState(null)
  const [color, setColor] = React.useState("default")

  useEffect(() => {
    setColor(value.status)
  }, [value])

  const handleMenuClick = event => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = event => {
    event.stopPropagation()
    onClickStatus(event.currentTarget.dataset.value)
    handleClose()
  }

  return (
    <div className={classes.status}>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        disabled={!UserAuthorityUtil.hasAuthority(hasAuthority)}
        onClick={handleMenuClick}
        className={clsx({
          [classes.buttonDefault]: color === "default",
          [classes.buttonRequested]: color === "REQUESTED",
          [classes.buttonApproved]: color === "APPROVED",
          [classes.buttonRejected]: color === "REJECTED",
        })}
      >
        {value.status}
      </Button>
      <UserAuthorityUtil has={hasAuthority}>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleMenuItemClick} data-value={"REQUESTED"}>
            REQUESTED
          </MenuItem>
          <MenuItem onClick={handleMenuItemClick} data-value={"APPROVED"}>
            APPROVE
          </MenuItem>
          <MenuItem onClick={handleMenuItemClick} data-value={"REJECTED"}>
            REJECT
          </MenuItem>
        </Menu>
      </UserAuthorityUtil>
    </div>
  )
}

StatusMenu.propTypes = {
  onClickStatus: PropTypes.func,
  hasAuthority: PropTypes.string,
  value: PropTypes.object,
}
