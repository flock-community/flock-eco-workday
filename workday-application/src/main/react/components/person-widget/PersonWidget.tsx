import CreateIcon from '@mui/icons-material/Create';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import type { Person } from '../../clients/PersonClient';
import { DMY_DATE } from '../../clients/util/DateFormats';

type PersonWidgetProps = {
  person: Person;
  handleEditDialog: any;
  handleDelDialog: any;
};
export function PersonWidget({
  person,
  handleEditDialog,
  handleDelDialog,
}: PersonWidgetProps) {
  return (
    <Card>
      <CardHeader
        title={person.fullName}
        action={
          <>
            <IconButton onClick={handleEditDialog} size="large">
              <CreateIcon />
            </IconButton>
            <IconButton onClick={handleDelDialog} size="large">
              <DeleteRoundedIcon />
            </IconButton>
          </>
        }
      />
      <CardContent>
        <TableContainer>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell component="th">First name</TableCell>
                <TableCell>{person.firstname}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Last name</TableCell>
                <TableCell>{person.lastname}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Email address</TableCell>
                <TableCell>{person.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Date of birth</TableCell>
                <TableCell>
                  {person.birthdate?.format(DMY_DATE) ?? 'Unknown'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Join date</TableCell>
                <TableCell>
                  {person.joinDate?.format(DMY_DATE) ?? 'Unknown'}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Active</TableCell>
                <TableCell>{person.active ? 'Yes' : 'No'}</TableCell>
              </TableRow>
              {person.active ? null : (
                <TableRow>
                  <TableCell component="th">Last active at</TableCell>
                  <TableCell>{person.lastActiveAt.toLocaleString()}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell component="th">Reminders</TableCell>
                <TableCell>{person.reminders ? 'Yes' : 'No'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Receive system emails</TableCell>
                <TableCell>{person.receiveEmail ? 'Yes' : 'No'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Shoe size</TableCell>
                <TableCell>{person.shoeSize ?? 'Unknown'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th">Shirt size</TableCell>
                <TableCell>{person.shirtSize ?? 'Unknown'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
