import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import SingnIn from '../pages/SingnIn';
import Download from '../pages/Download';
import Passenger from '../pages/Passenger';
import Success from '../pages/Success';
import Error from '../pages/Error';
import Documents from '../pages/Documents';

const AuthRoutes = () => {

    const routes = [
        {
            id: 1,
            exact: false,
            path: "/login",
            component: SingnIn
        },
        {
            id: 2,
            exact: false,
            path: "/pedidos/:id/pdf",
            component: Download
        },
        {
            id: 3,
            exact: false,
            path: "/cotações/:quotation_id/medical-informations/:patient_information_id/passenger",
            component: Passenger,
        },
        {
            id: 4,
            exact: false,
            path: "/success",
            component: Success,
        },
        {
            id: 5,
            exact: false,
            path: "/error",
            component: Error,
        },
        {
            id: 6,
            exact: false,
            path: "/documents/:patient_information_id/show",
            component: Documents,
        },
    ];

    return(
        <Switch>
            {routes.map(route => (
                <Route 
                    key={route.id} 
                    exact={route.exact} 
                    path={route.path} 
                    component={route.component} 
                />
            ))}
            <Redirect from="*" to="/login" />
        </Switch>
    );
};

export default AuthRoutes;