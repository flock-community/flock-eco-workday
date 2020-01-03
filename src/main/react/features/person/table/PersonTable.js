import React, {useEffect, useState} from "react"
import {Link as RouterLink, useRouteMatch} from "react-router-dom"
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Link,
  TablePagination,
  Paper,
} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import {PersonTableHead} from "./PersonTableHead"
import {PersonService} from "../PersonService"
import {AddActionFab} from "../../../components/FabButtons"
import {PersonDialog} from "../PersonDialog"
import {useBreadcrumbs} from "../../../components/breadcrumb"

// add additional styles
// root: Paper - @material-ui
// tableWrapper: div - making the table scrollable
const useStyles = makeStyles({
  root: {
    maxWidth: 1200, // should represent a @screen break-point
  },
  tableWrapper: {
    overflow: "auto",
  },
  tblEmail: {
    minWidth: 200,
  },
  tblName: {
    minWidth: 170,
  },
})

/** PersonTable
 * creates a table and lists all persons. It includes pagination and the ability to
 * manually adjust the number of visible items per page
 * table fields:
 *   - name {firstname, lastname}
 *   - email
 *   - active (user status)
 *
 * @param {*} props - React props
 */
export const PersonTable = () => {
  const {url} = useRouteMatch()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [personList, setPersonList] = useState([])
  const [dialog, setDialog] = useState({open: false})
  const [reload, setReload] = useState(false)
  const classes = useStyles()
  const [, setLinkList] = useBreadcrumbs()

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    PersonService.getAll().then(personList => setPersonList(personList))
    setLinkList([{url, name: "Person"}])
  }, [reload])

  const handleDialogOpen = () => {
    setDialog({open: true})
  }

  const handleDialogClose = status => {
    if (status) setReload(!reload)
    setDialog({open: false})
  }

  const handleChangePage = (_, newPage) => {
    // TODO: query user endpoint to retrieve user list for page
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    // TODO: query user GET endpoint with limit param and page=0
    // eslint-disable-next-line no-shadow
    const rowsPerPage = event.target.value
    setRowsPerPage(+rowsPerPage)
    setPage(0)
  }

  return (
    <div>
      <Paper className={classes.root}>
        <div className={classes.tableWrapper}>
          <Table>
            <PersonTableHead></PersonTableHead>
            <TableBody>
              {personList.map((person, idx) => {
                return (
                  <TableRow key={idx} hover>
                    <TableCell className={classes.tblName} component="th" scope="row">
                      <Link
                        component={RouterLink}
                        to={`${url}/id/${person.id}`}
                        underline="none"
                      >
                        {person.firstname} {person.lastname}
                      </Link>
                    </TableCell>
                    <TableCell className={classes.tblEmail} align="left">
                      {person.email}
                    </TableCell>
                    <TableCell align="left">{person.active}</TableCell>
                    <TableCell align="left">{person.holidays}</TableCell>
                    <TableCell align="left">{person.clients}</TableCell>
                    <TableCell align="left">{person.hours}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={personList.length}
          // remove labelDisplayRows by replacing it with an empty return
          labelDisplayedRows={() => {}}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <PersonDialog open={dialog.open} onClose={handleDialogClose} />
      <AddActionFab color="primary" onClick={handleDialogOpen} />
    </div>
  )
}

PersonTable.propTypes = {}
