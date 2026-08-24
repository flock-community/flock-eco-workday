// Deps

import { Pagination } from '@mui/material';
import type React from 'react';

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

  const pageCount = Math.ceil(numberOfItems / itemsPerPage);
  if (pageCount <= 1) {
    return null;
  }

  return (
    <Pagination
      sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}
      count={pageCount}
      page={currentPage}
      onChange={handleChangePage}
      color="primary"
      shape="rounded"
    />
  );
};
