import {getCurrentDate} from '../../utils';
import {EnumDatetimeFormatTypes} from '../../global';
import api from '../../api';

class SistemaVoar {
    constructor() {
        this.current_date = getCurrentDate(EnumDatetimeFormatTypes.SQL_ONLY_DATE);
    }
    
    async authenticate(username, password) {
        try {
            await api.post('/sistemavoar/authenticate', {
                username,
                password,
            });
        } catch (error) {
            console.error(error);
        }
    }

    async getAircraftList() {
        const response = await api.get('/sistemavoar/aircraft-list');
        const aircrafts = response.data;
        return aircrafts;
    }
    
    async getAircraftStatusList(initial_date=this.current_date, final_date=this.current_date) {
        const response = await api.get('/sistemavoar/aircraft-status-list', {
            params: {
                initial_date,
                final_date,
            }
        });

        const aircraft_status = response.data;
        console.log({aircraft_status});
        
        return aircraft_status;
    }

    async getFlightOrderTypes() {
        const response = await api.get('/sistemavoar/flight-order-types');
        const flight_order_types = response.data;

        return flight_order_types;
    }

    async getAircraftStatusByPrefix(prefix, initial_date, final_date) {
        const response = await api.get(`/sistemavoar/aircraft-status-by-prefix/${prefix}`, {
            params: {
                initial_date,
                final_date,
            }
        });
        const aircraft_status = response.data;
        console.log({aircraft_status});

        return aircraft_status;
    }
}

const sistemavoar = new SistemaVoar();
export default sistemavoar;