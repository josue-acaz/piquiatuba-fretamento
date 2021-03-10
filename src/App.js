import React, {useEffect} from 'react';
import Routes from './routes';
import sistemavoar from './services/sistema-voar';

import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import './assets/css/globals.css';
import './assets/css/bootstrap.css';

export default function App() {
    async function authenticateInSistemaVoar() {
        await sistemavoar.authenticate('josue', 'josue2021');
    }

    useEffect(() => {
        authenticateInSistemaVoar();
    }, []);

    return(
        <Routes />
    );
}