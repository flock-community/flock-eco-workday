import React, {useContext, useState} from "react"

import {makeStyles} from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import {Container} from "@material-ui/core"
import {WorkDayDialog} from "./WorkDayDialog"
import {WorkDayList} from "./WorkDayList"
import {PersonSelector} from "../../components/selector"
import {ApplicationContext} from "../../application/ApplicationContext"
import {AddActionFab} from "../../components/FabButtons"
import {usePerson} from "../../hooks/PersonHook"
import {WorkDayClient} from "../../clients/WorkDayClient"

const useStyles = makeStyles({
  root: {
    marginTop: 20,
  },
})

/**
 * @return {null}
 */
export function WorkDayFeature() {
  const classes = useStyles()

  const [person, setPerson] = usePerson()

  const [refresh, setRefresh] = useState(false)
  const [open, setOpen] = useState(false)
  const [state, setState] = useState(null)
  const {authorities} = useContext(ApplicationContext)

  function isSuperUser() {
    return authorities && authorities.includes("SickdayAuthority.ADMIN")
  }

  function handleCompleteDialog() {
    setRefresh(!refresh)
    setOpen(false)
    setState(null)
  }

  function handleClickAdd() {
    setState(null)
    setOpen(true)
  }

  function handleClickRow(item) {
    return () => {
      setState(item)
      setOpen(true)
    }
  }

  function handlePersonChange(it) {
    setPerson(it)
  }

  function handleStatusChange(status, it) {
    WorkDayClient.put(it.code, {
      ...it,
      from: it.from.format("YYYY-MM-DD"),
      to: it.to.format("YYYY-MM-DD"),
      status,
      assignmentCode: it.assignment.code,
    })
      .then(setRefresh(!refresh))
      .catch(err => console.log(err))
  }

  return (
    <Container className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {isSuperUser() && (
            <PersonSelector
              value={person && person.code}
              onChange={handlePersonChange}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <WorkDayList
            personCode={person && person.code}
            onClickRow={handleClickRow}
            refresh={refresh}
            onClickStatus={handleStatusChange}
          />
        </Grid>
      </Grid>
      <WorkDayDialog
        open={open}
        code={state && state.code}
        value={state}
        onComplete={handleCompleteDialog}
      />
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </Container>
  )
}

WorkDayFeature.propTypes = {}
