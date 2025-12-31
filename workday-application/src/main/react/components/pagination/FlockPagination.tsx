// Deps
import React from "react";
import { styled } from "@mui/material/styles";
import { Pagination } from "@mui/material";

const PREFIX = "FlockPagination";

const classes = {
  pagination: `${PREFIX}-pagination`,
};

const StyledPagination = styled(Pagination)({
  [`& .${classes.pagination}`]: {
    "& .MuiPagination-ul": {
      justifyContent: "right",
    },
  },
});

interface FlockPaginationProps {
  currentPage: number;
  numberOfItems: number;
  itemsPerPage: number;
  changePageCb: (pageNumber: number) => void;
}

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
