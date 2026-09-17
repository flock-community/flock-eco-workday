import AddIcon from '@mui/icons-material/Add';
import { Box, Button, TableCell, TableRow, Typography } from '@mui/material';
import { DataTable } from '@workday-core/components/DataTable';
import { useEffect, useState } from 'react';
import {
  LAPTOP_PAGE_SIZE,
  type Laptop,
  LaptopClient,
} from '../../clients/LaptopClient';
import { DMY_DATE } from '../../clients/util/DateFormats';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { TableCard } from '../../components/TableCard';
import { LaptopContractChip } from './LaptopContractChip';

type LaptopListProps = {
  refresh?: boolean;
  onItemClick?: (item: Laptop) => void;
  onClickAdd?: () => void;
};

export function LaptopList({
  refresh,
  onItemClick,
  onClickAdd,
}: LaptopListProps) {
  const [list, setList] = useState<Laptop[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    setLoading(true);
    LaptopClient.findAllByPage({
      page,
      size: LAPTOP_PAGE_SIZE,
      sort: 'name,asc',
    }).then((res) => {
      setList(res.list);
      setCount(res.count);
      setLoading(false);
    });
  }, [refresh, page]);

  const handleItem = (it: Laptop) => () => onItemClick?.(it);

  return (
    <Box>
      <TableCard
        title="Laptops"
        action={
          <Button startIcon={<AddIcon />} onClick={onClickAdd}>
            Add
          </Button>
        }
        loading={loading}
      >
        <DataTable
          columns={[
            { header: 'Name' },
            { header: 'Serial number' },
            { header: 'Purchased' },
            { header: 'Person' },
            { header: 'Contract' },
          ]}
          items={list}
          renderRow={(it) => (
            <TableRow
              key={`laptops-${it.code}`}
              hover
              sx={{ cursor: 'pointer' }}
              onClick={handleItem(it)}
            >
              <TableCell>{it.name}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace' }}>
                {it.serialNumber}
              </TableCell>
              <TableCell>
                {it.purchaseDate ? (
                  it.purchaseDate.format(DMY_DATE)
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Unknown
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {it.person ? (
                  it.person.fullName
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Unassigned
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <LaptopContractChip signed={it.contractSigned} />
              </TableCell>
            </TableRow>
          )}
          emptyMessage="No laptops"
        />
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={LAPTOP_PAGE_SIZE}
        changePageCb={setPage}
      />
    </Box>
  );
}
