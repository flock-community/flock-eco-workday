import { Card, CardContent, CardHeader } from '@mui/material';
import Grid from '@mui/material/Grid';

import ContractOverviewTable from './ContractOverviewTable';

export default function ContractOverview() {
  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardHeader title="Contracts" />
        <CardContent>
          <ContractOverviewTable />
        </CardContent>
      </Card>
    </Grid>
  );
}
