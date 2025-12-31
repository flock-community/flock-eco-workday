import { TableCell } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import type { Assignment } from '../../../clients/AssignmentClient';

export default function ProjectAssignmentListItem({
  assignment,
}: {
  assignment: Assignment;
}) {
  return (
    <TableRow>
      <TableCell>{assignment.person.fullName}</TableCell>
      <TableCell>{assignment.role}</TableCell>
      <TableCell>{assignment.hoursPerWeek}</TableCell>
      <TableCell>{assignment.hourlyRate}</TableCell>
      <TableCell>{assignment.from.format('DD-MM-YYYY')}</TableCell>
      <TableCell>{assignment.to?.format('DD-MM-YYYY')}</TableCell>
      <TableCell>{assignment.totalHours}</TableCell>
      <TableCell>{assignment.totalCosts}</TableCell>
    </TableRow>
  );
}
