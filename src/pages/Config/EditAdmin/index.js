import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
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
    const {admin_id} = useParams();
    const edit = admin_id !== '0';
    const [submitted, setSubmitted] = useState(false);
    const [admin, setAdmin] = useState(null);
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
        async function show() {
            try {
                const response = await api.get(`/admins/${admin_id}/show`);
                setAdmin(response.data);
                const {sector, user: {
                    name,
                    email,
                    phone_number,
                }} = response.data;

                const form = {
                    name,
                    email,
                    phone_number,
                    sector,
                    password: '',
                };

                Object.keys(form).forEach(key => {
                    const form_el = form[key];
                    setInputs(inputs => ({ ...inputs, [key]: form_el }));
                });
            } catch (error) {
                console.error(error);
            }
        }

        show();
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
            inputs.phone_number) {

            if(!edit) {
                if(!inputs.password) {
                    return;
                }
            }

            setOpen(true);
        }
    }

    async function handleAdd() {
        setProcessing(true);

        const data_user = {
            name: inputs.name.trim(),
            email: inputs.email,
            phone_number: inputs.phone_number,
            password: inputs.password,
        };

        const data_admin = {
            sector: inputs.sector.trim(),
        };

        try {
            if(edit) {
                await api.put(`/admins/${admin.user.id}/update`, {
                    user: data_user,
                    admin: data_admin,
                });
            } else {
                await api.post('/admins', {
                    ...data_admin,
                    ...data_user,
                });
                history.goBack();
            }

            setProcessing(false);
            setOpen(false);
            feedback.open({
                severity: 'success',
                msg: 'Operação realizada com sucesso!'
            });
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
                title={edit ? 'Alterar dados?' : 'Adicionar novo adminstrador?'}
                message={edit ? 'Os dados serão alterados!' : `A adminstrador ${inputs.name} será adicionado!`}
                processingTitle="Salvando..."
                processingMsg="Por favor, aguarde!"
                onConfirm={handleAdd}
                onCancel={() => setOpen(false)}
            />

            <GoBack onClick={goBack} />
            <PageTitle title={edit ? 'Editar administrador' : 'Novo administrador'} subtitle="Dados do administrador" />
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
                                    error={(submitted && !inputs.password) && !edit}
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