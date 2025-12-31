import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { PersonDetails } from './PersonDetails';
import { PersonTable } from './table/PersonTable';

export const PersonRouter = () => {
  const { url } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={url} component={PersonTable}></Route>
      <Route
        exact
        path={`${url}/code/:personId`}
        component={PersonDetails}
      ></Route>
    </Switch>
  );
};
