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
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { type Person, PersonClient } from '../../../clients/PersonClient';
import { FlockPagination } from '../../../components/pagination/FlockPagination';
import { TableCard } from '../../../components/TableCard';
import { PersonDialog } from '../PersonDialog';
import { PersonTableHead } from './PersonTableHead';

const PREFIX = 'PersonTable';

const PERSON_PAGE_SIZE = 10;

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
    color: theme.palette.text.primary,
    textDecoration: 'none',
  },
}));

export const PersonTable = () => {
  const { url } = useRouteMatch();
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [personList, setPersonList] = useState<Person[]>([]);
  const [dialog, setDialog] = useState({ open: false });
  const [refresh, setRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchState, setDebouncedSearchState] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Add this useEffect for debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchState(searchTerm);
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => searchInputRef?.current?.focus(), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    setLoading(true);
    PersonClient.findAllByFullName(
      { page, size: PERSON_PAGE_SIZE, sort: 'firstname' },
      debouncedSearchState,
    ).then((res) => {
      setPersonList(res.list);
      setCount(res.count);
      setLoading(false);
    });
  }, [refresh, page, debouncedSearchState]);

  const handleDialogOpen = () => {
    setDialog({ open: true });
  };

  const handleDialogClose = () => {
    setRefresh(!refresh);
    setDialog({ open: false });
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
            <Button onClick={handleDialogOpen} startIcon={<AddIcon />}>
              Add
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
          <TableCard loading={loading}>
            <TableContainer>
              <Table size="small">
                <PersonTableHead />
                <TableBody>
                  {personList.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{ py: 4, color: 'text.secondary' }}
                      >
                        No persons
                      </TableCell>
                    </TableRow>
                  ) : (
                    personList.map((person) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TableCard>
          <FlockPagination
            currentPage={page + 1}
            numberOfItems={count}
            itemsPerPage={PERSON_PAGE_SIZE}
            changePageCb={setPage}
          />
        </CardContent>
      </Card>
      <PersonDialog open={dialog.open} onClose={handleDialogClose} />
    </StyledBox>
  );
};
