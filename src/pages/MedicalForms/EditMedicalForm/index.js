/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {Row, Col} from 'react-bootstrap';
import filesize from 'filesize';
import {WrapperContent, FlexContent, Card} from '../../../core/design';
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import PhoneIcon from '@material-ui/icons/Phone';
import Divider from '@material-ui/core/Divider';
import Switch from '@material-ui/core/Switch';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import Uploader from '../../../components/Uploader';
import Button from '@material-ui/core/Button';
import TextArea from '../../../components/TextArea';
import {
    PageTitle, 
    GoBack, 
    Input,
} from '../../../components';
import {maskPhone, onlyNumbers} from '../../../utils';
import {ufs} from '../../../core/json';
import api from '../../../api';

import './styles.css';

export default function EditMedicalForm({history}) {
    const {patient_information_id} = useParams();
    const [loading, setLoading] = useState(true);
    const [patientInformation, setPatientInformation] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [files, setFiles] = useState([]);
    const [submit, setSubmit] = useState(false);
    const [inputs, setInputs] = useState({
        name: '',
        companion: '',
        companion_contact: '',
        origin_hospital: '',
        origin_doctor: '',
        contact_doctor_origin: '',
        destination_hospital: '',
        destination_doctor: '',
        contact_doctor_destination: '',
        bed_number: '',
        patient_age: '',
        patient_weight: '',
        emergency_contact: '',
        description: '',
        covid: false,
        plan: 'particular',
        origin_uf: '',
        origin_city: '',
        destination_uf: '',
        destination_city: '',
        include_medical_report: false,
    });

    async function show() {
        try {
            const response = await api.get(`/medical-forms/${patient_information_id}/show`);
            const patient_information = response.data;
            setPatientInformation(patient_information);
            if(patient_information.fill_date) {
                fillForm(patient_information);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    }

    function fillForm(patient_information) {
        console.log({patient_information});
        Object.keys(patient_information).forEach(key => {
            let value = patient_information[key];
            
            if(key === 'documents') {
                console.log(value);
                if(value.length > 0) {
                    setInputs(inputs => ({ ...inputs, include_medical_report: true }));
                    setFiles(value.map(file => ({
                        id: file.id,
                        file_id: file.id,
                        name: file.name,
                        readableSize: filesize(file.size),
                        preview: file.url,
                        progress: 100,
                        uploaded: true,
                        error: false,
                        url: file.url,
                        key: file.key,
                        size: file.size,
                        type: file.mimetype,
                    })));
                }
                return;
            }
            
            setInputs(inputs => ({ ...inputs, [key]: value }));
        });
    }

    function handleChangeValue(e) {
        let {name='', value} = e.target;

        // Aplicar mascaras
        if(
            name === 'contact_doctor_origin' || 
            name === 'contact_doctor_destination' || 
            name === 'emergency_contact' ||
            name === 'companion_contact'
        ) {
            value = maskPhone(value);
            if(value.length > 14) {
                return;
            }
        } else if(name === 'patient_age' || name === 'bed_number') {
            value = onlyNumbers(value, true);
        } else if(name === 'patient_weight') {
            value = onlyNumbers(value);
        }

        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    function handleChangeChecked(e, checked) {
        const {name} = e.target;
        setInputs(inputs => ({ ...inputs, [name]: checked }));
    }

    useEffect(() => {
        show();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
    }

    return(
        <WrapperContent className="wrapper-medical-form" color="#f2f2f2">
            <GoBack onClick={() => history.goBack()} />
            {!loading && <PageTitle title={patientInformation.full_name} subtitle="Editar formulário" />}
        
            {loading ? <p>Carregando...</p> : (
                <Card>
                    <form id="medical-form" onSubmit={handleSubmit}>
                        <Row className="center-padding">
                            <Col sm="6">
                                <label>Nome do acompanhante</label>
                                <Input 
                                    id="companion"
                                    type="text" 
                                    value={inputs.companion} 
                                    name="companion"
                                    placeholder="Nome do acompanhante"
                                    onChange={handleChangeValue} 
                                    error={submitted && !inputs.companion}
                                />
                            </Col>
                            <Col sm="6">
                                <label>Contato do acompanhante</label>
                                <Input
                                    id="companion_contact"
                                    name="companion_contact"
                                    type="text"
                                    adorment={<ContactPhoneIcon/>}
                                    value={inputs.companion_contact} 
                                    onChange={handleChangeValue}
                                    placeholder="(00)00000-0000"
                                    error={submitted && !inputs.companion_contact}
                                />
                            </Col>
                        </Row>
                        <Row className="center-padding">
                            <Col sm="6">
                                <label>Contato de emergência (opcional)</label>
                                <Input
                                    id="emergency_contact"
                                    name="emergency_contact"
                                    type="text"
                                    adorment={<PhoneIcon className="emergency-icon" />}
                                    value={inputs.emergency_contact} 
                                    onChange={handleChangeValue}
                                    placeholder="Informe um contato em caso de emergência"
                                />
                            </Col>
                        </Row>

                        <div className="divider-form">
                            <Divider />
                        </div>
                        <p className="section-title">informações do paciente</p>
                        
                        <Row className="center-padding">
                            <Col sm="8">
                            <label>Nome do paciente</label>
                            <Input 
                                id="name"
                                type="text" 
                                value={inputs.name} 
                                name="name"
                                placeholder="Nome do paciente"
                                onChange={handleChangeValue} 
                                error={submitted && !inputs.name}
                            />
                            </Col>
                            <Col sm="4">
                                <label>Suspeita de covid?</label>
                                <FlexContent>
                                <Switch 
                                    id="covid"
                                    name="covid"
                                    checked={inputs.covid} 
                                    onChange={handleChangeChecked} 
                                    color="secondary" 
                                />
                                <p><strong>{inputs.covid ? 'SIM' : 'NÃO'}</strong></p>
                            </FlexContent>
                            </Col>
                        </Row>
                        <Row className="center-padding">
                            <Col sm="4">
                                <label>Idade do paciente</label>
                                <Input 
                                    id="patient_age"
                                    type="text" 
                                    value={inputs.patient_age} 
                                    name="patient_age"
                                    placeholder="Ex.: 32"
                                    onChange={handleChangeValue} 
                                    error={submitted && !inputs.patient_age}
                                />
                            </Col>
                            <Col sm="4">
                                <label>Peso do paciente</label>
                                <Input
                                    id="patient_weight"
                                    name="patient_weight"
                                    type="text"
                                    adorment={<p>Kg</p>}
                                    adormentPosition="end"
                                    value={inputs.patient_weight} 
                                    onChange={handleChangeValue}
                                    placeholder="Ex.: 72.5"
                                    error={submitted && !inputs.patient_weight}
                                />
                            </Col>
                            <Col sm="4">
                                <label>Número do leito</label>
                                <Input 
                                    id="bed_number"
                                    type="text" 
                                    value={inputs.bed_number} 
                                    name="bed_number"
                                    placeholder="Ex.: 12"
                                    onChange={handleChangeValue} 
                                    error={submitted && !inputs.bed_number}
                                />
                            </Col>
                        </Row>

                        <div className="divider-form">
                            <Divider />
                        </div>
                        <p className="section-title">Informações do hospital de origem</p>
                        
                        <Row className="center-padding">
                            <Col sm="4">
                                <label>Hospital de Origem</label>
                                <Input 
                                    id="origin_hospital"
                                    type="text" 
                                    value={inputs.origin_hospital} 
                                    name="origin_hospital"
                                    placeholder="Hospital de origem"
                                    onChange={handleChangeValue} 
                                    error={submitted && !inputs.origin_hospital}
                                />
                            </Col>
                            <Col sm="4">
                                <label>Nome do médico do hospital de origem</label>
                                <Input 
                                    id="origin_doctor"
                                    type="text" 
                                    value={inputs.origin_doctor} 
                                    name="origin_doctor"
                                    placeholder="Médico do hospital de origem"
                                    onChange={handleChangeValue} 
                                    error={submitted && !inputs.origin_doctor}
                                />
                            </Col>
                            <Col sm="4">
                                <label>Contato do médico de origem</label>
                                <Input
                                    id="contact_doctor_origin"
                                    name="contact_doctor_origin"
                                    type="text"
                                    adorment={<PhoneIcon className="icon" />}
                                    value={inputs.contact_doctor_origin} 
                                    onChange={handleChangeValue}
                                    placeholder="Número de telefone do doutor de origem"
                                    error={submitted && !inputs.contact_doctor_origin}
                                />
                            </Col>
                        </Row>
                        <Row className="center-padding">
                            <Col sm="4">
                                <label>Estado de Origem</label>
                                <Select 
                                    id="origin_uf" 
                                    name="origin_uf" 
                                    className="select" 
                                    displayEmpty
                                    value={inputs.origin_uf}
                                    disableUnderline={true}
                                    onChange={handleChangeValue}
                                >
                                    <MenuItem disabled value="">
                                        <em>Estado de origem...</em>
                                    </MenuItem>
                                    {ufs.map((uf, index) => <MenuItem key={index} value={uf.sigla}>{uf.sigla}</MenuItem>)}
                                </Select>
                                {(submitted && !inputs.origin_uf) && <span className="error">Este campo é obrigatório.</span>}
                            </Col>
                            <Col sm="8">
                                <label>Cidade de Origem</label>
                                <Input 
                                    id="origin_city"
                                    type="text" 
                                    value={inputs.origin_city} 
                                    name="origin_city"
                                    placeholder="Nome da cidade de origem"
                                    onChange={handleChangeValue} 
                                    error={submitted && !inputs.origin_city}
                                />
                            </Col>
                        </Row>

                        <div className="divider-form">
                            <Divider />
                        </div>
                        <p className="section-title">Informações do hospital de destino</p>
                        
                        <Row className="center-padding">
                            <Col sm="4">
                                <label>Hospital de destino</label>
                                <Input 
                                    id="destination_hospital"
                                    type="text" 
                                    value={inputs.destination_hospital} 
                                    name="destination_hospital"
                                    placeholder="Hospital de destino"
                                    onChange={handleChangeValue} 
                                    error={submitted && !inputs.destination_hospital}
                                />
                            </Col>
                            <Col sm="4">
                                <label>Nome do médico do hospital de destino</label>
                                <Input 
                                    id="destination_doctor"
                                    type="text" 
                                    value={inputs.destination_doctor} 
                                    name="destination_doctor"
                                    placeholder="Médico do hospital de destino"
                                    onChange={handleChangeValue} 
                                    error={submitted && !inputs.destination_doctor}
                                />
                            </Col>
                            <Col sm="4">
                                <label>Contato do médico de destino</label>
                                <Input
                                    id="contact_doctor_destination"
                                    name="contact_doctor_destination"
                                    type="text"
                                    adorment={<PhoneIcon className="icon" />}
                                    value={inputs.contact_doctor_destination} 
                                    onChange={handleChangeValue}
                                    placeholder="Número de telefone do médico de destino"
                                    error={submitted && !inputs.contact_doctor_destination}
                                />
                            </Col>
                        </Row>
                        <Row className="center-padding">
                            <Col sm="4">
                                <label>Estado de Destino</label>
                                <Select 
                                    id="destination_uf" 
                                    name="destination_uf" 
                                    className="select" 
                                    displayEmpty
                                    value={inputs.destination_uf}
                                    disableUnderline={true}
                                    onChange={handleChangeValue}
                                >
                                    <MenuItem disabled value="">
                                        <em>Estado de destino...</em>
                                    </MenuItem>
                                    {ufs.map((uf, index) => <MenuItem key={index} value={uf.sigla}>{uf.sigla}</MenuItem>)}
                                </Select>
                                {(submitted && !inputs.destination_uf) && <span className="error">Este campo é obrigatório.</span>}
                            </Col>
                            <Col sm="8">
                                <label>Cidade de Destino</label>
                                <Input 
                                    id="destination_city"
                                    type="text" 
                                    value={inputs.destination_city} 
                                    name="destination_city"
                                    placeholder="Nome da cidade de destino"
                                    onChange={handleChangeValue} 
                                    error={submitted && !inputs.destination_city}
                                />
                            </Col>
                        </Row>

                        <div className="divider-form">
                            <Divider />
                        </div>
                        <p className="section-title">Informações adicionais</p>
                        
                        <Row className="center-padding medical-reporter">
                            <Col sm="12">
                                <FlexContent>
                                    <Checkbox
                                        id="include_medical_report"
                                        name="include_medical_report"
                                        checked={inputs.include_medical_report}
                                        onChange={handleChangeChecked}
                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                    />
                                    <p>Incluir laudo médico? <strong>{inputs.include_medical_report ? 'SIM' : 'NÃO'}</strong></p>
                                </FlexContent>

                                {inputs.include_medical_report && (
                                    <Uploader 
                                        initialFiles={files}
                                        uploading={(uploading) => setSubmit(!uploading)} 
                                        getUploadedFiles={(files) => {
                                            console.log({files});
                                            setFiles(files.filter(file => !file.error));
                                        }} 
                                        fileName="file" 
                                    />
                                )}
                            </Col>
                        </Row>

                        <Row className="center-padding">
                            <Col sm="12">
                                <label>Observações (opcional)</label>
                                <TextArea 
                                    id="description" 
                                    name="description" 
                                    value={inputs.description} 
                                    onChange={handleChangeValue} 
                                    placeholder="Descreva aqui as observações."
                                />
                            </Col>
                        </Row>
                    
                        <Button id="submit-button" disabled={!submit} type="submit" variant="contained" color="primary">Enviar</Button>
                    </form>
                </Card>
            )}
        </WrapperContent>
    );
}