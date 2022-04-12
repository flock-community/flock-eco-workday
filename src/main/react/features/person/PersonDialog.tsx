import React from "react";
import { Dialog, DialogContent, Divider } from "@material-ui/core";
import PersonAdd from "@material-ui/icons/PersonAdd";
import { PERSON_FORM_ID, PersonForm } from "./PersonForm";
import { PersonClient, PersonRequest } from "../../clients/PersonClient";
import { TransitionSlider } from "../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../components/dialog";

type PersonDialogProps = {
  open: boolean;
  onClose: () => void;
  item: any;
};
export const PersonDialog = ({ open, onClose, item }: PersonDialogProps) => {
  const successfulSubmit = () => {
    onClose();
  };

  const handleSubmit = (values: PersonRequest) => {
    if (item) {
      PersonClient.put(item.uuid, values).then(() => successfulSubmit());
    } else {
      PersonClient.post(values).then(() => successfulSubmit());
    }
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={TransitionSlider}
      TransitionProps={{ direction: "right" }}
    >
      <DialogHeader
        icon={<PersonAdd />}
        headline="Create Person"
        subheadline="Fill out the form to create a person"
        onClose={onClose}
      />
      <DialogContent>
        <PersonForm item={item} onSubmit={handleSubmit} />
      </DialogContent>
      <Divider />
      <DialogFooter formId={PERSON_FORM_ID} onClose={onClose} />
    </Dialog>
  );
};
