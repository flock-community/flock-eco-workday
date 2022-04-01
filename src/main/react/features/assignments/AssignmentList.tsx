import React, { useEffect, useState } from "react";
import Card from "@material-ui/core/Card";
import { CardContent } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { AssignmentClient } from "../../clients/AssignmentClient";
import { isDefined } from "../../utils/validation";

type AssignmentListProps = {
  reload: boolean;
  personId?: string;
  onItemClick: (item: any) => void;
};

export function AssignmentList({
  reload,
  personId,
  onItemClick,
}: AssignmentListProps) {
  const [list, setList] = useState<any[]>([]);

  useEffect(() => {
    if (personId) {
      AssignmentClient.findAllByPersonId(personId).then((res) => setList(res));
    } else {
      setList([]);
    }
  }, [personId, reload]);

  const handleClickItem = (it) => () => {
    if (isDefined(onItemClick)) onItemClick(it);
  };

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No result</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={1}>
      {list.map((assignment) => (
        <Grid item xs={12} key={`assignment-${assignment.code}`}>
          <Card onClick={handleClickItem(assignment)}>
            <CardContent>
              <Typography variant="h6">
                {assignment.client.name} - {assignment.role}
              </Typography>
              <Typography>
                Period: {assignment.from.format("DD-MM-YYYY")} -{" "}
                {assignment.to ? (
                  assignment.to.format("DD-MM-YYYY")
                ) : (
                  <i>now</i>
                )}
              </Typography>
              <Typography>Hourly rate: {assignment.hourlyRate} </Typography>
              <Typography>
                Hours per week: {assignment.hoursPerWeek}{" "}
              </Typography>
              {assignment.project &&
                <Typography>
                  Project: {assignment.project.name}
                </Typography>
              }
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
