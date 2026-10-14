import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { CvEditor } from './CvEditor';
import { CvPersonPage } from './CvPersonPage';

export function CvFeature() {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={`${path}/new`} component={CvEditor} />
      <Route exact path={`${path}/:code/edit`} component={CvEditor} />
      {/* One route, so moving between a CV and its comparison keeps the page */}
      <Route
        exact
        path={[path, `${path}/:code`, `${path}/:code/compare`]}
        component={CvPersonPage}
      />
    </Switch>
  );
}
