import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Loader, Screen, Inline } from '../../components';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import GetAppIcon from '@material-ui/icons/GetApp';
import api from '../../api';
import logo from '../../assets/img/logo.png';

import './styles.css';

export default function Download() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [context, setContext] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function getPDF() {
            try {
                const response = await api.get(`quotations/${id}/pdf`);
                setContext(response.data);
                setLoading(false);
            } catch (error) {
                setError(true);
                setLoading(false);
            }
        }

        getPDF();
    }, [id]);

    // Open link to download
    /*useEffect(() => {
        if(context) {
            onDownload(context);
        }
    }, [context]);*/

    const onDownload = (context) => {
        window.open(context.pdf_url, "_blank");
    };

    const goToSite = () => {
        window.open("https://www.piquiatuba.com.br/site/");
    };

    return(
        <div className="wrapper-download">
            <Screen id="download" className="download">
                {loading ? (<Loader title="Obtendo arquivo" />) : (
                    <Container fluid="sm">
                        <div className="actions">
                            <img src={logo} alt="piquiatuba logo" />

                            <div className="title">
                                {error ? <h3 className="error">Este arquivo não está mais disponível!</h3> : <h3 className="__main">Selecione uma ação abaixo!</h3>}
                            </div>

                            <div className="group-buttons">
                                {!error && (
                                    <button className="downloadBtn" onClick={() => { onDownload(context) }}>
                                        
                                        <Inline components={[
                                            {
                                                id: 1,
                                                component: (<span>Baixar Proposta (PDF)</span>)
                                            },
                                            {
                                                id: 2,
                                                component: (<GetAppIcon className="icon" />)
                                            }
                                        ]} />
                                    </button>
                                )}
                                <button className="goToSiteBtn" onClick={goToSite}>
                                    <Inline components={[
                                        {
                                            id: 1,
                                            component: (<span>Ir para o site</span>)
                                        },
                                        {
                                            id: 2,
                                            component: (<ArrowRightAltIcon className="icon" />)
                                        }
                                    ]} />
                                </button>
                            </div>
                        </div>
                    </Container>
                )}
            </Screen>
        </div>
    );
}