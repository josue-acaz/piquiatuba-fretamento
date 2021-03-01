import React, {useState, useEffect} from 'react';
import {WrapperContent, Card} from '../../../core/design';
import {Row, Col} from 'react-bootstrap';
import {Input, InputAdorment, GoBack, PageTitle, Alert} from '../../../components';
import PhoneIcon from '@material-ui/icons/Phone';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import Button from '../../../components/Button';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';
import IconButton from '@material-ui/core/IconButton';
import {maskPhone} from '../../../utils';
import {useFeedback} from '../../../core/feedback/feedback.context';
import api from '../../../api';

import './styles.css';

export default function EditAdmin({history}) {
    const [submitted, setSubmitted] = useState(false);
    const [inputs, setInputs] = useState({
        name: '',
        email: '',
        sector: '',
        phone_number: '',
        password: '',
    });

    const [visiblePassword, setVisiblePassword] = useState(false);
    function toggleVisible() {
        setVisiblePassword(!visiblePassword);
    }

    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const feedback = useFeedback();

    function handleChange(e) {
        let {name, value} = e.target;

        if(name === 'phone_number') {
            if(value.length > 14) {
                return;
            }

            value = maskPhone(value);
        }

        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    useEffect(() => {
        
    }, []);

    function goBack() {
        history.goBack();
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);

        if(inputs.name &&
            inputs.email &&
            inputs.sector &&
            inputs.phone_number &&
            inputs.password) {
            setOpen(true);
        }
    }

    async function handleAdd() {
        setProcessing(true);

        const data = {
            name: inputs.name.trim(),
            email: inputs.email,
            phone_number: inputs.phone_number,
            sector: inputs.sector.trim(),
            password: inputs.password,
        };

        try {
            await api.post('/admins', data);
            setProcessing(true);
            feedback.open({
                severity: 'success',
                msg: 'Operação realizada com sucesso!'
            });

            history.goBack();
        } catch (error) {
            console.error(error);
            setProcessing(true);
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro!'
            });
        }
    }

    return(
        <WrapperContent className="admin">
            <Alert 
                open={open} 
                processing={processing}
                title="Adicionar novo adminstrador?"
                message={`A adminstrador ${inputs.name} será adicionado!`}
                processingTitle="Salvando..."
                processingMsg="Por favor, aguarde!"
                onConfirm={handleAdd}
                onCancel={() => setOpen(false)}
            />

            <GoBack onSubmit={goBack} />
            <PageTitle title="Novo administrador" subtitle="Adicionar ou editar administradores" />
            <section id="add-admin" className="add-admin">
                <Card>
                    <form id="form-admin" onSubmit={handleSubmit}>
                        <Row className="center-padding">
                            <Col sm="12">
                                <label>Nome</label>
                                <Input 
                                    name="name" 
                                    type="text" 
                                    value={inputs.name}
                                    onChange={handleChange} 
                                    placeholder="Nome completo"
                                    error={submitted && !inputs.name}
                                />
                            </Col>
                        </Row>
                        <Row className="center-padding">
                            <Col sm="6">
                                <label>Email</label>
                                <InputAdorment 
                                    name="email" 
                                    type="text" 
                                    decoration="secondary"
                                    value={inputs.email}
                                    onChange={handleChange} 
                                    adormentPosition="start"
                                    placeholder="Endereço de email"
                                    adorment={<MailOutlineIcon className="icon" />}
                                    error={submitted && !inputs.email}
                                />
                            </Col>
                            <Col sm="6">
                                <label>Número de telefone</label>
                                <InputAdorment 
                                    name="phone_number" 
                                    type="text" 
                                    decoration="secondary"
                                    value={inputs.phone_number}
                                    onChange={handleChange} 
                                    placeholder="Número de telefone"
                                    adormentPosition="start"
                                    adorment={<PhoneIcon className="icon" />}
                                    error={submitted && !inputs.phone_number}
                                />
                            </Col>
                        </Row>
                        <Row className="center-padding">
                            <Col sm="6">
                                <label>Setor</label>
                                <Input 
                                    name="sector" 
                                    type="text" 
                                    value={inputs.sector}
                                    onChange={handleChange}
                                    placeholder="Setor do adminstrador"
                                    error={submitted && !inputs.sector}
                                />
                            </Col>
                            <Col sm="6">
                                <label>Senha</label>
                                <InputAdorment 
                                    name="password" 
                                    decoration="secondary"
                                    type={visiblePassword ? 'text' : 'password'} 
                                    value={inputs.password}
                                    onChange={handleChange} 
                                    placeholder="Senha de acesso"
                                    adormentPosition="end"
                                    adorment={
                                        <IconButton onClick={toggleVisible}>
                                            {visiblePassword ? <VisibilityIcon className="icon" /> : <VisibilityOffIcon className="icon" />}
                                        </IconButton>
                                    }
                                    error={submitted && !inputs.password}
                                />
                            </Col>
                        </Row>

                        <Button type="submit">Salvar</Button>
                    </form>
                </Card>
            </section>
        </WrapperContent>
    );
}