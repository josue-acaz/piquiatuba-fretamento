import api from '../../api';

export const userService = {
    login,
    logout,
    isAuthenticated,
    getUserLogged
};

async function login(email, password) {
    const request = await api.post("/sessions", { email, password });
    return request;
}

function logout() {
    localStorage.removeItem('authenticated');
}

function getUserLogged() {
    const authenticated = JSON.parse(localStorage.getItem("authenticated"));
    return authenticated;
}

function isAuthenticated() { 
    return !!localStorage.getItem("authenticated");
}