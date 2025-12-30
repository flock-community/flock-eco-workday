import React from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

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
