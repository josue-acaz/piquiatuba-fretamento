export function authHeader() {
    const authenticated = JSON.parse(localStorage.getItem('authenticated'));

    if(authenticated) {
        if(authenticated && authenticated.token) {
            return { 'Authorization': 'Bearer ' + authenticated.token }
        } else { return {} }
    } else { return null }
}