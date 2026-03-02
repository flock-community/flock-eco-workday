import { CardContent, Chip } from '@mui/material';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { type Job, JobClient } from '../../clients/JobClient';
import { isDefined } from '../../utils/validation';

const PREFIX = 'JobList';

const classes = {
  root: `${PREFIX}Root`,
};

const StyledGrid = styled(Grid)({
  [`&.${classes.root}`]: {
    padding: 10,
  },
});

type JobListProps = {
  refresh?: boolean;
  onItemClick?: (item: Job) => void;
};

export function JobList({ refresh, onItemClick }: JobListProps) {
  const [list, setList] = useState<Job[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    JobClient.findAllByPage({
      page: 0,
      size: 100,
      sort: 'title,asc',
    }).then((res) => setList(res.list));
  }, [refresh]);

  const handleItem = (it) => () => {
    if (isDefined(onItemClick)) onItemClick(it);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'success';
      case 'CLOSED':
        return 'default';
      case 'DRAFT':
      default:
        return 'warning';
    }
  };

  return (
    <StyledGrid container className={classes.root} spacing={1}>
      {list.map((it) => (
        <Grid size={{ xs: 12 }} key={`jobs-${it.code}`}>
          <Card onClick={handleItem(it)}>
            <CardContent>
              <Grid container alignItems="center" spacing={1}>
                <Grid size="grow">
                  <Typography variant="h6">{it.title}</Typography>
                  {it.client && (
                    <Typography variant="body2" color="textSecondary">
                      {it.client.name}
                    </Typography>
                  )}
                </Grid>
                <Grid>
                  <Chip
                    label={it.status}
                    color={statusColor(it.status)}
                    size="small"
                  />
                </Grid>
                {it.hourlyRate != null && (
                  <Grid>
                    <Typography variant="body2" color="textSecondary">
                      {it.hourlyRate}/hr
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </StyledGrid>
  );
}
