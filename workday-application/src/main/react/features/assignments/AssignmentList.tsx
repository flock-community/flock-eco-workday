import { Box, CardContent } from '@mui/material';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import { useEffect, useState } from 'react';
import {
  ASSIGNMENT_PAGE_SIZE,
  AssignmentClient,
} from '../../clients/AssignmentClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { isDefined } from '../../utils/validation';

const PREFIX = 'AssignmentList';

const classes = {
  list: `${PREFIX}List`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
  [`& .${classes.list}`]: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
});

type AssignmentListProps = {
  refresh: boolean;
  personId?: string;
  onItemClick: (item: any) => void;
  disableEdit: boolean;
};

export function AssignmentList({
  refresh,
  personId,
  onItemClick,
  disableEdit,
}: Readonly<AssignmentListProps>) {
  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(-1);
  const [_loading, setLoading] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh needs to be in dependencies to trigger reloads when parent changes it
  useEffect(() => {
    if (personId) {
      setLoading(true);
      AssignmentClient.findAllByPersonId(personId, page).then((res) => {
        setItems(res.list);
        setCount(res.count);
        setLoading(false);
      });
    } else {
      setItems([]);
    }
  }, [refresh, personId, page]);

  const handleClickItem = (it) => () => {
    if (!disableEdit && isDefined(onItemClick)) onItemClick(it);
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No result</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Root>
      <Grid container spacing={1} className={classes.list}>
        {items.map((assignment) => (
          <Grid size={{ xs: 12 }} key={`assignment-${assignment.code}`}>
            <Card onClick={handleClickItem(assignment)}>
              <CardContent>
                <Typography variant="h6">
                  {assignment.client.name} - {assignment.role}
                </Typography>
                <Typography>
                  Period: {assignment.from.format('DD-MM-YYYY')} -{' '}
                  {assignment.to ? (
                    assignment.to.format('DD-MM-YYYY')
                  ) : (
                    <i>now</i>
                  )}
                </Typography>
                <UserAuthorityUtil has={'AssignmentAuthority.ADMIN'}>
                  <Typography>Hourly rate: {assignment.hourlyRate} </Typography>
                </UserAuthorityUtil>
                <Typography>
                  Hours per week: {assignment.hoursPerWeek}{' '}
                </Typography>
                {assignment.project && (
                  <Typography>Project: {assignment.project.name}</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={ASSIGNMENT_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </Root>
  );
}
