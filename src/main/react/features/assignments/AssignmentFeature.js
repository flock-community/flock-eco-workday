import React, {useContext, useEffect, useState} from "react"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import Grid from "@material-ui/core/Grid"
import {makeStyles} from "@material-ui/core"
import Fab from "@material-ui/core/Fab"
import AddIcon from "@material-ui/core/SvgIcon/SvgIcon"
import {UserSelector} from "../../components/UserSelector"
import {AssignmentList} from "./AssignmentList"
import {ApplicationContext} from "../../application/ApplicationContext"

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

  function handleChangeUser(it) {
    if (it) setUserCode(it.code)
  }

  if (!userCode) {
    return null
  }

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
        <UserAuthorityUtil has={"AssignmentAuthority.ADMIN"}>
          <Grid item xs={12}>
            <UserSelector value={userCode} onChange={handleChangeUser} />
          </Grid>
        </UserAuthorityUtil>

        <Grid item xs={12}>
          <AssignmentList userCode={userCode} />
        </Grid>
      </Grid>

      <Fab color="primary" className={classes.fab} onClick={handleClickAdd}>
        <AddIcon />
      </Fab>
      {dialog}
    </div>
  )
}

AssignmentFeature.propTypes = {}
