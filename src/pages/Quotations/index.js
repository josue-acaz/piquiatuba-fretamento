import React from 'react';
import {Switch, Route, useRouteMatch} from 'react-router-dom';

import ListQuotations from './ListQuotations';
import Generate from './Generate';
import Generated from './Generated';
import Medical from './Medical';

export default function Quotations(props) {
    const {path} = useRouteMatch();

    const routes = [
        {
            exact: false,
            path,
            component: ListQuotations,
        },
        {
            exact: false,
            path: `${path}/generate`,
            component: Generate
        },
        {
            exact: false,
            path: `${path}/generate/:internal_quotation_id/generated`,
            component: Generated
        },
        {
            exact: false,
            path: `${path}/medical`,
            component: Medical,
        },
    ];

    return(
        <Switch>
            {routes.reverse().map((route, index) => (
                <Route key={index} exact={route.exact} path={route.path}>
                    <route.component {...props} />
                </Route>
            ))}
        </Switch>
    );
}
