import React, {useContext, useState} from "react"

import {makeStyles} from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import {SickdayDialog} from "./SickdayDialog"
import {SickdayList} from "./SickdayList"
import {PersonSelector} from "../../components/selector"
import {ApplicationContext} from "../../application/ApplicationContext"
import {AddActionFab} from "../../components/FabButtons"
import {usePerson} from "../../hooks/PersonHook"

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
export function SickdayFeature() {
  const classes = useStyles()

  const [person, setPerson] = usePerson()

  const [reload, setReload] = useState(false)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(null)
  const {authorities} = useContext(ApplicationContext)

  function isSuperUser() {
    return authorities && authorities.includes("SickdayAuthority.ADMIN")
  }

  function handleCompleteDialog() {
    setReload(!reload)
    setOpen(false)
    setValue(null)
  }

  function handleClickAdd() {
    setValue(null)
    setOpen(true)
  }

  function handleClickRow(item) {
    setValue(item)
    setOpen(true)
  }

  function handlePersonChange(it) {
    setPerson(it)
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {isSuperUser() && <PersonSelector onChange={handlePersonChange} />}
        </Grid>
        <Grid item xs={12}>
          <SickdayList
            personCode={person && person.code}
            onClickRow={handleClickRow}
            refresh={reload}
          />
        </Grid>
      </Grid>
      <SickdayDialog
        open={open}
        sickdayCode={value && value.code}
        personCode={person && person.code}
        value={value}
        onComplete={handleCompleteDialog}
      />

      <AddActionFab color="primary" onClick={handleClickAdd} />
    </div>
  )
}

SickdayFeature.propTypes = {}
