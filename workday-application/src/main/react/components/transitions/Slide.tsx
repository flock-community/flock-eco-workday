import React from "react";
import { Slide } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

export const TransitionSlider = React.forwardRef(
  (
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>
  ) => <Slide direction="right" ref={ref} {...props} />
);
