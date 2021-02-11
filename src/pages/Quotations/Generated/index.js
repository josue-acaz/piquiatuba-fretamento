import React, { useState, useEffect } from 'react';
import {useParams} from 'react-router-dom';
import {WrapperContent} from '../../../core/design';
import {GoBack, PageTitle} from '../../../components';
import quotation from '../../../assets/img/quotation.png';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import ProcessingAction from '../../../components/ProcessingAction';
import {shareOnWhatsapp} from '../../../utils';
import api from '../../../api';

import './styles.css';

export default function Generated({history}) {
    const {internal_quotation_id} = useParams();
    const [processing, setProcessing] = useState(true);
    const [pdf, setPdf] = useState(null);

    async function generatePDF(internal_quotation_id) {
        try {
            const response = await api.post(`/internal-quotations/${internal_quotation_id}/document`);
            setPdf(response.data.url);
            setProcessing(false);
        } catch (error) {
            console.error(error);
            setProcessing(false);
        }
    }

    useEffect(() => {
        generatePDF(internal_quotation_id);
    }, []);

    function goBack() {
        history.goBack();
    }

    function handleDownload() {
        window.open(pdf, '_blank');
    }

    function handleSendEmail() {

    }

    function handleShareOnWhatsapp() {
        shareOnWhatsapp(`/pedidos/${internal_quotation_id}/pdf`);
    }

    return(
        processing ? <ProcessingAction icon={<i className="pi pi-file-pdf icon"></i>} title="Gerando PDF" message="Por favor, aguarde..." /> : (
            <WrapperContent>
                <section id="generated" className="generated">
                    <GoBack onClick={goBack} />

                    <PageTitle title="Cotação Gerada" subtitle="Gerar PDF" />

                    <div className="content">
                        <div className="img">
                            <img className="quotation-img" src={quotation} alt="quotation" />
                        </div>

                        <p className="action-title">Escolha uma ação abaixo</p>
                        <div className="actions">
                            <div className="action-buttons">
                                <Tooltip title="Enviar no whatsapp" onClick={handleShareOnWhatsapp}>
                                    <IconButton className="whatsapp-btn">
                                        <WhatsAppIcon className="whatsapp-icon" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Enviar por email" onClick={handleSendEmail}>
                                    <IconButton className="email-btn">
                                        <MailOutlineIcon className="email-icon" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Baixar cotação" onClick={handleDownload}>
                                    <IconButton className="cloud-btn">
                                        <CloudDownloadOutlinedIcon className="cloud-icon" />
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </section>
            </WrapperContent>
        )
    );
}