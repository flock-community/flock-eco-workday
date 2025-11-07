// Deps
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Pagination } from "@material-ui/lab";

interface FlockPaginationProps {
  currentPage: number;
  numberOfItems: number;
  itemsPerPage: number;
  changePageCb: (pageNumber: number) => void;
}

const useStyles = makeStyles({
  pagination: {
    "& .MuiPagination-ul": {
      justifyContent: "right",
    },
  },
});

export const FlockPagination: React.FC<FlockPaginationProps> = ({
  currentPage,
  numberOfItems,
  itemsPerPage,
  changePageCb,
}) => {
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    changePageCb(value - 1);
  };

  const classes = useStyles();

  return (
    <Pagination
      className={classes.pagination}
      count={Math.ceil(numberOfItems / itemsPerPage)}
      page={currentPage}
      onChange={handleChangePage}
      color="primary"
      shape="rounded"
    />
  );
};
