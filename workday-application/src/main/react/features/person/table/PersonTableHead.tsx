import { TableCell, TableHead, TableRow } from '@mui/material';

const headCells = [
  {
    id: 'name',
    disablePadding: false,
    label: 'Name',
  },
  {
    id: 'email',
    disablePadding: false,
    label: 'Email',
  },
  {
    id: 'active',
    disablePadding: false,
    label: 'Active',
  },
];

export const PersonTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((cell) => (
          <TableCell
            key={cell.id}
            padding={cell.disablePadding ? 'none' : 'normal'}
          >
            {cell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
