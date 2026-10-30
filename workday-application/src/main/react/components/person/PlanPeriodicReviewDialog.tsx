import EventIcon from '@mui/icons-material/CalendarToday';
import { Dialog, Divider } from '@mui/material';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import dayjs, { type Dayjs } from 'dayjs';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import * as Yup from 'yup';
import { EventClient, EventType } from '../../clients/EventClient';
import type { PeriodicReviewDue } from '../../clients/PeriodicReviewClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { addError } from '../../hooks/ErrorHook';
import { DatePickerField } from '../fields/DatePickerField';

const PLAN_PERIODIC_REVIEW_FORM_ID = 'plan-periodic-review-form';

const schema = Yup.object().shape({
  date: Yup.mixed<Dayjs>().required('Date is required'),
});

type PlanPeriodicReviewDialogProps = {
  item?: PeriodicReviewDue;
  onClose: () => void;
  onPlanned: () => void;
};

export function PlanPeriodicReviewDialog({
  item,
  onClose,
  onPlanned,
}: PlanPeriodicReviewDialogProps) {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = ({ date }: { date: Dayjs }) => {
    if (!item) return;
    const day = date.format(ISO_8601_DATE);
    setProcessing(true);
    // A review is one date without hours or costs; the server names it after the person.
    EventClient.post({
      description: null,
      from: day,
      to: day,
      hours: 0,
      days: [0],
      costs: 0,
      personIds: [item.personUuid],
      participants: [],
      type: EventType.PERIODIC_REVIEW,
    })
      .then(() => onPlanned())
      .catch((e) => addError(e))
      .finally(() => setProcessing(false));
  };

  // Suggest the due date, or today when the review is overdue or there never was one.
  const suggested = item?.dueDate?.isAfter(dayjs(), 'day')
    ? item.dueDate
    : dayjs();

  return (
    <Dialog open={item !== undefined} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogHeader
        icon={<EventIcon />}
        headline="Plan periodic review"
        subheadline={item?.personName}
        onClose={onClose}
      />
      <DialogBody>
        {item && (
          <Formik
            initialValues={{ date: suggested.startOf('day') }}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            <Form id={PLAN_PERIODIC_REVIEW_FORM_ID}>
              <DatePickerField name="date" label="Date" />
            </Form>
          </Formik>
        )}
      </DialogBody>
      <Divider />
      <DialogFooter
        formId={PLAN_PERIODIC_REVIEW_FORM_ID}
        onClose={onClose}
        processing={processing}
      />
    </Dialog>
  );
}
