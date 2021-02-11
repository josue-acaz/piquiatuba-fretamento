import React, { useState, useEffect, Fragment } from 'react';
import { Row, Col } from 'react-bootstrap';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Chip from '@material-ui/core/Chip';
import SendIcon from '@material-ui/icons/Send';
import AddIcon from '@material-ui/icons/Add';
import { makeStyles } from '@material-ui/core/styles';
import { Alert, Info, Screen } from '../../components';
import { WrapperContent } from '../../core/design';
import api from '../../api';

import './styles.css';

const useStyles = makeStyles((theme) => ({
    chip: {
      margin: theme.spacing(0.5),
    },
}));

export default function Send({ history, location }) {
    const classes = useStyles();
    const { filename, url, client_name, type_of_transport, current_date, price, context, company } = location.state;
    const [recipients, setRecipients] = useState([]);
    const [inputs, setInputs] = useState({ name: "", email: "" });
    const [id, setId] = useState(1);
    const { name, email } = inputs;
    const [submittedRecipient, setSubmittedRecipient] = useState(false);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [openInfo, setOpenInfo] = useState(false);

    // Preencher o campo nome para o cliente, na primeira vez apenas
    useEffect(() => {
        handleChange({ target: { name: "name", value: client_name } });
    }, [client_name]);

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    const goBack = () => { history.goBack() }

    const handleDelete = (chipToDelete) => () => {
        setRecipients((chips) => chips.filter((chip) => chip.id !== chipToDelete.id));
    };

    function handleAddRecipient(e) {
        e.preventDefault();
        setSubmittedRecipient(true);

        if(name && email) {
            setRecipients(recipients => [...recipients, { id, name, email }]);
            setId(id+1);
            clearRecipientForm();
        }
    }

    const clearRecipientForm = () => {
        setInputs({ name: "", email: "" });
        setSubmittedRecipient(false);
    };

    const onSendEmail = () => {
        setOpen(false);
        onOpenInfo();
        setLoading(true);
        
        api.post("/internal/quotations/email", {
            quotation_id: context.id,
            data: {
                client_name,
                type_of_transport,
                current_date,
                price
            },
            recipients,
            admin: { email: company.email, name: company.name, phone: company.phone_number },
            attachment: {
                filename,
                path: url,
                contentType: "application/pdf"
            }
        }).then(success => {
            setLoading(false);
        }).catch(err => {
            setLoading(false);
            setError(true);
        });
    };

    const onCancelEmail = () => {
        setOpen(false);
    };

    const onCloseInfo = () => {
        setOpenInfo(false);
        goBack();
    };
    
    const onOpenInfo = () => { setOpenInfo(true) };

    return(
        <WrapperContent>
            <Info 
                open={openInfo}
                loading={loading} 
                error={error} 
                onClose={onCloseInfo}
            />
            <Alert 
                open={open} 
                title="Enviar email" 
                message="Encerrar operação e enviar email(s)?" 
                onConfirm={onSendEmail} 
                onCancel={onCancelEmail}
            />
            <Screen id="send" className="send">
                <div className="actions">
                    <div onClick={goBack} className="goBack">
                        <ArrowBackIcon className="icon" />
                        <span>Voltar</span>
                    </div>

                    <div className="content">
                        <h4>Adicione os destinatários!</h4>
                        
                        <div className="recipients">
                            {recipients.length > 0 ? (
                                <React.Fragment>
                                    {recipients.map((data) => (
                                        <li key={data.id}>
                                            <Chip
                                                label={data.email}
                                                onDelete={handleDelete(data)}
                                                className={classes.chip}
                                            />
                                        </li>
                                    ))}
                                </React.Fragment>
                            ) : (
                                <p>Nenhum destinatário!</p>
                            )}
                        </div>

                        <form id="recipient-form" onSubmit={handleAddRecipient}>
                            <Row className="center-padding">
                                <Col sm="5">
                                    <input 
                                        id="name"
                                        name="name"
                                        type="text" 
                                        value={name} 
                                        placeholder="Nome" 
                                        onChange={handleChange}
                                    />
                                    {submittedRecipient && !name ? (<div className="error">Este campo não pode ser vazio!</div>) : (<></>)}
                                </Col>
                                <Col sm="5">
                                    <input 
                                        id="email"
                                        name="email"
                                        type="email" 
                                        value={email} 
                                        placeholder="Email" 
                                        onChange={handleChange}
                                    />
                                </Col>
                                <Col sm="2">
                                    <button type="submit">Adicionar<AddIcon className="icon" /></button>
                                </Col>
                            </Row>
                        </form>
                    </div>

                    <div className="group-actions">
                        <button disabled={recipients.length === 0} onClick={() => { setOpen(true) }} className="btn">Enviar <SendIcon className="icon" /></button>
                    </div>
                </div>
            </Screen>
        </WrapperContent>
    );
}