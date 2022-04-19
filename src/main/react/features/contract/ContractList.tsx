import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import { Box, CardContent } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {
  CONTRACT_PAGE_SIZE,
  ContractClient,
} from "../../clients/ContractClient";
import { ContractType } from "./ContractType";
import { Pagination } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";

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

type ContractListProps = {
  reload: boolean;
  personId?: string;
  onItemClick: (item: any) => void;
};
export function ContractList({
  reload,
  personId,
  onItemClick,
}: ContractListProps) {
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
      ContractClient.findAllByPersonId(personId, page).then((res) => {
        setItems(res.list);
        setPageCount(Math.ceil(res.count / CONTRACT_PAGE_SIZE));
        setLoading(false);
      });
    }
  }, [personId, reload, page]);

  const handleClickItem = (it) => () => {
    if (onItemClick) onItemClick(it);
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
        {items.map((it) => (
          <Grid item xs={12} key={it.code}>
            <Card onClick={handleClickItem(it)}>
              <CardContent>
                <Typography>{it.type}</Typography>
                <Typography>
                  Period: <FormatDate date={it.from} /> -{" "}
                  <FormatDate date={it.to} />
                </Typography>
                {it.type === ContractType.EXTERNAL && (
                  <Typography>Hourly rate: {it.hourlyRate} </Typography>
                )}
                {it.type === ContractType.INTERNAL && (
                  <Typography>Monthly salary: {it.monthlySalary} </Typography>
                )}
                {it.type === ContractType.MANAGEMENT && (
                  <Typography>Monthly fee: {it.monthlyFee} </Typography>
                )}
                {it.type === ContractType.SERVICE && (
                  <Typography>Monthly cost: {it.monthlyCost} </Typography>
                )}
                {[ContractType.EXTERNAL, ContractType.INTERNAL].includes(
                  it.type
                ) && (
                  <Typography>Hours per week: {it.hoursPerWeek} </Typography>
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

function FormatDate({ date }) {
  return date ? <>{date.format("DD-MM-YYYY")}</> : <i>now</i>;
}

FormatDate.propTypes = {
  date: PropTypes.object,
};
