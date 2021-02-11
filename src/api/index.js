import axios from 'axios';
import {baseURL} from '../global';

const api = axios.create({
    baseURL,
});

export default api;