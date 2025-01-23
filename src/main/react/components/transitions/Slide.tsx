import React from "react";
import { Slide } from "@material-ui/core";
import { TransitionProps } from "@material-ui/core/transitions";

export const TransitionSlider = React.forwardRef(
  (
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>
  ) => <Slide direction="right" ref={ref} {...props} />
);
