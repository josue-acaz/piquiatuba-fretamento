import React from 'react';
import {Switch, Route, useRouteMatch} from 'react-router-dom';

import AddAircraft from './AddAircraft';
import ListAircrafts from './ListAircrafts';
import AircraftGallery from './AircraftGallery';

export default function Bases(props) {
    const {path} = useRouteMatch();

    const routes = [
        {
            id: 1,
            exact: true,
            path,
            component: ListAircrafts,
        },
        {
            id: 2,
            exact: false,
            path: `${path}/add`,
            component: AddAircraft,
        },
        {
            id: 3,
            exact: false,
            path: `${path}/:aircraft_id/gallery`,
            component: AircraftGallery,
        }
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