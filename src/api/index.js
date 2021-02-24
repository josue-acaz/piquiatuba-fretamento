import axios from 'axios';
import { baseURL } from '../global';
import { authHeader } from '../auth/helpers/auth-header';

const api = axios.create({
    baseURL: 'http://144.126.221.7:3333',
});

api.interceptors.request.use(function (config) {
    config.headers = {
        ...config.headers,
        ...authHeader(),
    };
    return config;
});

export default api;