import React from "react"
import {storiesOf} from "@storybook/react"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import {DialogActions, DialogContent} from "@material-ui/core"
import Button from "@material-ui/core/Button"
import {HolidayForm} from "../../../main/react/features/holiday/HolidayForm"

const handleChange = value => console.log(value)

storiesOf("day/HolidayForm", module)
  .add("default", () => {
    return <HolidayForm onChange={handleChange} />
  })

  .add("dialog", () => {
    return (
      <Dialog open={true}>
        <DialogTitle id="simple-dialog-title">Holiday</DialogTitle>
        <DialogContent>
          <HolidayForm onChange={handleChange} />
        </DialogContent>
        <DialogActions>
          <Button>Save</Button>
        </DialogActions>
      </Dialog>
    )
  })
