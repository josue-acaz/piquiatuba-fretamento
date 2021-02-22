import React from 'react';
import {Switch, Route, useRouteMatch} from 'react-router-dom';

import ListQuotations from './ListQuotations';
import EditQuotation from './EditQuotation';
import Generated from './Generated';

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
            path: `${path}/:internal_quotation_id/edit`,
            component: EditQuotation
        },
        {
            exact: false,
            path: `${path}/:internal_quotation_id/export-pdf`,
            component: Generated
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
