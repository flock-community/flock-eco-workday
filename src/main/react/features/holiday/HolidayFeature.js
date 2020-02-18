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
  const [holidayCode, setHolidayCode] = useState(null)
  const [person, setPerson] = usePerson()

  function handleCompleteDialog() {
    setRefresh(!refresh)
    setOpen(false)
    setHolidayCode("")
  }

  function handleClickAdd() {
    setHolidayCode("")
    setOpen(true)
  }

  function handleSelectedItem(code) {
    setHolidayCode(code)
    setOpen(true)
  }

  function handlePersonChange(it) {
    setPerson(it)
  }

  if (!person) {
    return null
  }
  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"HolidayAuthority.ADMIN"}>
          <Grid item xs={12}>
            <PersonSelector selectedItem={person.code} onChange={handlePersonChange} />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          <HolidayList
            personCode={person.code}
            refresh={refresh}
            onSelectItem={handleSelectedItem}
          />
        </Grid>
      </Grid>
      <HolidayDialog
        open={open}
        personCode={person.code}
        holidayCode={holidayCode}
        onComplete={handleCompleteDialog}
      />

      <AddActionFab color="primary" onClick={handleClickAdd} />
    </div>
  )
}
