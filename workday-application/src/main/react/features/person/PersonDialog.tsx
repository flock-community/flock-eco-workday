import PersonAdd from '@mui/icons-material/PersonAdd';
import { Dialog, Divider } from '@mui/material';
import { DialogFooter, DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import type { Dayjs } from 'dayjs';
import { PersonClient, type PersonRequest } from '../../clients/PersonClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { TransitionSlider } from '../../components/transitions/Slide';
import { PERSON_FORM_ID, PersonForm } from './PersonForm';

type PersonDialogProps = {
  open: boolean;
  onClose: () => void;
  item?: any;
};
export const PersonDialog = ({ open, onClose, item }: PersonDialogProps) => {
  const successfulSubmit = () => {
    onClose();
  };

  type PersonRequestRaw = PersonRequest & {
    birthdate: Dayjs;
    joinDate: Dayjs;
  };

  const handleSubmit = (values: PersonRequestRaw) => {
    const body = {
      ...values,
      birthdate: values.birthdate?.format(ISO_8601_DATE),
      joinDate: values.joinDate?.format(ISO_8601_DATE),
    };

    if (item) {
      PersonClient.put(item.uuid, body).then(() => successfulSubmit());
    } else {
      PersonClient.post(body).then(() => successfulSubmit());
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={TransitionSlider}
      maxWidth="lg"
      fullWidth
    >
      <DialogHeader
        icon={<PersonAdd />}
        headline="Create Person"
        subheadline="Fill out the form to create a person"
        onClose={onClose}
      />
      <DialogBody>
        <PersonForm item={item} onSubmit={handleSubmit} />
      </DialogBody>
      <Divider />
      <DialogFooter formId={PERSON_FORM_ID} onClose={onClose} />
    </Dialog>
  );
};
