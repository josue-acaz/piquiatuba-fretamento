import React, {useState} from 'react';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import Autocompletar from '../../../components/Autocompletar';
import { Row, Col } from 'react-bootstrap';
import { PageTitle, GoBack, Input, Button, Alert } from "../../../components";
import { WrapperContent } from '../../../core/design';
import { baseURL } from '../../../global';
import { useFeedback } from '../../../core/feedback/feedback.context';
import api from '../../../api';

import './styles.css';

export default function AddBase({history}) {
    const feedback = useFeedback();
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [inputs, setInputs] = useState({
        name: '',
        latitude: '',
        longitude: '',
        aerodrome_id: '',
    });

    function handleGoBack() {
        history.goBack();
    }
    
    function handleChange(e) {
        const {name, value} = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    function handleOptionSelected(op) {
        handleChange({target: {
            name: 'aerodrome_id',
            value: op.id,
        }});
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);

        if(
            inputs.name && 
            inputs.latitude && 
            inputs.longitude && 
            inputs.aerodrome_id) {
            setOpen(true);
        }
    }

    async function handleAdd() {
        const data = {
            name: inputs.name.trim(),
            latitude: Number(inputs.latitude),
            longitude: Number(inputs.longitude),
        };

        setProcessing(true);
        try {
            await api.post('/bases', data, {
                headers: {
                    aerodrome_id: inputs.aerodrome_id,
                }
            });
            setProcessing(false);
            setOpen(false);
            feedback.open({
                severity: 'success',
                msg: 'Base adicionada com sucesso!',
            });
            history.goBack();
        } catch (error) {
            setProcessing(false);
            setOpen(false);
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro!',
            });
            console.error(error);
        }
    }

    return(
        <WrapperContent>
            <Alert 
                open={open} 
                processing={processing}
                title="Adicionar nova base?"
                message={`A base ${inputs.name} será adicionada!`}
                processingTitle="Adicionando base..."
                processingMsg="Por favor, aguarde!"
                onConfirm={handleAdd}
                onCancel={() => setOpen(false)}
            />
            <section id="new-base" className="new-base">
                <GoBack onClick={handleGoBack} />
                <PageTitle title="Nova base" subtitle="Piquiatuba Táxi Aéreo" />
            </section>

            <form id="new-base-form" onSubmit={handleSubmit}>
                <Row className="center-padding">
                    <Col sm="8">
                        <label>Nome da base</label>
                        <Input  
                            name="name" 
                            value={inputs.name}
                            placeholder="Ex.: Santarém"
                            onChange={handleChange} 
                            decoration="primary"
                            error={submitted && !inputs.name}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Aeródromo</label>
                        <Autocompletar 
                            params={{
                                uf: 'PA',
                                city: '',
                            }}
                            Icon={LocationOnIcon}
                            endpoint={baseURL+'/aerodromes/autocomplete'}
                            renderOption={(op) => (<div>{op.full_name}</div>)} 
                            onOptionSelected={handleOptionSelected}
                            placeholder="Escolha o aeródromo onde está a base..."
                            error={submitted && !inputs.aerodrome_id}
                        />
                    </Col>
                    <Col sm="6">
                        <label>Latitude</label>
                        <Input  
                            name="latitude" 
                            decoration="primary"
                            value={inputs.latitude}
                            placeholder="Ex.: -56.940"
                            onChange={handleChange} 
                            error={submitted && !inputs.latitude}
                        />
                    </Col>
                    <Col sm="6">
                        <label>Longitude</label>
                        <Input  
                            name="longitude" 
                            decoration="primary"
                            value={inputs.longitude}
                            placeholder="Ex.: -52.840"
                            onChange={handleChange} 
                            error={submitted && !inputs.longitude}
                        />
                    </Col>
                </Row>
            
                <Button type="submit">Salvar</Button>
            </form>
        </WrapperContent>
    );
}
