import React from 'react';
import {Switch, Route, useRouteMatch} from 'react-router-dom';

import EditAdmin from './EditAdmin';
import ListConfigs from './ListConfigs';

export default function Bases(props) {
    const {path} = useRouteMatch();

    const routes = [
        {
            id: 1,
            exact: true,
            path,
            component: ListConfigs,
        },
        {
            id: 2,
            exact: false,
            path: `${path}/:admin_id/edit`,
            component: EditAdmin,
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