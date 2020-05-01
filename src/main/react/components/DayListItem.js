import React from "react"
import PropTypes from "prop-types"
import {Card, CardContent, makeStyles, Typography} from "@material-ui/core"
import Button from "@material-ui/core/Button"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
  },
  status: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}))

export function DayListItem({value, onClick, onClickStatus}) {
  const classes = useStyles()

  const [anchorEl, setAnchorEl] = React.useState(null)

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
    <Card onClick={onClick}>
      <CardContent className={classes.root}>
        <Typography variant="h6">
          {value.description ? value.description : "empty"}
        </Typography>
        <Typography>
          Period: {value.from.format("DD-MM-YYYY")} - {value.to.format("DD-MM-YYYY")}
        </Typography>
        <Typography>Aantal dagen: {value.to.diff(value.from, "days") + 1}</Typography>
        <Typography>Aantal uren: {value.hours}</Typography>
        <div className={classes.status}>
          <Button
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleMenuClick}
          >
            {value.status}
          </Button>
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
        </div>
      </CardContent>
    </Card>
  )
}

DayListItem.propTypes = {
  value: PropTypes.object,
  onClick: PropTypes.func,
  onClickStatus: PropTypes.func,
}
