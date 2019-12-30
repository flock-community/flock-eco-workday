import React, {useContext, useEffect, useState} from "react"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import Grid from "@material-ui/core/Grid"
import {makeStyles} from "@material-ui/core"
import {UserSelector} from "../../components/selector/UserSelector"
import {AssignmentList} from "./AssignmentList"
import {ApplicationContext} from "../../application/ApplicationContext"
import {ClientDialog} from "../client/ClientDialog"
import {AddActionFab} from "../../components/FabButtons"

const useStyles = makeStyles({
  root: {
    padding: 20,
  },
})

export function AssignmentFeature() {
  const classes = useStyles()

  const [userCode, setUserCode] = useState(null)
  const [dialog, setDialog] = useState({open: false, code: null})

  const {authorities, user} = useContext(ApplicationContext)

  useEffect(() => {
    if (user) setUserCode(user.code)
  }, [authorities, user])

  function handleClickAdd() {
    setDialog({open: true, code: null})
  }

  function handleClose() {
    setDialog({open: false, code: null})
  }

  function handleChangeUser(it) {
    if (it) setUserCode(it.code)
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"AssignmentAuthority.ADMIN"}>
          <Grid item xs={12}>
            <UserSelector onChange={handleChangeUser} />
          </Grid>
        </UserAuthorityUtil>

        <Grid item xs={12}>
          <AssignmentList userCode={userCode} />
        </Grid>
      </Grid>

      <ClientDialog code={dialog.code} open={dialog.open} onClose={handleClose} />
      <AddActionFab color="primary" onClick={handleClickAdd} />
    </div>
  )
}

AssignmentFeature.propTypes = {}
