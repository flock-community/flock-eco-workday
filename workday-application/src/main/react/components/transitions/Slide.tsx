import { Slide } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import React from 'react';

export const TransitionSlider = React.forwardRef(
  (
    props: TransitionProps & {
      children: React.ReactElement<any, any>;
    },
    ref: React.Ref<unknown>,
  ) => <Slide direction="right" ref={ref} {...props} />,
);
