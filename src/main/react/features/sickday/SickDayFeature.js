import React, {useContext, useState} from "react"

import {makeStyles} from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import {Container} from "@material-ui/core"
import {SickDayDialog} from "./SickDayDialog"
import {SickDayList} from "./SickDayList"
import {PersonSelector} from "../../components/selector"
import {ApplicationContext} from "../../application/ApplicationContext"
import {AddActionFab} from "../../components/FabButtons"
import {usePerson} from "../../hooks/PersonHook"
import {SickDayClient} from "../../clients/SickDayClient"

const useStyles = makeStyles({
  root: {
    padding: 20,
  },
})

/**
 * @return {null}
 */
export function SickDayFeature() {
  const classes = useStyles()

  const [person, setPerson] = usePerson()

  const [refresh, setRefresh] = useState(false)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(null)
  const {authorities} = useContext(ApplicationContext)

  function isSuperUser() {
    return authorities && authorities.includes("SickdayAuthority.ADMIN")
  }

  function handleCompleteDialog() {
    setRefresh(!refresh)
    setOpen(false)
    setValue(null)
  }

  function handleClickAdd() {
    setValue(null)
    setOpen(true)
  }

  function handleClickRow(item) {
    return () => {
      setValue(item)
      setOpen(true)
    }
  }

  function handlePersonChange(it) {
    setPerson(it)
  }

  function handleStatusChange(status, it) {
    SickDayClient.put(it.code, {
      ...it,
      status,
      from: it.from.format("YYYY-MM-DD"),
      to: it.to.format("YYYY-MM-DD"),
    }).then(setRefresh(!refresh))
    // TODO: error handling!
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
          <SickDayList
            personCode={person && person.code}
            onClickRow={handleClickRow}
            refresh={refresh}
            onClickStatus={handleStatusChange}
          />
        </Grid>
      </Grid>
      <SickDayDialog
        open={open}
        code={value && value.code}
        personCode={person && person.code}
        value={value}
        onComplete={handleCompleteDialog}
      />

      <AddActionFab color="primary" onClick={handleClickAdd} />
    </Container>
  )
}

SickDayFeature.propTypes = {}
