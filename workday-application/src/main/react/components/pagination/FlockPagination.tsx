// Deps

import { Pagination } from '@mui/material';
import { styled } from '@mui/material/styles';
import type React from 'react';

const PREFIX = 'FlockPagination';

const classes = {
  pagination: `${PREFIX}pagination`,
};

const _StyledPagination = styled(Pagination)({
  [`& .${classes.pagination}`]: {
    '& .MuiPagination-ul': {
      justifyContent: 'right',
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
    _event: React.ChangeEvent<unknown>,
    value: number,
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
