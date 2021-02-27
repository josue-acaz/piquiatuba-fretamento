import axios from 'axios';
import { baseURL } from '../global';
import { authHeader } from '../auth/helpers/auth-header';

const api = axios.create({
    baseURL: "https://api.charterpiquiatuba.com.br",
});

api.interceptors.request.use(function (config) {
    config.headers = {
        ...config.headers,
        Authorization: authHeader() ? authHeader().Authorization : null,
    };
    return config;
});

export default api;
