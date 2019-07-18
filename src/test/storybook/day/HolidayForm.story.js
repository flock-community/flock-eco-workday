import React from 'react';
import {storiesOf} from '@storybook/react';
import HolidayForm from "../../../main/react/holiday/HolidayForm";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import {DialogActions, DialogContent} from "@material-ui/core";
import Button from "@material-ui/core/Button";

const handleChange = (value) => (console.log(value))

storiesOf('day/HolidayForm')

  .add('default', () => {
    return (<HolidayForm value={{}} onChange={handleChange}/>)
  })

  .add('prefil', () => {
    const from = new Date('2019-01-01T00:00:00');
    const to = new Date('2019-01-09T00:00:00');
    const dayOff = [8,8,8,8,8,8,8,8,8]
    return (<HolidayForm value={{from, to, dayOff}} onChange={handleChange}/>)
  })

  .add('dialog', () => {
    return (
      <Dialog open={true}>
        <DialogTitle id="simple-dialog-title">Holiday</DialogTitle>
        <DialogContent>
          <HolidayForm value={{}} onChange={handleChange}/>
        </DialogContent>
        <DialogActions>
          <Button>Save</Button>
        </DialogActions>
      </Dialog>
    )
  })

