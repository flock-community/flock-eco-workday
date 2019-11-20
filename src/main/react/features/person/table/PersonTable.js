import React, {useState} from "react"
import PropTypes from "prop-types"
import {Link as RouterLink} from "react-router-dom"
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  Link,
  TablePagination,
  Paper,
} from "@material-ui/core"
import {PersonTableHead} from "./PersonTableHead"
import {makeStyles} from "@material-ui/styles"

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  tableWrapper: {
    overflow: "auto",
  },
})

export const PersonTable = props => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const classes = useStyles()

  const handleChangePage = (_, newPage) => {
    // TODO: query user endpoint to retrieve user list for page
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    // TODO: query user GET endpoint with limit param and page=0
    const rowsPerPage = event.target.value
    setRowsPerPage(+rowsPerPage)
    setPage(0)
  }

  return (
    <Paper className={classes.root}>
      <div className={classes.tableWrapper}>
        <Table>
          <PersonTableHead></PersonTableHead>
          <TableBody>
            {persons.map((person, index) => {
              return (
                <TableRow key={index} hover>
                  <TableCell component="th" scope="row">
                    <Link
                      component={RouterLink}
                      to={`/person/${index}`}
                      underline="none"
                    >
                      {person.firstname} {person.lastname}
                    </Link>
                  </TableCell>
                  <TableCell align="left">{person.email}</TableCell>
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
        count={persons.length}
        // remove labelDisplayRows by replacing it with an empty return
        labelDisplayedRows={(from, to, count) => {}}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Paper>
  )
}

PersonTable.propTypes = {
  persons: PropTypes.array.isRequired,
}
