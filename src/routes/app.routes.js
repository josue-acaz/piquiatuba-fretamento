import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import Layout from "../Layout";
import Dashboard from '../pages/Dashboard';
import Bases from '../pages/Bases';
import Config from '../pages/Config';
import Aircrafts from '../pages/Aircrafts';
import Quotations from '../pages/Quotations';
import Coordination from '../pages/Coordination';
import MedicalForms from '../pages/MedicalForms';
import {FeedbackProvider} from '../core/feedback/feedback.context';

const routes = [
    {
        id: 1,
        exact: false,
        path: "/dashboard",
        component: Dashboard
    },
    {
        id: 2,
        exact: false,
        path: "/bases",
        component: Bases,
    },
    {
        id: 3,
        exact: false,
        path: "/aircrafts",
        component: Aircrafts,
    },
    {
        id: 4,
        exact: false,
        path: "/quotations",
        component: Quotations,
    },
    {
        id: 5,
        exact: false,
        path: "/coordination",
        component: Coordination,
    },
    {
        id: 6,
        exact: false,
        path: '/configs',
        component: Config,
    },
    {
        id: 7,
        exact: false,
        path: '/medical-forms',
        component: MedicalForms,
    },
];

const AppRoutes = ({serverDatetime}) => {
    const[minimized, setMinimized] = useState(false);
    const handleMaxMin = () => { setMinimized(!minimized) };

    return(
        <Switch>
            <Layout minimized={minimized} handleMaxMin={handleMaxMin}>
                <FeedbackProvider>
                    {routes.map(route => (
                        <Route
                            key={route.id} 
                            exact={route.exact} 
                            path={route.path} 
                            component={(props) => <route.component serverDatetime={serverDatetime} {...props} />} 
                        />
                    ))}
                </FeedbackProvider>
            </Layout>
        </Switch>
    );
};

export default AppRoutes;