import React, {useState, useEffect} from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {useLocation} from 'react-router-dom';
import { Input, InputAdorment, Alert, Loader, Upload, GoBack } from "../../components";
import { useParams } from 'react-router-dom';
import PhoneIcon from '@material-ui/icons/Phone';
import { Radio, Select, MenuItem } from "@material-ui/core";
import { WrapperContent } from '../../core/design';
import { uniqueId } from "lodash";
import filesize from "filesize";
import ContactPhoneIcon from '@material-ui/icons/ContactPhone';
import { maskPhone, onlyNumbers, capitalize, formatDatetime } from '../../utils';
import Checkbox from '@material-ui/core/Checkbox';
import api from '../../api';
import FileList from '../../components/Upload/FileList';
import TextArea from '../../components/TextArea';
import UTILoader from '../../components/UTILoader';
import {useFeedback} from '../../core/feedback/feedback.context';
import {ufs} from '../../core/json';

import './styles.css';

const PatientInformationContainer = ({children, isAdmin}) => isAdmin ? (
    <WrapperContent>{children}</WrapperContent>
) : <Container fluid="sm">{children}</Container>;

const GetLoader = ({isAdmin}) => isAdmin ? <Loader /> : <UTILoader />;

export default function Passenger({history}) {
    const {state} = useLocation();
    const isAdmin = state ? state.admin : false;
    const feedback = useFeedback();
    const route_params = useParams();

    // route params
    const internal_quotation_id = Number(route_params.quotation_id);
    const patient_information_id = Number(route_params.patient_information_id);

    // states
    const [quotation, setQuotation] = useState(null);
    const [patientInformation, setPatientInformation] = useState(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [receiver, setReceiver] = useState(null);
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
    });

    const handleUpload = files => {
        const _uploadedFiles = files.map(file => ({
          file,
          id: uniqueId(),
          name: file.name,
          readableSize: filesize(file.size),
          preview: URL.createObjectURL(file),
          progress: 0,
          uploaded: false,
          error: false,
          url: '',
          key: '',
          size: '',
          type: '',
        }));
    
        setUploadedFiles(uploadedFiles => uploadedFiles.concat(_uploadedFiles));
        _uploadedFiles.forEach(processUpload);
    };

    const updateFile = (id, data) => {
        setUploadedFiles(uploadedFiles => uploadedFiles.map(uploadedFile => id === uploadedFile.id ? { ...uploadedFile, ...data } : uploadedFile));
    }

    useEffect(() => {
        return function cleanup() {
            uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const processUpload = uploadedFile => {
        const data = new FormData();
    
        data.append("file", uploadedFile.file, uploadedFile.name);
    
        api
          .post('/upload', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: e => {
              const progress = parseInt(Math.round((e.loaded * 100) / e.total));
    
              updateFile(uploadedFile.id, {
                progress
              });
            }
          })
          .then(response => {
            updateFile(uploadedFile.id, {
                url: response.data.url,
                key: response.data.key,
                size: response.data.size,
                type: response.data.mimetype,
                uploaded: true,
            });
          })
          .catch(() => {
            updateFile(uploadedFile.id, {
              error: true
            });
          });
    };
    
    const handleDelete = async (uploadedFile) => {
        const {id, key} = uploadedFile;
        await api.delete('/files/delete', {
            headers: {
                key,
                file_id: id,
            },
        });

        setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
    };

    const [includeMedicalReport, setIncludeMedicalReport] = useState(false);
    function handleIncludeMedicalReport(e) {
        setIncludeMedicalReport(e.target.checked);
    }

    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [sending, setSending] = useState(false);

    async function show() {
        setLoading(true);
        try {
            const response = await api.get(`/quotations/patient_informations/${patient_information_id}/show`, {
                headers: {
                    internal_quotation_id,
                },
            });
            const patient_information = response.data;
            setPatientInformation(patient_information);
            setReceiver(patient_information.receiver);

            // Preencher formulário
            Object.keys(patient_information).forEach(key => {
                // Só preencher com os valores não nulos
                if(patient_information[key]) {
                    setInputs(inputs => ({ ...inputs, [key]: patient_information[key] }));
                }
            });

            // Verificar se já existem arquivos
            if(patient_information.documents.length > 0) {
                setIncludeMedicalReport(true);
                setUploadedFiles(patient_information.documents.map(file => ({
                    id: file.id,
                    name: file.name,
                    readableSize: filesize(file.size),
                    preview: file.url,
                    uploaded: true,
                    url: file.url,
                    key: file.key,
                })));
            }

            setTimeout(() => {setLoading(false)}, 1000);
        } catch (error) {
            setTimeout(() => {setLoading(false)}, 2000);
            console.error(error);
        }
    }

    // Show quotation and medical informations
    useEffect(() => {
        show();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleChange(e) {
        let { name, value } = e.target;

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
    };

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);

        if(inputs.name &&
            inputs.companion &&
            inputs.companion_contact &&
            inputs.origin_hospital &&
            inputs.origin_doctor &&
            inputs.contact_doctor_origin &&
            inputs.destination_hospital &&
            inputs.destination_doctor &&
            inputs.contact_doctor_destination &&
            inputs.bed_number &&
            inputs.patient_age &&
            inputs.patient_weight &&
            inputs.origin_uf &&
            inputs.origin_city &&
            inputs.destination_uf && 
            inputs.destination_city) {
            
            if(includeMedicalReport) {
                if(!(uploadedFiles.length > 0)) {
                    alert('Adicione um arquivo de laudo médico, ou desmarque a opção "Incluir laudo médico"');
                    return;
                }
            }

            setOpen(true);
        } else {alert('Por favor, preencha todos os campos obrigatórios!')};
    }

    async function handleSendMedicalInformations() {
        // Se a opção de incluir laudo médico for falso, e tiver arquivos adicionados, remover.
        if(!includeMedicalReport) {
            if(uploadedFiles.length > 0) {
                uploadedFiles.map(async (uploadedFile) => await handleDelete(uploadedFile));
            }
        }

        setSending(true);
        setOpen(false);
        let data = {
            name: capitalize(inputs.name.trim()),
            companion: capitalize(inputs.companion.trim()),
            companion_contact: inputs.companion_contact,
            origin_hospital: capitalize(inputs.origin_hospital.trim()),
            origin_doctor: capitalize(inputs.origin_doctor.trim()),
            contact_doctor_origin: inputs.contact_doctor_origin.trim(),
            destination_hospital: capitalize(inputs.destination_hospital.trim()),
            destination_doctor: capitalize(inputs.destination_doctor.trim()),
            contact_doctor_destination: inputs.contact_doctor_destination.trim(),
            bed_number: inputs.bed_number.trim(),
            patient_age: Number(inputs.patient_age),
            patient_weight: Number(inputs.patient_weight),
            emergency_contact: inputs.emergency_contact,
            plan: inputs.plan,
            covid: inputs.covid,
            description: inputs.description,
            origin_uf: inputs.origin_uf,
            origin_city: inputs.origin_city,
            destination_uf: inputs.destination_uf,
            destination_city: inputs.destination_city,
        };

        // Se for incluido laudo médico
        if(includeMedicalReport) {
            // Remover os arquivos que já foram feitos upload
            data.documents = uploadedFiles.filter(uploaded_file => !!uploaded_file.file);
        }

        try {
            const response = await api.put(`/patient_informations/${patientInformation.id}/update`, data, {
                headers: {internal_quotation_id},
            });

            setPatientInformation({
                ...response.data,
                full_name: `${response.data.code} • ${response.data.receiver}`
            });

            setSending(false);
            if(isAdmin) {
                feedback.open({
                    severity: 'success',
                    msg: 'Dados atualizados com sucesso!',
                });
                show();
            } else {
                history.push('/success');
            }
        } catch (error) {
            console.error({error});
            setSending(false);
            if(isAdmin) {
                feedback.open({
                    severity: 'error',
                    msg: 'Dados não foram atualizados, ocorreu um erro!',
                });
            } else {
                history.push('/error');
            }
        }
    }

    return(
        <>
            {loading ? <GetLoader isAdmin={isAdmin} /> : (
                        sending ? <Loader title="Enviando as informações!" /> : (
                    <div className="wrapper-passenger">
                    <Alert 
                        open={open} 
                        title="Enviar informações médicas" 
                        message="Os dados estão corretos?"
                        onConfirm={handleSendMedicalInformations}
                        onCancel={() => setOpen(false)}
                    />
                        <PatientInformationContainer isAdmin={isAdmin}>

                        {patientInformation ? (
                            <div className="passenger">
                            {!isAdmin ? (
                                <>
                                    <img className="uti-logo" src="https://piquiatuba.s3-sa-east-1.amazonaws.com/uti.png" alt="uti logo" />
                                    <p className="help-text">Prezado Sr(a) <strong>{receiver}</strong>, preencha abaixo as informações referente à UTI Aérea:</p>
                    
                                    {quotation && (
                                        <>
                                            <div className="request-data">
                                                <p><strong className="client_request">Solicitante:</strong> {quotation.client_name}</p>
                                                <p><strong className="client_request">Origem:</strong> {quotation.origin_aerodrome._city.full_name}</p>
                                                <p><strong className="client_request">Destino:</strong> {quotation.destination_aerodrome._city.full_name}</p>
                                            </div>
                                        </>
                                    )}

                                    <div className="divider-form"></div>
                                </>
                            ) : (
                                <>
                                    <GoBack onClick={() => {
                                        history.goBack();
                                    }} />
                                    <div className="admin_header_info">
                                        <p className="admin_patient_information_title">{patientInformation.full_name}</p>
                                        <p className="fill_date">Preenchido em <strong>{patientInformation.fill_date ? formatDatetime(patientInformation.fill_date) : '---'}</strong></p>
                                    </div>
                                </>
                            )}
                                    
                                    <div className="planmode">
                                        <div className="radio-input">
                                            <Radio 
                                                id="particular"
                                                name="plan"
                                                className="radio" 
                                                checked={inputs.plan==='particular'}
                                                onChange={(e) => handleChange(e)}
                                                value="particular"
                                                defaultChecked
                                            />
                                            <span>Particular</span>
                                        </div>
                                        <div className="radio-input">
                                            <Radio 
                                                id="plan"
                                                name="plan"
                                                className="radio" 
                                                checked={inputs.plan==='plan'}
                                                onChange={(e) => handleChange(e)}
                                                value="plan"
                                            />
                                            <span>Plano</span>
                                        </div>
                                    </div>
                                                
                                    <form id="passenger-form" onSubmit={handleSubmit}>
                                        <p className="section-passenger">Informações do acompanhante</p>

                                        <Row className="center-padding">
                                            <Col sm="6">
                                                <label>Nome do acompanhante</label>
                                                <Input 
                                                    id="companion"
                                                    type="text" 
                                                    value={inputs.companion} 
                                                    name="companion"
                                                    placeholder="Nome do acompanhante"
                                                    onChange={handleChange} 
                                                    color="#222222"
                                                    backgroundColor="#f2f2f2"
                                                    error={submitted && !inputs.companion}
                                                />
                                            </Col>
                                            <Col sm="6">
                                                <label>Contato do acompanhante</label>
                                                <InputAdorment
                                                    id="companion_contact"
                                                    name="companion_contact"
                                                    type="text"
                                                    adorment={<ContactPhoneIcon className="icon" />}
                                                    value={inputs.companion_contact} 
                                                    onChange={handleChange}
                                                    placeholder="(00)00000-0000"
                                                    backgroundColor="#f2f2f2"
                                                    error={submitted && !inputs.companion_contact}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="center-padding">
                                            <Col sm="6">
                                                    <label>Contato de emergência (opcional)</label>
                                                    <InputAdorment
                                                        id="emergency_contact"
                                                        name="emergency_contact"
                                                        type="text"
                                                        adorment={<PhoneIcon className="icon icon-emergency-contact" />}
                                                        value={inputs.emergency_contact} 
                                                        onChange={handleChange}
                                                        placeholder="(00)00000-0000"
                                                        backgroundColor="#f2f2f2"
                                                    />
                                                </Col>
                                        </Row>
        
                                        <p className="section-passenger">informações do paciente</p>
        
                                        
                                        <Row className="center-padding">
                                            <Col sm="10">
                                            <label>Nome do paciente</label>
                                            <Input 
                                                id="name"
                                                type="text" 
                                                value={inputs.name} 
                                                name="name"
                                                placeholder="Nome do paciente"
                                                onChange={handleChange} 
                                                color="#222222"
                                                backgroundColor="#f2f2f2"
                                                error={submitted && !inputs.name}
                                            />
                                            </Col>
                                            <Col sm="2">
                                                <label>Suspeita de covid?</label>
                                                <div id="covid" className="btn-group" role="group">
                                                    <button 
                                                        id="btn_selected_covid" 
                                                        type="button" 
                                                        className={`btn ${inputs.covid ? "btn_selected_covid" : "btn_not_selected_covid"}`}
                                                        onClick={() => {
                                                            if(!inputs.covid) {
                                                                handleChange({target: {
                                                                    name: 'covid',
                                                                    value: !inputs.covid,
                                                                }});
                                                            }
                                                        }}
                                                    >
                                                        SIM
                                                    </button>
                                                    <button 
                                                        id="btn_not_selected_covid" 
                                                        type="button"
                                                        className={`btn ${!inputs.covid ? "btn_selected_covid" : "btn_not_selected_covid"}`}
                                                        onClick={() => {
                                                            if(inputs.covid) {
                                                                handleChange({target: {
                                                                    name: 'covid',
                                                                    value: !inputs.covid,
                                                                }});
                                                            }
                                                        }}
                                                    >
                                                        NÃO
                                                    </button>
                                                    </div>
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
                                                    onChange={handleChange} 
                                                    color="#222222"
                                                    backgroundColor="#f2f2f2"
                                                    error={submitted && !inputs.patient_age}
                                                />
                                            </Col>
                                            <Col sm="4">
                                                <label>Peso do paciente</label>
                                                <InputAdorment
                                                    id="patient_weight"
                                                    name="patient_weight"
                                                    type="text"
                                                    adorment={<p>Kg</p>}
                                                    adormentPosition="end"
                                                    value={inputs.patient_weight} 
                                                    onChange={handleChange}
                                                    placeholder="Ex.: 72.5"
                                                    backgroundColor="#f2f2f2"
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
                                                    onChange={handleChange} 
                                                    color="#222222"
                                                    backgroundColor="#f2f2f2"
                                                    error={submitted && !inputs.bed_number}
                                                />
                                            </Col>
                                        </Row>
        
                                        <p className="section-passenger">Informações do hospital de origem</p>
                                        <Row className="center-padding">
                                            <Col sm="4">
                                                <label>Hospital de Origem</label>
                                                <Input 
                                                    id="origin_hospital"
                                                    type="text" 
                                                    value={inputs.origin_hospital} 
                                                    name="origin_hospital"
                                                    placeholder="Hospital de origem"
                                                    onChange={handleChange} 
                                                    color="#222222"
                                                    backgroundColor="#f2f2f2"
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
                                                    onChange={handleChange} 
                                                    color="#222222"
                                                    backgroundColor="#f2f2f2"
                                                    error={submitted && !inputs.origin_doctor}
                                                />
                                            </Col>
                                            <Col sm="4">
                                                <label>Contato do médico de origem</label>
                                                <InputAdorment
                                                    id="contact_doctor_origin"
                                                    name="contact_doctor_origin"
                                                    type="text"
                                                    adorment={<PhoneIcon className="icon" />}
                                                    value={inputs.contact_doctor_origin} 
                                                    onChange={handleChange}
                                                    placeholder="(00)00000-0000"
                                                    backgroundColor="#f2f2f2"
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
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem disabled value="">
                                                        <em>Estado de origem...</em>
                                                    </MenuItem>
                                                    {ufs.map(uf => <MenuItem value={uf.sigla}>{uf.sigla}</MenuItem>)}
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
                                                    onChange={handleChange} 
                                                    color="#222222"
                                                    backgroundColor="#f2f2f2"
                                                    error={submitted && !inputs.origin_city}
                                                />
                                            </Col>
                                        </Row>

                                        <p className="section-passenger">Informações do hospital de destino</p>
                                        <Row className="center-padding">
                                            <Col sm="4">
                                                <label>Hospital de destino</label>
                                                <Input 
                                                    id="destination_hospital"
                                                    type="text" 
                                                    value={inputs.destination_hospital} 
                                                    name="destination_hospital"
                                                    placeholder="Hospital de destino"
                                                    onChange={handleChange} 
                                                    color="#222222"
                                                    backgroundColor="#f2f2f2"
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
                                                    onChange={handleChange} 
                                                    color="#222222"
                                                    backgroundColor="#f2f2f2"
                                                    error={submitted && !inputs.destination_doctor}
                                                />
                                            </Col>
                                            <Col sm="4">
                                                <label>Contato do médico de destino</label>
                                                <InputAdorment
                                                    id="contact_doctor_destination"
                                                    name="contact_doctor_destination"
                                                    type="text"
                                                    adorment={<PhoneIcon className="icon" />}
                                                    value={inputs.contact_doctor_destination} 
                                                    onChange={handleChange}
                                                    placeholder="(00)00000-0000"
                                                    backgroundColor="#f2f2f2"
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
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem disabled value="">
                                                        <em>Estado de destino...</em>
                                                    </MenuItem>
                                                    {ufs.map(uf => <MenuItem value={uf.sigla}>{uf.sigla}</MenuItem>)}
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
                                                    onChange={handleChange} 
                                                    color="#222222"
                                                    backgroundColor="#f2f2f2"
                                                    error={submitted && !inputs.destination_city}
                                                />
                                            </Col>
                                        </Row>
        
                                        <p className="section-passenger">Informações adicionais</p>
                                        <Row className="center-padding">
                                            <Col sm="12">
                                                <div className="include-ldm">
                                                    <Checkbox
                                                        className="check-ldm"
                                                        checked={includeMedicalReport}
                                                        onChange={handleIncludeMedicalReport}
                                                        inputProps={{ 'aria-label': 'primary checkbox' }}
                                                    />
                                                    <p>Incluir laudo médico? <strong>{includeMedicalReport ? 'SIM' : 'NÃO'}</strong></p>
                                                </div>
                                                {includeMedicalReport && (
                                                    <>
                                                        <p className="anex_laudo_title">(Anexo) Laudo Médico</p>
                                                        <p>Fotos legíveis ou documento (PDF) do laudo médico.</p>
                                                        <Upload onUpload={handleUpload} />
                                                        {!!uploadedFiles.length && (
                                                            <FileList files={uploadedFiles} onDelete={handleDelete} />
                                                        )}
                                                    </>
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
                                                    onChange={handleChange} 
                                                    placeholder="Descreva aqui as observações."
                                                />
                                            </Col>
                                        </Row>

                                        <button 
                                            className="passenger-button"
                                            type="submit"
                                        >
                                            {patientInformation.name ? 'Atualizar informações' : 'Enviar informações'}
                                        </button>
                                    </form>
                                </div>
                        ) : (
                            <div className="form-not-exists">
                                <p>O formulário solicitado não existe!</p>
                            </div>
                        )}     
                        </PatientInformationContainer>
                    </div>
                )
            )}
        </>
    );
}