import React from 'react';
import {storiesOf} from '@storybook/react';
import {PeriodForm} from "../../../main/react/components/PeriodForm";
import moment from "moment";

const handleChange = (val) => console.log(val)

storiesOf('components/PeriodForm', module)

  .add('default', () => {
    return (<PeriodForm onChange={handleChange}/>)
  })

  .add('value moment', () => {
    return (<PeriodForm onChange={handleChange} value={{from:moment("2019-07-01"), to:moment("2019-07-25")}}/>)
  })

  .add('value string', () => {
    return (<PeriodForm onChange={handleChange} value={{from:"2019-07-01", to:"2019-07-25"}}/>)
  })

  .add('over year', () => {
    return (<PeriodForm onChange={handleChange} value={{from:"2019-12-20", to:"2020-01-10"}}/>)
  })

  .add('with days', () => {
    return (<PeriodForm onChange={handleChange} value={{from:"2019-07-01", to:"2019-07-25", days:[4,4,4,4,4]}}/>)
  })
