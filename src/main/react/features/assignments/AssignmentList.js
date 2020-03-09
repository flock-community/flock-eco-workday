import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import Card from "@material-ui/core/Card"
import {CardContent} from "@material-ui/core"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import {AssignmentClient} from "../../clients/AssignmentClient"
import {isDefined} from "../../utils/validation"

export function AssignmentList({reload, personCode, onItemClick}) {
  const [list, setList] = useState([])

  useEffect(() => {
    AssignmentClient.findAllByPersonCode(personCode).then(res => setList(res))
  }, [personCode, reload])

  const handleClickItem = it => () => {
    if (isDefined(onItemClick)) onItemClick(it)
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No result</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={1}>
      {list.map(assignment => (
        <Grid item xs={12} key={`assignment-${assignment.code}`}>
          <Card onClick={handleClickItem(assignment)}>
            <CardContent>
              <Typography variant="h6">
                {assignment.client.name} - {assignment.role}
              </Typography>
              <Typography>
                Period: {assignment.from.format("DD-MM-YYYY")} -{" "}
                {assignment.to ? assignment.to.format("DD-MM-YYYY") : <i>now</i>}
              </Typography>
              <Typography>Hourly rate: {assignment.hourlyRate} </Typography>
              <Typography>Hours per week: {assignment.hoursPerWeek} </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

AssignmentList.propTypes = {
  reload: PropTypes.bool,
  personCode: PropTypes.string,
  onItemClick: PropTypes.func,
}
