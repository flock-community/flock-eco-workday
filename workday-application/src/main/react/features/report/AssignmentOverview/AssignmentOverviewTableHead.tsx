import { TableCell, TableHead, TableRow } from '@mui/material';

const headcells = [
  {
    id: 'person',
    label: 'person'.toUpperCase(),
  },
  {
    id: 'client',
    label: 'client'.toUpperCase(),
  },
  {
    id: 'from',
    label: 'from'.toUpperCase(),
  },
  {
    id: 'to',
    label: 'to'.toUpperCase(),
  },
];

export const AssignmentOverviewTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        {headcells.map((cell) => (
          <TableCell key={cell.id}>{cell.label}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
