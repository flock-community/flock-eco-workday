import { Field } from "formik";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { PeriodInput } from "../inputs/PeriodInput";
import { editDay, mutatePeriod, Period } from "../../features/period/Period";
import moment from "moment";

type PeriodInputFieldProps = {
  name: string;
  from: moment.Moment;
  to: moment.Moment;
};

export function PeriodInputField({ name, from, to }: PeriodInputFieldProps) {

  const render = ({ field: { value }, form: { setFieldValue } }) => {
    const [period, setPeriod] = useState<Period>({
      from: from.clone(),
      to: to.clone(),
      days: value,
    });
    const update = (period: Period) => {
      setFieldValue(name, period.days);
      setPeriod(period);
    };
    useEffect(() => {
      update(mutatePeriod(period, { from, to }));
    }, [from, to]);
    return (
      <PeriodInput
        value={period}
        onChange={(date, day) => {
          update(editDay(period, date, day));
        }}
      />
    );
  };

  return (
    <Field id={name} name={name}>
      {render}
    </Field>
  );
}
