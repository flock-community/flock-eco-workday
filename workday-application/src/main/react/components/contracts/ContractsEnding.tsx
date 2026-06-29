import {
  Card,
  CardContent,
  CardHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from '@mui/material';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import type { Contract } from '../../clients/ContractClient';
import { DMY_DATE } from '../../clients/util/DateFormats';

type ContractsEndingProps = {
  withinNWeeks: number;
  contracts?: Contract[];
};

export default function ContractsEnding({
  withinNWeeks,
  contracts,
}: ContractsEndingProps) {
  const noContent = (
    <Typography color="text.secondary">
      No contracts ending within {withinNWeeks} weeks
    </Typography>
  );

  const renderContract = (contract, index) => (
    <TableRow key={index}>
      <TableCell>{contract.person?.fullName ?? 'NVT'}</TableCell>
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
        <TableBody>{contracts?.map(renderContract)}</TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: '14px' }}>
      <CardHeader title={`Contracts ending within ${withinNWeeks} weeks`} />
      <CardContent>
        {contracts === undefined ? (
          <AlignedLoader />
        ) : contracts.length > 0 ? (
          table
        ) : (
          noContent
        )}
      </CardContent>
    </Card>
  );
}
