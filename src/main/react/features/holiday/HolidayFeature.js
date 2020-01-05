import React, {useContext, useEffect, useState} from "react"
import {makeStyles} from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import {HolidayDialog} from "./HolidayDialog"
import {HolidayList} from "./HolidayList"
import {UserSelector} from "../../components/selector"
import {ApplicationContext} from "../../application/ApplicationContext"
import {AddActionFab} from "../../components/FabButtons"

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
  const [holidayCode, setHolidayCode] = useState("")
  const [personCode, setPersonCode] = useState("")
  const {authorities, user} = useContext(ApplicationContext)

  useEffect(() => {}, [authorities, user])

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

  function handleUserChangeByCode(code) {
    setPersonCode(code)
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"HolidayAuthority.ADMIN"}>
          <Grid item xs={12}>
            <UserSelector selectedItem={user} onChange={handleUserChangeByCode} />
          </Grid>
        </UserAuthorityUtil>
        <Grid item xs={12}>
          <HolidayList
            personCode={personCode}
            refresh={refresh}
            onSelectItem={handleSelectedItem}
          />
        </Grid>
      </Grid>
      <HolidayDialog
        open={open}
        personCode={personCode}
        hoidayCode={holidayCode}
        onComplete={handleCompleteDialog}
      />

      <AddActionFab color="primary" onClick={handleClickAdd} />
    </div>
  )
}
