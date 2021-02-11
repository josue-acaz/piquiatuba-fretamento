import axios from 'axios';

const serverless = axios.create({
  baseURL: 'https://eeja4gmmnj.execute-api.sa-east-1.amazonaws.com',
});

export default serverless;