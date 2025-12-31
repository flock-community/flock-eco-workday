import { Card, CardContent, CardHeader } from '@mui/material';
import Grid from '@mui/material/Grid';

import AssignmentOverviewTable from './AssignmentOverviewTable';

export default function AssignmentOverview() {
  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardHeader title="Assignments" />
        <CardContent>
          <AssignmentOverviewTable />
        </CardContent>
      </Card>
    </Grid>
  );
}
