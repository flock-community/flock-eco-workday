import React from "react";

import {Dialog, DialogTitle, makeStyles} from "@material-ui/core";
import {Field, Form} from 'formik';
import * as Yup from 'yup';
import {TextField,} from 'formik-material-ui';
import DialogContent from "@material-ui/core/DialogContent";
import {CLIENT_FORM_ID, ClientForm} from "./ClientForm";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";

const useStyles = makeStyles({});

export function ClientDialog({open, code, onClose}) {

  const classes = useStyles();

  const handleSubmit = (value) => {
    console.log(value)
    onClose && onClose()
  }

  return (<Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
    <DialogTitle>Client form</DialogTitle>
    <DialogContent>
      <ClientForm code={code} onSubmit={handleSubmit}/>
    </DialogContent>
    <DialogActions>
      <Button
        variant="contained"
        color="primary"
        type="submit"
        form={CLIENT_FORM_ID}>Save</Button>
    </DialogActions>
  </Dialog>)
}
