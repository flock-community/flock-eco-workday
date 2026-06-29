import { Box, Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { ReactNode } from 'react';

type TableCardProps = {
  children: ReactNode;
  title?: ReactNode;
  toolbar?: ReactNode;
  action?: ReactNode;
  loading?: boolean;
};

export function TableCard({
  children,
  title,
  toolbar,
  action,
  loading = false,
}: TableCardProps) {
  const hasHeader = title != null || toolbar != null || action != null;
  return (
    <Card sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 160ms ease' }}>
      {hasHeader && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {title != null && (
            <Box sx={{ flexShrink: 0 }}>
              {typeof title === 'string' ? (
                <Typography variant="h6">{title}</Typography>
              ) : (
                title
              )}
            </Box>
          )}
          {toolbar != null && (
            <Box
              sx={{
                ml: 'auto',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                minWidth: 0,
              }}
            >
              {toolbar}
            </Box>
          )}
          {action != null && (
            <Box sx={{ flexShrink: 0, ml: toolbar == null ? 'auto' : 0 }}>
              {action}
            </Box>
          )}
        </Box>
      )}
      <CardContent
        sx={{
          '& tbody tr:last-child td, & tbody tr:last-child th': {
            borderBottom: 0,
          },
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}
