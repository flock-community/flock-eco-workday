import React, {useState} from "react"
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil"
import Grid from "@material-ui/core/Grid"
import {makeStyles} from "@material-ui/core"
import {PersonSelector} from "../../components/selector"
import {AssignmentList} from "./AssignmentList"
import {AddActionFab} from "../../components/FabButtons"
import {AssignmentDialog} from "./AssignmentDialog"
import {usePerson} from "../../hooks/PersonHook"

const useStyles = makeStyles({
  root: {
    padding: 20,
  },
})

/**
 * @return {null}
 */
export function AssignmentFeature() {
  const classes = useStyles()

  const [reload, setReload] = useState(true)
  const [dialog, setDialog] = useState({open: false, code: null})
  const [person, setPerson] = usePerson()

  function handleClickAdd() {
    setDialog({open: true, code: null})
  }

  function handleClose() {
    setDialog({open: false, code: null})
    setReload(!reload)
  }

  function handleChangePerson(it) {
    if (it) setPerson(it)
  }

  function handleItemClick(it) {
    setDialog({open: true, code: it.code})
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"AssignmentAuthority.ADMIN"}>
          <Grid item xs={12}>
            <PersonSelector
              value={person && person.code}
              onChange={handleChangePerson}
            />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          <AssignmentList
            personCode={person && person.code}
            onItemClick={handleItemClick}
            reload={reload}
          />
        </Grid>
      </Grid>
      <AssignmentDialog code={dialog.code} open={dialog.open} onClose={handleClose} />
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </div>
  )
}

AssignmentFeature.propTypes = {}
