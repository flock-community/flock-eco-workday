import Typography from "@material-ui/core/Typography";
import React, { useEffect, useState } from "react";
import { ContractClient } from "../../clients/ContractClient";
import moment from "moment";
import {
  Card,
  CardContent,
  CardHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";

type ContractsEndingProps = {
  withinNWeeks: number;
};

export default function ContractsEnding({
  withinNWeeks,
}: ContractsEndingProps) {
  const [contracts, setContracts] = useState<any[]>([]);

  useEffect(() => {
    ContractClient.findAllByToBetween(
      new Date(),
      moment().add(withinNWeeks, "weeks").toDate()
    ).then((res) => setContracts(res));
  }, [withinNWeeks]);

  const noContent = (
    <Typography variant="caption">
      No contracts ending within {withinNWeeks} weeks
    </Typography>
  );

  const renderContract = (contract, index) => (
    <TableRow key={index}>
      <TableCell>{contract.person.fullName}</TableCell>
      <TableCell>{contract.from.format("DD-MM-YYYY")}</TableCell>
      <TableCell>{contract.to.format("DD-MM-YYYY")}</TableCell>
      <TableCell>{contract.type}</TableCell>
    </TableRow>
  );

  const table = (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>From</TableCell>
            <TableCell>To</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{contracts.map(renderContract)}</TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Card>
      <CardHeader title={`Contracts ending within ${withinNWeeks} weeks`} />
      <CardContent>{contracts.length > 0 ? table : noContent}</CardContent>
    </Card>
  );
}
