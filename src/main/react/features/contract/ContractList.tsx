import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import { CardContent } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { ContractClient } from "../../clients/ContractClient";
import { isDefined } from "../../utils/validation";
import { ContractType } from "./ContractType";

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
  const [state, setState] = useState<any[]>([]);

  useEffect(() => {
    if (personId) {
      ContractClient.findAllByPersonId(personId).then((res) => setState(res));
    }
  }, [personId, reload]);

  const handleClickItem = (it) => () => {
    if (onItemClick) onItemClick(it);
  };

  if (state.length === 0) {
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
      {state.map((it) => (
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
              ) && <Typography>Hours per week: {it.hoursPerWeek} </Typography>}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function FormatDate({ date }) {
  return date ? <>{date.format("DD-MM-YYYY")}</> : <i>now</i>;
}

FormatDate.propTypes = {
  date: PropTypes.object,
};
