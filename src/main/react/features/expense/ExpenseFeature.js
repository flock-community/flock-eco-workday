import React, {useState} from "react"

import {makeStyles} from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import {Container} from "@material-ui/core"
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil"
import {ExpenseList} from "./ExpenseList"
import {AddActionFab} from "../../components/FabButtons"
import {PersonSelector} from "../../components/selector"
import {usePerson} from "../../hooks/PersonHook"
import {ExpenseDialog} from "./ExpenseDialog"

const useStyles = makeStyles({
  root: {
    padding: 20,
  },
  fab: {
    position: "absolute",
    bottom: "25px",
    right: "25px",
  },
})

/**
 * @return {null}
 */
export function ExpenseFeature() {
  const classes = useStyles()

  const [reload, setReload] = useState(false)

  const [id, setId] = useState(null)
  const [open, setOpen] = useState(false)

  const [person, setPerson] = usePerson()

  const handleCompleteDialog = () => {
    setReload(!reload)
    setOpen(false)
    setId(null)
  }

  const handleClickAdd = () => {
    setId(null)
    setOpen(true)
  }

  const handleClickRow = item => {
    setId(item.id)
    setOpen(true)
  }

  function handlePersonChange(it) {
    setPerson(it)
  }

  return (
    <Container className={classes.root}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"ExpenseAuthority.ADMIN"}>
          <Grid item xs={12}>
            <PersonSelector
              value={person && person.code}
              onChange={handlePersonChange}
            />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          <ExpenseList
            personCode={person && person.code}
            onClickRow={handleClickRow}
            refresh={reload}
          />
        </Grid>
      </Grid>
      <ExpenseDialog
        id={id}
        open={open}
        personCode={person && person.code}
        onComplete={handleCompleteDialog}
      />
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </Container>
  )
}

ExpenseFeature.propTypes = {}
