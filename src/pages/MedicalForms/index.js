import React from 'react';
import {Switch, Route, useRouteMatch} from 'react-router-dom';

import ListMedicalForms from './ListMedicalForms';
import EditMedicalForm from './EditMedicalForm';

export default function MedicalForms(props) {
    const {path} = useRouteMatch();

    const routes = [
        {
            exact: false,
            path,
            component: ListMedicalForms,
        },
        {
            exact: false,
            path: `${path}/:patient_information_id/edit`,
            component: EditMedicalForm
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
