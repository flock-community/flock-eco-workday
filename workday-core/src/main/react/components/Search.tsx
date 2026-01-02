import SearchIcon from '@mui/icons-material/Search';
import { Box, InputBase } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type React from 'react';

type SearchProps = {
  value?: string;
  onChange?: (search: string) => void;
};

export function Search({ onChange }: SearchProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    onChange?.(ev.target.value);
  };

  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
          backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
          marginLeft: theme.spacing(1),
          width: 'auto',
        },
      })}
    >
      <Box
        sx={(theme) => ({
          padding: theme.spacing(0, 2),
          height: '100%',
          position: 'absolute',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <SearchIcon />
      </Box>
      <InputBase
        placeholder="Search…"
        sx={(theme) => ({
          color: 'inherit',
          '& .MuiInputBase-input': {
            padding: theme.spacing(1, 1, 1, 0),
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('sm')]: {
              width: '12ch',
              '&:focus': {
                width: '20ch',
              },
            },
          },
        })}
        inputProps={{ 'aria-label': 'search' }}
        onChange={handleChange}
      />
    </Box>
  );
}
