import React, {useContext, useEffect, useState} from "react"
import {makeStyles} from "@material-ui/core/styles"
import Grid from "@material-ui/core/Grid"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import {HolidayDialog} from "./HolidayDialog"
import {HolidayList} from "./HolidayList"
import {UserSelector} from "../../components/selector"
import HolidayClient from "../../clients/HolidayClient"
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
  const [value, setValue] = useState(null)
  const [userCode, setUserCode] = useState(null)
  const {authorities, user} = useContext(ApplicationContext)

  useEffect(() => {
    user && setUserCode(user.code)
  }, [authorities, user])

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
    setValue({
      ...item,
      period: {
        ...item.period,
        days: item.period.days.map(it => it.hours),
      },
    })

    setOpen(true)
  }

  function handleUserChangeByCode(code) {
    setUserCode(code)
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
            userCode={userCode}
            refresh={refresh}
            onClickRow={handleClickRow}
          />
        </Grid>
      </Grid>
      <HolidayDialog
        open={open}
        userCode={userCode}
        value={value}
        onComplete={handleCompleteDialog}
      />

      <AddActionFab color="primary" onClick={handleClickAdd} />
    </div>
  )
}
