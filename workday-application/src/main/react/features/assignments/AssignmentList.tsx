import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import { Box, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  ASSIGNMENT_PAGE_SIZE,
  AssignmentClient,
} from "../../clients/AssignmentClient";
import { isDefined } from "../../utils/validation";
import makeStyles from "@mui/styles/makeStyles";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import { FlockPagination } from "../../components/pagination/FlockPagination";

const useStyles = makeStyles({
  list: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
});

type AssignmentListProps = {
  reload: boolean;
  personId?: string;
  onItemClick: (item: any) => void;
  disableEdit: boolean;
};

export function AssignmentList({
  reload,
  personId,
  onItemClick,
  disableEdit,
}: Readonly<AssignmentListProps>) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  useEffect(() => {
    if (personId) {
      setLoading(true);
      AssignmentClient.findAllByPersonId(personId, page).then((res) => {
        setItems(res.list);
        setCount(res.count);
        setLoading(false);
      });
    } else {
      setItems([]);
    }
  }, [personId, reload, page]);

  const handleClickItem = (it) => () => {
    if (!disableEdit && isDefined(onItemClick)) onItemClick(it);
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No result</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Grid container spacing={1} className={classes.list}>
        {items.map((assignment) => (
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
                <UserAuthorityUtil has={"AssignmentAuthority.ADMIN"}>
                  <Typography>Hourly rate: {assignment.hourlyRate} </Typography>
                </UserAuthorityUtil>
                <Typography>
                  Hours per week: {assignment.hoursPerWeek}{" "}
                </Typography>
                {assignment.project && (
                  <Typography>Project: {assignment.project.name}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={ASSIGNMENT_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}
