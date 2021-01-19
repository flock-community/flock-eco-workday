import React from "react";
import PropTypes from "prop-types";
import { ErrorBar } from "./ErrorBar";

export function ErrorStack({ ErrorList }) {
  return <ErrorBar>{ErrorList[ErrorList.length - 1]}</ErrorBar>;
}

ErrorBar.prototypes = {
  ErrorList: PropTypes.array,
};
