import React, { useEffect, useState } from "react";
import Card from "@material-ui/core/Card";
import { Box, CardContent } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { ASSIGNMENT_PAGE_SIZE, AssignmentClient, } from "../../clients/AssignmentClient";
import { isDefined } from "../../utils/validation";
import { Pagination } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";

const useStyles = makeStyles({
  list: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
  pagination: {
    "& .MuiPagination-ul": {
      justifyContent: "right",
    },
  },
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
  disableEdit
}: AssignmentListProps) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(-1);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  const handleChangePage = (event: object, paginationComponentPage: number) =>
    // Client page is 0-based, pagination component is 1-based
    setPage(paginationComponentPage - 1);

  useEffect(() => {
    if (personId) {
      setLoading(true);
      AssignmentClient.findAllByPersonId(personId, page).then((res) => {
        setItems(res.list);
        setPageCount(Math.ceil(res.count / ASSIGNMENT_PAGE_SIZE));
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
        <Pagination
          className={classes.pagination}
          count={pageCount}
          // Client page is 0-based, pagination component is 1-based
          page={page + 1}
          onChange={handleChangePage}
          shape="rounded"
          size="small"
        />
      </Box>
    </>
  );
}
