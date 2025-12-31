import { TableBody, TableContainer, TablePagination } from '@mui/material';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { type Contract, ContractClient } from '../../../clients/ContractClient';
import { DMY_DATE } from '../../../clients/util/DateFormats';
import { ContractOverviewTableHead } from './ContractOverviewTableHead';

export default function ContractReportTable() {
  const { url } = useRouteMatch();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(-1);
  const [rowCount, setRowCount] = useState(-1);
  const [contractList, setContractList] = useState<Contract[]>([]);
  const [_reload, _setReload] = useState(false);
  const [_searchTerm, _setSearchTerm] = useState<string>('');
  const _searchInputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  useEffect(() => {
    ContractClient.findAllByToAfterOrToNull(dayjs().toDate(), {
      page: page,
      size: size,
      sort: ['person.firstname', 'from'],
    }).then((res) => {
      setContractList(res.list);
      setRowCount(res.count);
    });
  }, [page, size]);

  const handleClick = (contract: Contract) => {
    history.push(`${url}/code/${contract.code}`);
  };

  const handlePageChange = (_event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const rowsPerPage = event.target.value;
    setSize(rowsPerPage);
    setPage(0);
  };

  return (
    <TableContainer>
      <Table>
        <ContractOverviewTableHead />
        <TableBody>
          {contractList.map((contract) => {
            return (
              <TableRow
                key={contract.person.fullName}
                hover
                onClick={() => handleClick(contract)}
              >
                <TableCell>{contract.person.fullName}</TableCell>
                <TableCell>{contract.from.format(DMY_DATE)}</TableCell>
                <TableCell>{contract.to?.format(DMY_DATE)}</TableCell>
                <TableCell>{contract.type}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 20, 50, { value: -1, label: 'All' }]}
        component="div"
        count={rowCount}
        rowsPerPage={size}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </TableContainer>
  );
}
