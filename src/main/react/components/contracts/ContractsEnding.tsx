import Typography from "@material-ui/core/Typography";
import React from "react";
import { Contract } from "../../clients/ContractClient";
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
import { DMY_DATE } from "../../clients/util/DateFormats";

type ContractsEndingProps = {
  withinNWeeks: number;
  contracts: Contract[];
};

export default function ContractsEnding({
  withinNWeeks,
  contracts,
}: ContractsEndingProps) {
  const noContent = (
    <Typography variant="caption">
      No contracts ending within {withinNWeeks} weeks
    </Typography>
  );

  const renderContract = (contract, index) => (
    <TableRow key={index}>
      <TableCell>{contract.person?.fullName ?? "NVT"}</TableCell>
      <TableCell>{contract.from.format(DMY_DATE)}</TableCell>
      <TableCell>{contract.to.format(DMY_DATE)}</TableCell>
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
