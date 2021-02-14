import React from 'react';
import {Switch, Route, useRouteMatch} from 'react-router-dom';

import Programming from './Programming';

export default function Bases(props) {
    const {path} = useRouteMatch();

    const routes = [
        {
            id: 1,
            exact: false,
            path: `${path}/programming`,
            component: Programming,
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