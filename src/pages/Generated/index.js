import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import { userService } from '../../auth/services';
import { Loader, Screen } from '../../components';
import { WrapperContent } from '../../core/design';
import api from '../../api';

import './styles.css';

export default function Generated({ history, location }) {
    const { company } = userService.getUserLogged();// Trocar aqui
    const [loading, setLoading] = useState(true);
    const { pdf_url /*, client_name, filename, code, type_of_transport, price*/ } = location.state;
    const [context, setContext] = useState(null);

    useEffect(() => {
        async function postContext() {
            setLoading(true);
            const response = await api.post("/internal/quotations", {
                admin_id: company.id,
                ...location.state
            });
    
            setContext(response.data);
            setLoading(false);
        }

        postContext();
    }, [location.state, company.id]);

    const goBack = () => { history.goBack() }
    const next = () => { 
        history.push("/send", { ...location.state, company, context }) 
    }

    return(
        <WrapperContent>
            {loading ? (<Loader title="Processando" />) : (
                <Screen id="generated" className="generated">
                    <div className="actions">
                        <div className="goBack" onClick={goBack}>
                            <ArrowBackIcon className="icon" />
                            <span className="spanback">Voltar</span>
                        </div>

                        <div className="content-generated">
                            <h3>PDF gerado com sucesso!</h3>
                            <p>Selecione uma ação abaixo.</p>
                        </div>

                        <div className="group-actions">
                            <a rel="noopener noreferrer" target="_blank" href={pdf_url} className="btn btn-action">Baixar PDF</a>
                            <button onClick={next} className="btn btn-action">Enviar por e-mail</button>
                            <a 
                                href={'https://wa.me/?text='+encodeURIComponent(
                                    `Acesse:: https://fretamento-piquiatuba.netlify.app/pedidos/${context.id}/pdf`
                                )}
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp"
                                target="_blank"
                            > 
                                    <div className="__zap">
                                        <WhatsAppIcon className="icon" />
                                        <span>Enviar no whatsapp</span>
                                    </div>
                            </a>
                        </div>
                    </div>
                </Screen>
            )}
        </WrapperContent>
    );
}