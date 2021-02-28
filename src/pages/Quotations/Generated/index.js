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
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import {useFeedback} from '../../../core/feedback/feedback.context';
import {shareOnWhatsapp} from '../../../utils';
import api from '../../../api';
import {EnumShareWhatsappEndpoints} from '../../../global';

import './styles.css';

export default function Generated({history}) {
    const feedback = useFeedback();
    const {internal_quotation_id} = useParams();
    const [processing, setProcessing] = useState(true);
    const [pdf, setPdf] = useState(null);
    const [errorMsg, setErrorMsg] = useState('Erro desconhecido.');
    const [clientEmail, setClientEmail] = useState('');
    const [open, setOpen] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);

    async function generatePDF(internal_quotation_id) {
        try {
            const response = await api.post(`/internal-quotations/${internal_quotation_id}/document`);
            setPdf(response.data.url);
            setProcessing(false);
        } catch (error) {
            if(error.response) {
                const {msg} = error.response.data;
                setErrorMsg(msg);
            }
            setProcessing(false);
        }
    }

    useEffect(() => {
        generatePDF(internal_quotation_id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function goBack() {
        history.push('/quotations');
    }

    function handleDownload() {
        window.open(pdf, '_blank');
    }

    async function handleSendEmail() {
        setSendingEmail(true);

        try {
            await api.post(`/internal-quotations/${internal_quotation_id}/send-document-by-email`, {
                client_email: clientEmail.trim(),
            });

            feedback.open({
                severity: 'success',
                msg: 'Email enviado com sucesso!',
            });
            setSendingEmail(false);
            setOpen(false);
        } catch (error) {
            console.error(error);
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro ao enviar o email!',
            });
            setSendingEmail(false);
        }
    }

    function handleShareOnWhatsapp() {
        shareOnWhatsapp(`${EnumShareWhatsappEndpoints.FORMS}/quotations/${internal_quotation_id}/download`);
    }

    return(
        processing ? <ProcessingAction icon={<i className="pi pi-file-pdf icon"></i>} title="Gerando PDF" message="Por favor, aguarde..." /> : (
            <WrapperContent>
                <Dialog disableBackdropClick={sendingEmail} fullWidth open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Enviar email</DialogTitle>
                    <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Email do cliente"
                        type="email"
                        fullWidth
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Email do cliente"
                    />
                    </DialogContent>
                    <DialogActions>
                    <Button disabled={sendingEmail} onClick={() => setOpen(false)} color="default">
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleSendEmail} color="primary">
                        {sendingEmail ? <p>Enviando...</p> : <p>Enviar</p>}
                    </Button>
                    </DialogActions>
                </Dialog>
                <section id="generated" className="generated">
                    <GoBack onClick={goBack} />
                    <PageTitle title="Cotação gerada" subtitle="Gerar PDF" />

                    <div className="content">
                        {pdf ? (
                            <>
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
                                        <Tooltip title="Enviar por email" onClick={() => setOpen(true)}>
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
                            </>
                        ) : (
                            <div className="error">
                                <p>Ocorreu um erro ao gerar o pdf da cotação. Veja mais detalhes abaixo</p>
                                <Alert severity="error">{errorMsg}</Alert>

                                <p className="obs-error"><strong>Obs.: </strong> Você pode gerar este documento mais tarde na lista de cotações.</p>
                            </div>
                        )}
                    </div>
                
                </section>
            </WrapperContent>
        )
    );
}