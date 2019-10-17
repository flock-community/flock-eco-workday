import React from 'react';
import {storiesOf} from '@storybook/react';
import {PeriodForm} from "../../../main/react/components/PeriodForm";
import moment from "moment";

storiesOf('components/PeriodForm')

  .add('default', () => {
    return (<PeriodForm />)
  })

  .add('value moment', () => {
    return (<PeriodForm value={{from:moment("2019-07-01"), to:moment("2019-07-25")}}/>)
  })

  .add('value string', () => {
    return (<PeriodForm value={{from:"2019-07-01", to:"2019-07-25"}}/>)
  })
