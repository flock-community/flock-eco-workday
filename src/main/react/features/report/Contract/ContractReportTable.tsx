import React, {useEffect, useRef, useState} from "react";
import {useHistory, useRouteMatch} from "react-router-dom";
import {CardHeader, TableBody, TableContainer, TablePagination} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import {makeStyles} from "@material-ui/core/styles";
import {Contract, ContractClient} from "../../../clients/ContractClient";
import {ContractReportTableHead} from "./ContractReportTableHead";
import {DMY_DATE} from "../../../clients/util/DateFormats";
import dayjs from "dayjs";

export default function ContractReportTable() {
  const {url} = useRouteMatch();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(-1);
  const [rowCount, setRowCount] = useState(-1);
  const [contractList, setContractList] = useState<Contract[]>([]);
  const [reload, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();

  useEffect(() => {
    ContractClient.findAllByToAfterOrToNull(dayjs().toDate(), {
      page: page,
      size: size,
      sort: ['person.firstname', 'from']
    }).then((res) => {
      setContractList(res.list);
      setRowCount(res.count);
    });
  }, [reload, page, size, searchTerm]);

  const handleClick = (contract: Contract) => {
    history.push(`${url}/code/${contract.code}`);
  };

  const handlePageChange = (event, newPage) => {
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
          <ContractReportTableHead/>
          <TableBody>
            {contractList.map((contract, idx) => {
              return (
                <TableRow
                  key={idx}
                  hover
                  onClick={() => handleClick(contract)}
                >
                  <TableCell>
                    {contract.person.fullName}
                  </TableCell>
                  <TableCell>
                    {contract.from.format(DMY_DATE)}
                  </TableCell>
                  <TableCell>
                    {contract.to?.format(DMY_DATE)}
                  </TableCell>
                  <TableCell>
                    {contract.type}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50, {value: -1, label: 'All'}]}
          component="div"
          count={rowCount}
          rowsPerPage={size}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </TableContainer>
  );
};
