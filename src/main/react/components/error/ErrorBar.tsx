import React from "react";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";

/**
 * @return {null}
 */
export function ErrorBar({ children }) {
  if (!children) return null;

  return (
    <Snackbar open={children.open}>
      <Alert severity="error">An error has occurred: {children.message}</Alert>
    </Snackbar>
  );
}
