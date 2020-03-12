import React, {useState} from "react"
import {makeStyles} from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import {HolidayDialog} from "./HolidayDialog"
import {HolidayList} from "./HolidayList"
import {PersonSelector} from "../../components/selector"
import {AddActionFab} from "../../components/FabButtons"
import {usePerson} from "../../hooks/PersonHook"

const useStyles = makeStyles({
  root: {
    padding: 20,
  },
})

/**
 * @return {null}
 */
export function HolidayFeature() {
  const classes = useStyles()

  const [refresh, setRefresh] = useState(false)
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState(null)
  const [person, setPerson] = usePerson()

  function handleCompleteDialog() {
    setRefresh(!refresh)
    setOpen(false)
    setCode(null)
  }

  function handleClickAdd() {
    setCode("")
    setOpen(true)
  }

  function handleRowClick(it) {
    return () => {
      setCode(it.code)
      setOpen(true)
    }
  }

  function handlePersonChange(it) {
    setPerson(it)
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"HolidayAuthority.ADMIN"}>
          <Grid item xs={12}>
            <PersonSelector
              value={person && person.code}
              onChange={handlePersonChange}
            />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          <HolidayList
            personCode={person && person.code}
            refresh={refresh}
            onRowClick={handleRowClick}
          />
        </Grid>
      </Grid>
      <HolidayDialog
        open={open}
        code={code}
        personCode={person && person.code}
        onComplete={handleCompleteDialog}
      />
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </div>
  )
}
