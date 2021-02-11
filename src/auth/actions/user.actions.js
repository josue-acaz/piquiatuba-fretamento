import { userConstants } from '../constants';
import { userService } from '../services';
import { alertActions } from './';

export const userActions = {
    login,
    logout
};

function login(email, password, history) {
    return dispatch => {
        dispatch(request({ email }));

        userService.login(email, password).then(response => {
            const user = response.data;
            localStorage.setItem('authenticated', JSON.stringify(user));

            dispatch(success(user));
            history.push("/dashboard");
        }).catch(err => {
            dispatch(failure(err.toString()));
            dispatch(alertActions.error(err.toString()));
        });
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function logout(history) {
    userService.logout(history);
    return { type: userConstants.LOGOUT };
}