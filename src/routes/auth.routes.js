import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import SingnIn from '../pages/SingnIn';

const AuthRoutes = () => {

    const routes = [
        {
            id: 1,
            exact: false,
            path: "/login",
            component: SingnIn
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