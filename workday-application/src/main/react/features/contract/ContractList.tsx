import React, { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import Card from "@mui/material/Card";
import { Box, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  CONTRACT_PAGE_SIZE,
  ContractClient,
} from "../../clients/ContractClient";
import { ContractType } from "./ContractType";
import { FlockPagination } from "../../components/pagination/FlockPagination";

const PREFIX = 'ContractList';

const classes = {
  list: `${PREFIX}-list`
};

const Root = styled('i')({
  [`& .${classes.list}`]: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
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
}: Readonly<ContractListProps>) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    if (personId) {
      setLoading(true);
      ContractClient.findAllByPersonId(personId, page).then((res) => {
        setItems(res.list);
        setCount(res.count);
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
          <Grid size={{ xs: 12 }} key={it.code}>
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
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={CONTRACT_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
}

function FormatDate({ date }) {
  return date ? <>{date.format("DD-MM-YYYY")}</> : <Root>now</Root>;
}
