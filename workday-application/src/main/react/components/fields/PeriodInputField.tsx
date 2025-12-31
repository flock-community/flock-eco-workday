import { Field } from "formik";
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from "react";
import { PeriodInput } from "../inputs/PeriodInput";
import {
  editDay,
  initDays,
  mutatePeriod,
  Period,
} from "../../features/period/Period";
import { ButtonGroup } from "@mui/material";
import Button from "@mui/material/Button";
import dayjs from "dayjs";

const PREFIX = 'PeriodInputField';

const classes = {
  buttons: `${PREFIX}-buttons`
};

const StyledField = styled(Field)({
  [`& .${classes.buttons}`]: {
    marginTop: "10px",
  },
});

type PeriodInputFieldProps = {
  name: string;
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
  reset?: boolean;
};

export function PeriodInputField({
  name,
  from,
  to,
  reset,
}: PeriodInputFieldProps) {


  const render = ({ field: { value }, form: { setFieldValue } }) => {
    const [period, setPeriod] = useState<Period>({
      from: from,
      to: to,
      days: value,
    });

    const update = (period: Period) => {
      setFieldValue(name, period.days);
      setPeriod(period);
    };

    useEffect(() => {
      update(mutatePeriod(period, { from, to }));
    }, [from, to]);

    useEffect(() => {
      reset ? setHoursPerDay(0) : null;
    }, [reset]);

    const setHoursPerDay = (hoursPerDay: number) => {
      update({
        ...period,
        days: initDays(period, true, hoursPerDay),
      });
    };

    const renderButtons = (
      <ButtonGroup className={classes.buttons} size="small" fullWidth>
        <Button variant="outlined" onClick={() => setHoursPerDay(0)}>
          Clear all
        </Button>
        <Button variant="outlined" onClick={() => setHoursPerDay(8)}>
          8 hours per day
        </Button>
        <Button variant="outlined" onClick={() => setHoursPerDay(9)}>
          9 hours per day
        </Button>
      </ButtonGroup>
    );

    return (
      <>
        <PeriodInput
          period={period}
          onChange={(date, day) => {
            update(editDay(period, date, day));
          }}
        />
        {renderButtons}
      </>
    );
  };

  return (
    <StyledField id={name} name={name}>
      {render}
    </StyledField>
  );
}
