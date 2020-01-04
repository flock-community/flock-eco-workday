import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import Card from "@material-ui/core/Card"
import {CardContent, makeStyles} from "@material-ui/core"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import {AssignmentClient} from "../../clients/AssignmentClient"
import {isDefined} from "../../utils/validation"

const useStyles = makeStyles({
  root: {
    padding: 10,
  },
  fab: {
    position: "absolute",
    bottom: "25px",
    right: "25px",
  },
})

export function AssignmentList({reload, userCode, onItemClick}) {
  // TODO: fix the use of classes and remove eslint-disable comment
  const classes = useStyles() // eslint-disable-line no-unused-vars

  const [list, setList] = useState([])

  useEffect(() => {
    AssignmentClient.findAllByUserCode(userCode).then(res => setList(res))
  }, [userCode, reload])

  const handleClickItem = it => () => {
    if (isDefined(onItemClick)) onItemClick(it)
  }

  return (
    <Grid container spacing={1}>
      {list.map(it => (
        <Grid item xs={12} key={`assignment-${it.code}`}>
          <Card onClick={handleClickItem(it)}>
            <CardContent>
              <Typography variant="h6">{it.client.name}</Typography>
              <Typography>
                Period: {it.startDate.format("DD-MM-YYYY")} -{" "}
                {it.endDate.format("DD-MM-YYYY")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

AssignmentList.propTypes = {
  reload: PropTypes.bool,
  userCode: PropTypes.string,
  onItemClick: PropTypes.func,
}
