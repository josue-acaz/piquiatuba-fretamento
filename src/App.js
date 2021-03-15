import React, {useEffect, useState} from 'react';
import Routes from './routes';
import sistemavoar from './services/sistema-voar';
import Processing from './components/Processing';
import api from './api';

import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import './assets/css/globals.css';
import './assets/css/bootstrap.css';

export default function App() {
    const [loading, setLoading] = useState(true);
    const [serverDatetime, setServerDatetime] = useState(new Date());

    async function authenticateInSistemaVoar() {
        await sistemavoar.authenticate('josue', 'josue2021');
    }

    useEffect(() => {
        async function getDatetimeFromServer() {
            try {
                const {data} = await api.get('/current-datetime');
                const current_datetime = new Date(data);
                setServerDatetime(current_datetime);
                setLoading(false);
            } catch (error) {
                console.error(error);
            }
        }

        getDatetimeFromServer();
        authenticateInSistemaVoar();
    }, []);

    return(
        loading ? <Processing /> : <Routes serverDatetime={serverDatetime} />
    );
}