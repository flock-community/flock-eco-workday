import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import { CardContent } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { ContractClient } from "../../clients/ContractClient";
import { isDefined } from "../../utils/validation";
import { ContractType } from "./ContractType";

export function ContractList({ reload, personCode, onItemClick }) {
  const [state, setState] = useState<any[]>([]);

  useEffect(() => {
    ContractClient.findAllByPersonCode(personCode).then(res => setState(res));
  }, [personCode, reload]);

  const handleClickItem = it => () => {
    if (isDefined(onItemClick)) onItemClick(it);
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
      {state.map(it => (
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

ContractList.propTypes = {
  reload: PropTypes.bool,
  personCode: PropTypes.string,
  onItemClick: PropTypes.func
};

function FormatDate({ date }) {
  return date ? <>{date.format("DD-MM-YYYY")}</> : <i>now</i>;
}

FormatDate.propTypes = {
  date: PropTypes.object
};
