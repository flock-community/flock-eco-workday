import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { CvEditor } from './CvEditor';
import { CvPersonPage } from './CvPersonPage';

export function CvFeature() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path} component={CvPersonPage} />
      <Route exact path={`${path}/new`} component={CvEditor} />
      <Route exact path={`${path}/:code/edit`} component={CvEditor} />
    </Switch>
  );
}
