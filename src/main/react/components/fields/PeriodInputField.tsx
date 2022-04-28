import { Field } from "formik";
import React, { useEffect, useState } from "react";
import { PeriodInput } from "../inputs/PeriodInput";
import {
  editDay,
  initDays,
  mutatePeriod,
  Period,
} from "../../features/period/Period";
import { ButtonGroup, makeStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import dayjs from "dayjs";

type PeriodInputFieldProps = {
  name: string;
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
};

const useStyles = makeStyles({
  buttons: {
    marginTop: "10px",
  },
});

export function PeriodInputField({ name, from, to }: PeriodInputFieldProps) {
  const classes = useStyles();

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
    <Field id={name} name={name}>
      {render}
    </Field>
  );
}
