import { userConstants } from '../constants';

const user = JSON.parse(localStorage.getItem('authenticated'));
const initialState = user ? { loggedIn: true, user } : { loggedIn: false, user: null };

export function authentication(state=initialState, action) {
    switch (action.type) {
        case userConstants.LOGIN_REQUEST:
          return { loggingIn: true, user: action.user };
        case userConstants.LOGIN_SUCCESS:
          return { loggedIn: true, user: action.user };
        case userConstants.LOGIN_FAILURE:
          return { loggedIn: false, user: null };
        case userConstants.LOGOUT:
          return {};
        default:
          return state;
    }
}