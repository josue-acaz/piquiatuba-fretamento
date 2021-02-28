import axios from 'axios';
import { authHeader } from '../auth/helpers/auth-header';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
});
//https://api.charterpiquiatuba.com.br process.env.REACT_APP_API_URL
api.interceptors.request.use(function (config) {
    config.headers = {
        ...config.headers,
        Authorization: authHeader() ? authHeader().Authorization : null,
    };
    return config;
});

export default api;
