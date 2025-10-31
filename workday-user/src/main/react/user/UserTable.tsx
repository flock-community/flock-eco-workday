import React, {useEffect, useState} from 'react'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableFooter from '@material-ui/core/TableFooter'
import TableRow from '@material-ui/core/TableRow'
import TablePagination from '@material-ui/core/TablePagination'
import UserClient from './UserClient'

type UserTableProps = {
  search?: string
  size?: number
  reload?: boolean
  onRowClick?: (user: any) => void
  onChangePage?: (page: number) => void
}
export function UserTable({
  search,
  size,
  reload,
  onRowClick,
  onChangePage,
}: UserTableProps) {
  const [state, setState] = useState({
    page: 0,
    count: 0,
    list: [],
  })

  useEffect(() => {
    UserClient.findAllUsers(search || '', state.page, size || 10).then(
      (res) => {
        setState({...state, ...res})
      },
    )
  }, [reload, search, size, state.page])

  const handleChangePage = (event, page) => {
    setState({...state, page})
    onChangePage?.(page)
  }

  const handleRowClick = (user) => () => {
    onRowClick?.(user)
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Authorities</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {state.list.map((it) => (
          <TableRow key={it.id} hover onClick={handleRowClick(it)}>
            <TableCell component="th" scope="row">
              {it.name}
            </TableCell>
            <TableCell>{it.email}</TableCell>
            <TableCell>{it.authorities.length}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TablePagination
            count={state.count}
            rowsPerPage={size || 10}
            page={state.page}
            rowsPerPageOptions={[]}
            onPageChange={handleChangePage}
          />
        </TableRow>
      </TableFooter>
    </Table>
  )
}
