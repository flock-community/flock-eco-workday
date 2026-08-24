import {
  Table,
  TableBody,
  TableCell,
  type TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export type DataTableColumn = {
  header?: ReactNode;
  align?: TableCellProps['align'];
};

type DataTableProps<T> = {
  columns: readonly DataTableColumn[];
  items: readonly T[];
  renderRow: (item: T, index: number) => ReactNode;
  emptyMessage: ReactNode;
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
  'aria-label'?: string;
};

export function DataTable<T>({
  columns,
  items,
  renderRow,
  emptyMessage,
  size = 'small',
  sx,
  'aria-label': ariaLabel,
}: DataTableProps<T>) {
  return (
    <TableContainer>
      <Table size={size} sx={sx} aria-label={ariaLabel}>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: columns are static configuration and never reorder
              <TableCell key={`column-${index}`} align={column.align}>
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                align="center"
                sx={{ py: 4, color: 'text.secondary' }}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            items.map(renderRow)
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
