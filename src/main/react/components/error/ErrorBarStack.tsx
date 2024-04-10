import React from "react";
import { ErrorBar } from "./ErrorBar";

export function ErrorStack({ ErrorList }) {
  return <ErrorBar>{ErrorList[ErrorList.length - 1]}</ErrorBar>;
}