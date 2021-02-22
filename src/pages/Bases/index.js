import React from 'react';
import {Switch, Route, useRouteMatch} from 'react-router-dom';

import EditBase from './EditBase';
import ListBases from './ListBases';

export default function Bases(props) {
    const {path} = useRouteMatch();

    const routes = [
        {
            id: 1,
            exact: true,
            path,
            component: ListBases,
        },
        {
            id: 2,
            exact: false,
            path: `${path}/:base_id/edit`,
            component: EditBase,
        },
    ];

    return(
        <Switch>
            {routes.reverse().map(route => (
                <Route key={route.id} exact={route.exact} path={route.path}>
                    <route.component {...props} />
                </Route>
            ))}
        </Switch>
    );
}