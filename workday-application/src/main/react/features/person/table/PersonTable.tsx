import { CheckBox } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { type Person, PersonClient } from '../../../clients/PersonClient';
import { PersonDialog } from '../PersonDialog';
import { PersonTableHead } from './PersonTableHead';

const PREFIX = 'PersonTable';

const classes = {
  tblEmail: `${PREFIX}TblEmail`,
  tblName: `${PREFIX}TblName`,
  tblRow: `${PREFIX}TblRow`,
  link: `${PREFIX}Link`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`& .${classes.tblEmail}`]: {
    minWidth: 200,
  },

  [`& .${classes.tblName}`]: {
    minWidth: 170,
  },

  [`& .${classes.tblRow}`]: {
    position: 'relative',
  },

  [`& .${classes.link}`]: {
    color: 'black',
    textDecoration: 'none',
  },
}));

export const PersonTable = () => {
  const { url } = useRouteMatch();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [count, setCount] = useState(-1);
  const [personList, setPersonList] = useState<Person[]>([]);
  const [dialog, setDialog] = useState({ open: false });
  const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => searchInputRef?.current?.focus(), []);

  useEffect(() => {
    PersonClient.findAllByFullName(
      { page, size, sort: 'firstname' },
      searchTerm,
    ).then((res) => {
      setPersonList(res.list);
      setCount(res.count);
    });
  }, [page, size, searchTerm]);

  const handleDialogOpen = () => {
    setDialog({ open: true });
  };

  const handleDialogClose = () => {
    setReload(!reload);
    setDialog({ open: false });
  };

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const rowsPerPage = event.target.value;
    setSize(+rowsPerPage);
    setPage(0);
  };

  return (
    <StyledBox
      className={'flow'}
      flow-gap={'wide'}
      style={{ paddingBottom: '1.5rem' }}
    >
      <Card>
        <CardHeader
          title="Persons"
          action={
            <Button onClick={handleDialogOpen}>
              <AddIcon /> Add
            </Button>
          }
        />
        <CardContent>
          <Box m={2}>
            <TextField
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name"
              inputRef={searchInputRef}
            />
          </Box>
          <TableContainer>
            <Table>
              <PersonTableHead />
              <TableBody>
                {personList.map((person) => {
                  return (
                    <TableRow
                      key={person.fullName}
                      hover
                      className={classes.tblRow}
                    >
                      <TableCell
                        className={classes.tblName}
                        component="th"
                        scope="row"
                      >
                        <Link
                          key={person.uuid}
                          to={`${url}/code/${person.uuid}`}
                          className={classes.link}
                        >
                          {person.fullName}
                        </Link>
                      </TableCell>
                      <TableCell className={classes.tblEmail} align="left">
                        <Typography className={classes.tblRow}>
                          {person.email}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        {person.active && <CheckBox />}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[]}
              component="div"
              count={count}
              // remove labelDisplayRows by replacing it with an empty return
              labelDisplayedRows={() => null}
              rowsPerPage={size}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </TableContainer>
        </CardContent>
      </Card>
      <PersonDialog open={dialog.open} onClose={handleDialogClose} />
    </StyledBox>
  );
};
