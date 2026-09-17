import {
  Card,
  CardContent,
  CardHeader,
  TableCell,
  TableRow,
  Typography,
} from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { DataTable } from '@workday-core/components/DataTable';
import type { Laptop } from '../../clients/LaptopClient';
import { LaptopContractChip } from '../../features/laptop/LaptopContractChip';

type LaptopsCardProps = {
  /** The laptops handed out to the current person; undefined while they load. */
  items?: Laptop[];
};

/**
 * The laptops a person has, with the serial number of the device and whether
 * the laptop contract for it is signed, so people can check their own gear
 * without needing the (admin) laptop overview.
 */
export function LaptopsCard({ items }: LaptopsCardProps) {
  return (
    <Card
      variant={'outlined'}
      data-testid={'laptops-card'}
      sx={{ borderRadius: '14px' }}
    >
      <CardHeader title={'Laptops'} />
      <CardContent>{renderContent(items)}</CardContent>
    </Card>
  );
}

function renderContent(items?: Laptop[]) {
  if (items === undefined) {
    return <AlignedLoader height={80} />;
  }
  if (items.length === 0) {
    return (
      <Typography data-testid={'laptops-empty'}>
        No laptop assigned to you.
      </Typography>
    );
  }
  return (
    <DataTable
      aria-label="My laptops"
      columns={[
        { header: 'Laptop' },
        { header: 'Serial number' },
        { header: 'Contract' },
      ]}
      items={items}
      renderRow={(it) => (
        <TableRow key={it.code} data-testid={'table-row-laptop'}>
          <TableCell>{it.name}</TableCell>
          <TableCell sx={{ fontFamily: 'monospace' }}>
            {it.serialNumber}
          </TableCell>
          <TableCell>
            <LaptopContractChip signed={it.contractSigned} />
          </TableCell>
        </TableRow>
      )}
      emptyMessage="No laptop assigned to you."
    />
  );
}
