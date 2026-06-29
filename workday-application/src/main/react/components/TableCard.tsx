import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import type { ReactNode } from 'react';

type TableCardProps = {
  children: ReactNode;
  loading?: boolean;
};

// Inset "nested box" that wraps a list's table, shared across the day/person lists.
export function TableCard({ children, loading = false }: TableCardProps) {
  return (
    <Card sx={{ opacity: loading ? 0.5 : 1, transition: 'opacity 160ms ease' }}>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
