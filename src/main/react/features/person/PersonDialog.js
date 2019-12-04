import PropTypes from "prop-types"
import clsx from "clsx"
import {
  Dialog,
  Button,
  DialogTitle,
  DialogContent,
  Typography,
  DialogActions,
  Divider,
} from "@material-ui/core"
import {PersonAdd, Close} from "@material-ui/icons"
import {makeStyles} from "@material-ui/styles"
import {PersonForm, PERSON_FORM_ID} from "./PersonForm"
import {PersonService} from "./PersonService"
import {usePerson} from "./context/PersonContext"
import {isEmptyObject} from "../../utils/validation"

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
  },
  flexDirectionRowReverse: {
    flexDirection: "row-reverse",
  },
  justifyContentEnd: {
    justifyContent: "end",
  },
  dialogTitle: {
    alignItems: "center",
    display: "flex",
  },
  personAddIcon: {
    height: 40,
    width: 40,
  },
  closeBtn: {
    alignSelf: "start",
    marginLeft: "auto",
    minWidth: "unset", // override material button property
  },
  titleText: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "1rem",
  },
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
    onClose()
  }

  const handleSubmit = (values, actions) => {
    if (isEmptyObject(person)) {
      PersonService.post(values)
        .then(() => successfulSubmit())
        .catch(err => console.log(err))
    } else {
      PersonService.put(values)
        .then(() => successfulSubmit())
        .catch(err => console.log(err))
    }
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        <div className={classes.dialogTitle}>
          <PersonAdd className={classes.personAddIcon} />
          <div className={classes.titleText}>
            <Typography variant="body1">Create Person</Typography>
            <Typography variant="caption">
              Fill out the form to create a person
            </Typography>
          </div>
          <Button className={classes.closeBtn} onClick={onClose}>
            <Close />
          </Button>
        </div>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <PersonForm item={person} onSubmit={handleSubmit} />
      </DialogContent>
      <Divider />
      {/* reverse the DialogActions with `flex-direction: row-reverse` to enable
       * navigating via tab to the save button first, but position the save button last
       */}
      <DialogActions
        className={clsx(
          classes.flex,
          classes.flexDirectionRowReverse,
          classes.justifyContentEnd
        )}
      >
        <Button type="submit" form={PERSON_FORM_ID} color="primary">
          Save
        </Button>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

PersonDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
}
