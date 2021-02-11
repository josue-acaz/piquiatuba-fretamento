import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider , useSelector } from 'react-redux';
import { store } from './auth/helpers';
import AppRoutes from './routes/app.routes';
import AuthRoutes from './routes/auth.routes';

function GetRoutes() {
    const loggedIn = useSelector(state => state.authentication.loggedIn);
    return loggedIn ? <AppRoutes /> : <AuthRoutes />;
}

export default function Routes() {
    return(
        <BrowserRouter>
            <Provider store={store}>
                <GetRoutes />
            </Provider>
        </BrowserRouter>
    );
}