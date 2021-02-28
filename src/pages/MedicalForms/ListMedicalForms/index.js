import React, {useState} from 'react';
import {useFeedback} from '../../../core/feedback/feedback.context';
import {WrapperContent, FlexSpaceBetween} from '../../../core/design';
import PostAddOutlinedIcon from '@material-ui/icons/PostAddOutlined';
import TabPanel from '../../../components/TabPanel';
import FormDialog from '../../../components/FormDialog';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import {PageTitle} from '../../../components';
import CompletedForms from './CompletedForms';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import EmptyForms from './EmptyForms';
import {shareOnWhatsapp, capitalize} from '../../../utils';
import api from '../../../api';
import {EnumShareWhatsappEndpoints} from '../../../global';

import './styles.css';

export default function ListMedicalForms({history}) {
    const feedback = useFeedback();
    const [tab, setTab] = React.useState(0);
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [receiver, setReceiver] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [patientInformation, setPatientInformation] = useState(null);

    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    function handleOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    // Solicita formulário sem cotação
    async function handleRequestForm() {
        setSubmitted(true);

        // Se o receptor não for informado, anular
        if(!receiver) {
            return;
        }

        setProcessing(true);
        try {
            const response = await api.post('/medical-forms/empty', {
                receiver: capitalize(receiver.trim(), true),
            });
            setPatientInformation(response.data);
            setProcessing(false);
            feedback.open({
                severity: 'success',
                msg: 'Formulário Criado!',
            });
        } catch (error) {
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro!',
            });
            console.error(error);
            setProcessing(false);
        }
    }

    // Enviar formulário sem associação de cotação
    function handleSend() {
        shareOnWhatsapp(`${EnumShareWhatsappEndpoints.FORMS}/medical-forms/${patientInformation.id}/patient`);
        handleClose();
        setReceiver(null);
        setSubmitted(false);
        setPatientInformation(null);
    }

    async function handleExit() {
        handleClose();

        // Se for cancelado e formulário tiver sido criado, excluir
        if(submitted && patientInformation) {
            await api.delete(`/patient-information/${patientInformation.id}/delete`);
        }

        // Resetar o form dialog para o estado inicial
        setReceiver(null);
        setSubmitted(false);
        setPatientInformation(null);
    }

    const handleChangeTab = (event, tab) => {
        setTab(tab);
    };

    return(
        <WrapperContent>
            <FormDialog 
                open={open} 
                processing={processing}
                submitted={submitted && patientInformation}
                title="Solicitar formulário médico"
                msg="Por favor, informe abaixo quem irá receber este formulário."
                handleClickOpen={handleOpen} 
                handleClose={handleExit} 
                handleSubmit={handleRequestForm}
                handleSend={handleSend}
            >
                {submitted && patientInformation ? (
                    <p>O código de controle é <strong>#{patientInformation.code}</strong></p>
                ) : (
                    !processing && (
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Nome do receptor"
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                            error={submitted && !receiver}
                            textE
                            type="text"
                            fullWidth
                            placeholder="Informe o nome do receptor"
                            helperText={(submitted && !receiver) && 'Este campo não pode ser vazio.'}
                        />
                    )
                )}
            </FormDialog>
            <section>
                <FlexSpaceBetween>
                    <PageTitle title="Formulários médicos" subtitle="Informações médicas de pacientes" />
                    <Tooltip title="Criar novo formulário">
                        <IconButton onClick={() => handleOpen()}>
                            <PostAddOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </FlexSpaceBetween>
            
                <Tabs
                    value={tab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChangeTab}
                    aria-label="disabled tabs example"
                >
                    <Tab label="Aguardando preenchimento" />
                    <Tab label="Preenchidos" />
                </Tabs>
                <TabPanel value={tab} index={0}>
                    <EmptyForms history={history} />
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <CompletedForms history={history} />
                </TabPanel>
            </section>
        </WrapperContent>
    );
}