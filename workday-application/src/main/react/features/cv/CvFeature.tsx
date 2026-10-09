import { Box } from '@mui/material';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { CvEditor } from './CvEditor';
import { CvList } from './CvList';
import { CvPage } from './CvPage';

export function CvFeature() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <Box
          className="flow"
          flow-gap="wide"
          style={{ paddingBottom: '1.5rem' }}
        >
          <CvList />
        </Box>
      </Route>
      <Route exact path={`${path}/new`} component={CvEditor} />
      <Route exact path={`${path}/:code/edit`} component={CvEditor} />
      <Route exact path={`${path}/:code`} component={CvPage} />
    </Switch>
  );
}
