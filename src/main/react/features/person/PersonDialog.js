import React from "react"
import PropTypes from "prop-types"
import {Dialog, Divider, DialogContent} from "@material-ui/core"
import {PersonAdd} from "@material-ui/icons"
import {makeStyles} from "@material-ui/styles"
import {PersonForm, PERSON_FORM_ID} from "./PersonForm"
import {PersonService} from "./PersonService"
import {usePerson} from "./context/PersonContext"
import {isEmptyObject} from "../../utils/validation"
import {TransitionSlider} from "../../components/transitions/Slide"
import {DialogHeader, DialogFooter} from "../../components/dialog"

const useStyles = makeStyles(() => ({
  dialogContent: {
    margin: "auto",
    maxWidth: 700, // should be a decent medium-sized breakpoint
  },
}))

/** PersonDialog
 *
 * @param {*} props
 */
export const PersonDialog = props => {
  const {open, onClose} = props
  const classes = useStyles()
  const [person, setPerson] = usePerson()

  const successfulSubmit = () => {
    setPerson(person) // update Person
    // set dialogSubmit param to true @PersonTable onClose handler
    // so the PersonTable reloads
    onClose(true)
  }

  const handleSubmit = values => {
    if (isEmptyObject(person)) {
      PersonService.post(values)
        .then(() => successfulSubmit())
        .catch(err => console.log(err))
    } else {
      PersonService.put(person.code, values)
        .then(() => successfulSubmit())
        .catch(err => console.log(err))
    }
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={TransitionSlider}
      TransitionProps={{direction: "right"}}
    >
      <DialogHeader
        icon={<PersonAdd className={classes.personAddIcon} />}
        headline="Create Person"
        subheadline="Fill out the form to create a person"
        onClose={onClose}
      />
      <DialogContent className={classes.dialogContent}>
        <PersonForm item={person} onSubmit={handleSubmit} />
      </DialogContent>
      <Divider />
      <DialogFooter formId={PERSON_FORM_ID} onClose={onClose} />
    </Dialog>
  )
}

PersonDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
}
