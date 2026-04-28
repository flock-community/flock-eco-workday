import { ButtonGroup } from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import type dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { Field, type FieldProps } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import {
  editDay,
  initDays,
  mutatePeriod,
  type Period,
} from '../../features/period/Period';
import type { DayMeta } from '../../hooks/DayMetaHook';
import { PeriodInput } from '../inputs/PeriodInput';

const PREFIX = 'PeriodInputField';

const classes = {
  buttons: `${PREFIX}Buttons`,
};

const StyledField = styled(Field)({
  [`& .${classes.buttons}`]: {
    marginTop: '10px',
  },
});

type PeriodInputFieldProps = {
  name: string;
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
  reset?: boolean;
  dayMeta?: Map<string, DayMeta>;
};

function PeriodInputRenderer({
  name,
  from,
  to,
  reset,
  value,
  setFieldValue,
  dayMeta,
}: Readonly<PeriodInputRendererProps>) {
  const [period, setPeriod] = useState<Period>({
    from,
    to,
    days: value,
  });
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    update(mutatePeriod(period, { from, to }));
  }, [from, to]);

  useEffect(() => {
    if (reset) {
      setHoursPerDay(0);
    }
  }, [reset]);

  const update = useCallback(
    (newPeriod: Period) => {
      setFieldValue(name, newPeriod.days);
      setPeriod(newPeriod);
    },
    [name],
  );

  const setHoursPerDay = useCallback(
    (hoursPerDay: number) => {
      update({
        ...period,
        days: initDays(period, true, hoursPerDay),
      });
    },
    [period, update],
  );

  const handlePeriodChange = useCallback(
    (day: Dayjs, hours: number) => {
      update(editDay(period, day, hours));
    },
    [period, update],
  );

  return (
    <>
      <PeriodInput
        period={period}
        onChange={handlePeriodChange}
        dayMeta={dayMeta}
      />
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
    </>
  );
}

type PeriodInputRendererProps = {
  name: string;
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
  reset?: boolean;
  value: any;
  setFieldValue: (field: string, value: unknown) => void;
  dayMeta?: Map<string, DayMeta>;
};

export function PeriodInputField({
  name,
  from,
  to,
  reset,
  dayMeta,
}: Readonly<PeriodInputFieldProps>) {
  return (
    <StyledField id={name} name={name}>
      {({ field: { value }, form: { setFieldValue } }: FieldProps) => (
        <PeriodInputRenderer
          name={name}
          from={from}
          to={to}
          reset={reset}
          value={value}
          setFieldValue={setFieldValue}
          dayMeta={dayMeta}
        />
      )}
    </StyledField>
  );
}
