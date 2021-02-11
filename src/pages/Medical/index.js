import React, {useState, useEffect} from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { useSelector } from 'react-redux';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import IconButton from '@material-ui/core/IconButton';
import PostAddOutlinedIcon from '@material-ui/icons/PostAddOutlined';
import TableTask from '../../components/TableTask';
import TextField from '@material-ui/core/TextField';
import { PageTitle, TabPanel, TransitionDialog, FacebookCircularProgress, VerticalTable, Alert } from "../../components";
import FormDialog from '../../components/FormDialog';
import { WrapperContent } from '../../core/design';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import EditIcon from '@material-ui/icons/Edit';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import {formatDatetime, shareOnWhatsapp, capitalize, normalizeString, currency} from '../../utils';
import AutocompleteDialog from '../../components/AutocompleteDialog';
import {useFeedback} from '../../core/feedback/feedback.context';
import api from '../../api';
import serverless from '../../serverless';

import './styles.css';

function QuotationAttach({patient_information, index}) {
    const feedback = useFeedback();
    const [attaching, setAttaching] = useState(false);
    const [patientInformation, setPatientInformation] = useState(patient_information);
    const [open, setOpen] = useState({
        autocomplete: false,
        quotation: false,
    });
    function toggleOpen(key) {
        setOpen(open => ({ ...open, [key]: !open[key] }));
    }

    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleSetAnchorEl = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    function handleAttachAction(e) {
        // Se já existe uma cotação anexada, mostrar menu de ações
        if(patientInformation.internal_quotation) {
            handleSetAnchorEl(e);
        } else { // Se não, mostrar autocomplete
            toggleOpen('autocomplete');
        }
    }

    function attachQuotation(internal_quotation) {
        setPatientInformation(
            patientInformation => ({ 
                ...patientInformation, 
                internal_quotation: internal_quotation,
            })
        );
    }

    async function handleSelectedQuotation(internal_quotation, index) {
        toggleOpen('autocomplete');

        // Verifica se a referência para a cotação é válida
        if(internal_quotation) {
            setAttaching(true);
            
            try {
                await api.put(`/patient-informations/${patient_information.id}/attach-quotation`, {
                    internal_quotation_id: internal_quotation.id,
                });

                attachQuotation(internal_quotation);
                setAttaching(false);

                feedback.open({
                    severity: 'success',
                    msg: 'Cotação anexada com sucesso!',
                });
            } catch (error) {
                setAttaching(false);
                console.error(error);
                feedback.open({
                    severity: 'error',
                    msg: error.response ? error.response.data.msg : 'Ocorreu um erro!',
                });
            }
        }
    }

    function handleChangeQuotation() {
        handleClose();
        toggleOpen('autocomplete');
    }
    
    function handleShowQuotation() {
        handleClose();
        toggleOpen('quotation');
    }

    return(
        <>
            <AutocompleteDialog 
                handleClose={() => toggleOpen('autocomplete')} 
                open={open.autocomplete} 
                handleSelectedOption={handleSelectedQuotation}
            />
            {(patientInformation.internal_quotation && !attaching) && (
                <TransitionDialog open={open.quotation} title={patientInformation.internal_quotation.name} handleClose={() => toggleOpen('quotation')}>
                    <p><strong>Cliente:  </strong>{patientInformation.internal_quotation.client_name}</p>
                    <p><strong>Origem: </strong>{patientInformation.internal_quotation.origin_aerodrome.full_name} ({patientInformation.internal_quotation.origin_aerodrome.city_uf})</p>
                    <p><strong>Destino: </strong>{patientInformation.internal_quotation.destination_aerodrome.full_name} ({patientInformation.internal_quotation.destination_aerodrome.city_uf})</p>
                    <p><strong>Preço cotado: </strong>{currency(patientInformation.internal_quotation.price)}</p>
                </TransitionDialog>
            )}
            <Tooltip onClick={handleAttachAction} title="Clique para anexar cotação">
                <div className="ref_quotation">
                    {attaching ? <div className="auto-dialog-loader"></div> : (
                        patientInformation.internal_quotation ? <p><strong>{normalizeString(patientInformation.internal_quotation.name)}</strong></p> : <p>Nenhuma</p>
                    )}
                </div>
            </Tooltip>
            {patientInformation.internal_quotation && (
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleShowQuotation}>Ver cotação</MenuItem>
                    <MenuItem onClick={handleChangeQuotation}>Alterar cotação</MenuItem>
                </Menu>
            )}
        </>
    );
}

function CompletedForms({history}) {
    const feedback = useFeedback();
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState({
        dialog: false,
        alert: false,
    }); // dialog PDF
    function toggleOpen(key, value) {
        setOpen(open => ({ ...open, [key]: value }));
    }
    const [processing, setProcessing] = useState(false); // generating PDF
    const [rows, setRows] = useState([]);
    const [pdf, setPdf] = useState(null);
    const [selecteds, setSelecteds] = useState([]);
    const [deleting, setDeleting] = useState(false);
    const [pagination, setPagination] = useState({
        limit: 10, 
        offset: 0, 
        page: 0,
        count: 0,
        text: '',
        order: 'DESC', 
        filter: 'name', 
        orderBy:'name',
    });

    function handleEditMedicalInformation(patient_information_id, internal_quotation_id = 0) {
        history.push(`/cotações/${internal_quotation_id}/medical-informations/${patient_information_id}/passenger`, {admin: true});
    }

    function handleChangePagination(key, value) {
        setPagination(pagination => ({ ...pagination, [key]: value }));
    }

    const headCells = [
        {
            id: 1,
            label: 'Código',
            disablePadding: false,
            align: 'left',
        },
        {
            id: 2,
            label: 'Nome do receptor',
            disablePadding: false,
            align: 'right',
        },
        {
            id: 3,
            label: 'Nome do paciente',
            disablePadding: false,
            align: 'right',
        },
        {
            id: 4,
            label: 'Hospital de Origem',
            disablePadding: false,
            align: 'right',
        },
        {
            id: 5,
            label: 'Hospital de Destino',
            disablePadding: false,
            align: 'right',
        },
        {
            id: 6,
            label: 'Cotação',
            disablePadding: false,
            align: 'right',
        },
        {
            id: 8,
            label: 'Ações',
            disablePadding: false,
            align: 'right',
        },
    ];

    async function index() {
        setLoading(true);
        try {
            const response = await api.get('/patient-informations/completed-forms/pagination', {
                params: {
                    limit: pagination.limit,
                    offset: pagination.offset,
                    text: pagination.text,
                }
            });

            const {count, rows} = response.data;
            setRows(getTableRows(rows));
            handleChangePagination('count', count);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    }

    useEffect(() => {
        index();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        pagination.limit, 
        pagination.offset, 
        pagination.text,
    ]);

    async function handleGeneratePDF(patient_information) {
        let data = {
            patient_information_id: patient_information.id,
            patient_information_name: patient_information.name,
            patient_information_code: patient_information.code,
            patient_information_companion: patient_information.companion,
            patient_information_companion_contact: patient_information.companion_contact,
            patient_information_origin_hospital: patient_information.origin_hospital,
            patient_information_origin_doctor: patient_information.origin_doctor,
            patient_information_contact_doctor_origin: patient_information.contact_doctor_origin,
            patient_information_destination_hospital: patient_information.destination_hospital,
            patient_information_destination_doctor: patient_information.destination_doctor,
            patient_information_contact_doctor_destination: patient_information.contact_doctor_destination,
            patient_information_bed_number: patient_information.bed_number,
            patient_information_patient_age: patient_information.patient_age,
            patient_information_patient_weight: patient_information.patient_weight,
            patient_information_covid: patient_information.covid ? 'SIM' : 'NÃO',
            patient_information_plan: patient_information.plan === 'plan' ? 'Plano' : 'Particular',
            patient_information_origin_city: patient_information.origin_city ? `${patient_information.origin_city} - ${patient_information.origin_uf}` : 'Indisponível',
            patient_information_destination_city: patient_information.destination_city ? `${patient_information.destination_city} - ${patient_information.destination_uf}` : 'Indisponível',
        };

        if(patient_information.emergency_contact) {
            data.patient_information_emergency_contact = patient_information.emergency_contact;
        }

        if(patient_information.description) {
            data.patient_information_description = patient_information.description;
        }

        if(patient_information.internal_quotation) {
            data.internal_quotation_code = patient_information.internal_quotation.code;
            data.internal_quotation_url = patient_information.internal_quotation.pdf_url;
        }

        if(patient_information.documents.length > 0) {
            const allowedMimesPhotos = [
                "image/jpg",
                "image/jpeg",
                "image/pjpeg",
                "image/png",
                "image/gif",
            ];

            const allowedMimesDocuments = ["application/pdf"];

            const patient_information_photos = patient_information.documents
            .filter(document => allowedMimesPhotos.includes(document.type))
            .map(document => document.url);

            const patient_information_documents = patient_information.documents
            .filter(document => allowedMimesDocuments.includes(document.type))
            .map(document => document.url);

            data.patient_information_photos = patient_information_photos;
            data.patient_information_documents = patient_information_documents;
        }
        
        setProcessing(true);
        toggleOpen('dialog', true);

        try {
            const response = await serverless.post('/dev/patient-informations/pdf', data);
            const pdf = response.data;
            setPdf({
                patient_information_name: patient_information.name,
                url: pdf.url,
            });

            // Atualizar registro do PDF do formulário
            await api.put(`/patient-informations/${patient_information.id}/pdf`, {
                key: pdf.upload.key, 
                name: pdf.name, 
                size: response.headers['content-length'],
                url: pdf.url, 
                type: 'application/pdf',
            });

            setProcessing(false);
        } catch (error) {
            setProcessing(false);
            console.error(error);
        }
    }

    function showDocuments(patient_information_id, documents, patient_information_full_name) {
        history.push('/documents/state/show', {
            documents,
            patient_information_full_name,
        });
    }

    function getTableRows(patient_informations) {
        let rows = [];

        patient_informations.forEach((patient_information, index) => {
            const vertical_table_rows = [
                {
                    id: 1,
                    label: 'Nome do acompanhante',
                    text: patient_information.companion,
                },
                {
                    id: 2,
                    label: 'Contato do acompanhante',
                    text: patient_information.companion_contact,
                },
                {
                    id: 3,
                    label: 'Cidade de Origem',
                    text: patient_information.origin_city ? `${patient_information.origin_city} - ${patient_information.origin_uf}` : 'Indisponível',
                },
                {
                    id: 6,
                    label: 'Cidade de Destino',
                    text: patient_information.destination_city ? `${patient_information.destination_city} - ${patient_information.destination_uf}` : 'Indisponível',
                },
                {
                    id: 4,
                    label: 'Médico do hospital de origem',
                    text: patient_information.origin_doctor,
                },
                {
                    id: 5,
                    label: 'Contato do médico do hospital de origem',
                    text: patient_information.contact_doctor_origin,
                },
                {
                    id: 7,
                    label: 'Médico do hospital de destino',
                    text: patient_information.destination_doctor,
                },
                {
                    id: 8,
                    label: 'Contao do médico do hospital de destino',
                    text: patient_information.contact_doctor_destination,
                },
                {
                    id: 9,
                    label: 'Número do leito',
                    text: patient_information.bed_number,
                },
                {
                    id: 10,
                    label: 'Número do leito',
                    text: patient_information.bed_number,
                },
                {
                    id: 11,
                    label: 'Idade do paciente',
                    text: patient_information.patient_age,
                },
                {
                    id: 12,
                    label: 'Peso do paciente',
                    text: patient_information.patient_weight,
                },
                {
                    id: 13,
                    label: 'Contato de emergência',
                    text: patient_information.emergency_contact ? patient_information.emergency_contact : 'Não informado',
                },
                {
                    id: 14,
                    label: 'Plano',
                    text: patient_information.plan === 'plan' ? 'Plano' : 'Particular',
                },
                {
                    id: 15,
                    label: 'Supeita de covid?',
                    text: patient_information.covid ? 'SIM' : 'NÃO',
                },
                {
                    id: 16,
                    label: 'Descrição',
                    text: patient_information.description ? patient_information.description : 'Nenhuma descrição disponível',
                },
                {
                    id: 17,
                    label: 'Data de preenchimento',
                    text: patient_information.fill_date ? formatDatetime(patient_information.fill_date) : '---',
                },
                {
                    id: 18,
                    label: 'Data de criação',
                    text: formatDatetime(patient_information.createdAt),
                },
            ];

            rows.push({
                id: patient_information.id,
                expansive: {
                    headCells: [],
                    rows: [],
                    custom: () => (
                        <>
                            {patient_information.documents.length > 0 ? (
                                <div className="with-documents">
                                    <button onClick={() => showDocuments(patient_information.id, patient_information.documents, patient_information.full_name)}>Arquivos</button>
                                </div>
                            ) : (
                                <div className="no-documents">
                                    <p className="title">A informação não contém arquivos.</p>
                                </div>
                            )}
                            <VerticalTable rows={vertical_table_rows} />
                        </>
                    ),
                },
                cells: [
                    {
                        id: 1,
                        text: patient_information.code,
                        disablePadding: false,
                        align: 'left',
                    },
                    {
                        id: 2,
                        text: patient_information.receiver,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 3,
                        text: normalizeString(patient_information.name, 25),
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 4,
                        text: normalizeString(patient_information.origin_hospital, 25),
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 5,
                        text: normalizeString(patient_information.destination_hospital, 25),
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 6,
                        text: <QuotationAttach index={index} patient_information={patient_information} />,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 7,
                        text: (
                            <>
                                <Tooltip className="action-tooltip" title="Exportar como PDF" onClick={() => handleGeneratePDF(patient_information)}>
                                    <IconButton size="small" aria-label="pdf">
                                        <PictureAsPdfIcon className="icon icon-pdf" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip className="action-tooltip" title="Enviar no whatsapp" onClick={() => {
                                    shareOnWhatsapp(`cotações/0/medical-informations/${patient_information.id}/passenger`);
                                }}>
                                    <IconButton size="small" aria-label="whatsapp">
                                        <WhatsAppIcon className="icon icon-whatsapp" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip className="action-tooltip" title="Editar formulário" onClick={() => {
                                    handleEditMedicalInformation(patient_information.id, patient_information.internal_quotation ? patient_information.internal_quotation.id : 0);
                                }}>
                                        <IconButton size="small" aria-label="edit">
                                        <EditIcon className="icon icon-edit" />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ),
                        disablePadding: false,
                        align: 'right',
                    },
                ],
            })
        });
        return rows;
    }

    function handleSearch(text) {
        handleChangePagination('text', text);
    }

    function handleChangePage(page) {
        let offset = 0;
        if(page > 0) {
            offset = pagination.limit;
        }

        handleChangePagination('offset', offset);
        handleChangePagination('page', page);
    }

    function handleChangeRowsPerPage(rows_per_page) {
        handleChangePagination('limit', rows_per_page);
    }

    async function removeSelecteds(selecteds) {
        setSelecteds(selecteds);
        toggleOpen('alert', true);
    }

    async function onConfirmDelete() {
        setDeleting(true);
        try {
            await Promise.all(selecteds.map(id => {
                return api.delete(`/patient-information/${id}/delete`);
            }));
            feedback.open({
                severity: 'success',
                msg: 'Operação realizada com sucesso!',
            });
            setDeleting(false);
            toggleOpen('alert', false);
            index();
        } catch (error) {
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro ao processar a operação',
            });
            setDeleting(false);
            toggleOpen('alert', false);
            console.error(error);
        }
    }

    return(
        ((rows.length > 0) || loading) ? (
            <>
                <Alert 
                    open={open.alert} 
                    title="Confirmar exclusão" 
                    message="Excluir selecionado(s)?" 
                    onConfirm={onConfirmDelete}
                    onCancel={() => toggleOpen('alert', false)}
                    processing={deleting}
                    processingTitle="Excluindo formulários!"
                    processingMsg="Por favor, aguarde..."
                />
                <TransitionDialog open={open.dialog} disableBackdropClick={true} disableActions={processing} title={processing ? 'O PDF está sendo gerado!' : pdf ? 'PDF gerado com sucesso' : 'Erro ao gerar PDF'} msg={processing ? 'Por favor, aguarde...' : ''} handleClose={() => toggleOpen('dialog', false)}>
                    {processing ? <FacebookCircularProgress /> : (
                        <div className="pdf-generated">
                            {pdf ? (
                                <div className="pdf-success">
                                    <h5>Escolha uma ação abaixo</h5>
                                    <div className="pdf-actions">
                                        <a 
                                            href={'https://wa.me/?text='+encodeURIComponent(
                                                `Informações médicas de ${pdf.patient_information_name}:: ${pdf.url}`
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
                                        <a rel="noopener noreferrer" target="_blank" href={pdf.url} className="btn btn-action">Baixar</a>
                                    </div>
                                </div>
                            ) : (
                                <div className="pdf-error">
                                    <span className="error">Ocorreu um erro ao gerar o PDF.</span>
                                </div>
                            )}
                        </div>
                    )}
                </TransitionDialog>
                <TableTask 
                    rows={rows} 
                    loading={loading} 
                    expansion={true}
                    withSwap={true}
                    headCells={headCells}
                    limit={pagination.limit}
                    page={pagination.page}
                    count={pagination.count}
                    handleRemoveSelecteds={removeSelecteds}
                    onSearch={handleSearch}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </>
        ) : (<p>Nenhum formulário</p>)
    );
}

function AwaitingForms({history}) {
    const feedback = useFeedback();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [selecteds, setSelecteds] = useState([]);
    const [deleting, setDeleting] = useState(false);

    function handleEditMedicalInformation(patient_information_id, internal_quotation_id = 0) {
        history.push(`/cotações/${internal_quotation_id}/medical-informations/${patient_information_id}/passenger`, {admin: true});
    }

    const [pagination, setPagination] = useState({
        limit: 10, 
        offset: 0, 
        page: 0,
        count: 0,
        text: '',
        order: 'DESC', 
        filter: 'receiver', 
        orderBy:'createdAt',
    });
    function handleChangePagination(key, value) {
        setPagination(pagination => ({ ...pagination, [key]: value }));
    }

    const headCells = [
        {
            id: 1,
            label: 'Código',
            disablePadding: false,
            align: 'left',
        },
        {
            id: 2,
            label: 'Nome do receptor',
            disablePadding: false,
            align: 'right',
        },
        {
            id: 3,
            label: 'Administrador',
            disablePadding: false,
            align: 'right',
        },
        {
            id: 4,
            label: 'Criado em',
            disablePadding: false,
            align: 'right',
        },
        {
            id: 5,
            label: 'Ações',
            disablePadding: false,
            align: 'right',
        },
    ];

    function getTableRows(patient_informations) {
        let rows = [];

        patient_informations.forEach((patient_information) => {
            rows.push({
                id: patient_information.id,
                cells: [
                    {
                        id: 1,
                        text: patient_information.code,
                        disablePadding: false,
                        align: 'left',
                    },
                    {
                        id: 2,
                        text: patient_information.receiver,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 3,
                        text: 'Piquiatuba Táxi Aéreo',
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 4,
                        text: formatDatetime(patient_information.createdAt),
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 5,
                        text: (
                            <>
                                <Tooltip className="action-tooltip" title="Enviar no whatsapp" onClick={() => {
                                    shareOnWhatsapp(`cotações/0/medical-informations/${patient_information.id}/passenger`);
                                }}>
                                    <IconButton size="small" aria-label="whatsapp">
                                        <WhatsAppIcon className="icon icon-whatsapp" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip className="action-tooltip" title="Editar formulário" onClick={() => {
                                    handleEditMedicalInformation(patient_information.id, patient_information.internal_quotation ? patient_information.internal_quotation.id : 0);
                                }}>
                                    <IconButton size="small" aria-label="edit">
                                    <EditIcon className="icon icon-edit" />
                                    </IconButton>
                                </Tooltip>
                            </>
                        ),
                        disablePadding: false,
                        align: 'right',
                    },
                ],
            })
        });
        
        return rows;
    }

    async function index() {
        setLoading(true);
        try {
            const response = await api.get('/patient-informations/awaiting-forms/pagination', {
                params: {
                    limit: pagination.limit,
                    offset: pagination.offset,
                    text: pagination.text,
                }
            });

            const {count, rows} = response.data;
            handleChangePagination('count', count);
            setRows(getTableRows(rows));
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    }

    useEffect(() => {
        index();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        pagination.limit, 
        pagination.offset, 
        pagination.text,
    ]);

    function handleSearch(text) {
        handleChangePagination('text', text);
    }

    function handleChangePage(page) {
        let offset = 0;
        if(page > 0) {
            offset = pagination.limit;
        }

        handleChangePagination('offset', offset);
        handleChangePagination('page', page);
    }

    function handleChangeRowsPerPage(rows_per_page) {
        handleChangePagination('limit', rows_per_page);
    }

    async function removeSelecteds(selecteds) {
        setSelecteds(selecteds);
        handleOpen();
    }

    async function onConfirmDelete() {
        setDeleting(true);
        try {
            await Promise.all(selecteds.map(id => {
                return api.delete(`/patient-information/${id}/delete`);
            }));
            feedback.open({
                severity: 'success',
                msg: 'Operação realizada com sucesso!',
            });
            setDeleting(false);
            handleClose();
            index();
        } catch (error) {
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro ao processar a operação!',
            });
            setDeleting(false);
            handleClose();
            console.error(error);
        }
    }

    function handleOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    return(
        ((rows.length > 0) || loading) ? (
            <>
                <Alert 
                    open={open} 
                    title="Confirmar exclusão" 
                    message="Excluir selecionado(s)?" 
                    onConfirm={onConfirmDelete}
                    onCancel={handleClose}
                    processing={deleting}
                    processingTitle="Excluindo formulários!"
                    processingMsg="Por favor, aguarde..."
                />
                <TableTask 
                    rows={rows} 
                    loading={loading} 
                    headCells={headCells}
                    limit={pagination.limit}
                    expansion={false}
                    withSwap={false}
                    page={pagination.page}
                    count={pagination.count}
                    handleRemoveSelecteds={removeSelecteds}
                    onSearch={handleSearch}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </>
        ) : (
            <p>Nenhum formulário</p>
        )
    );
}

export default function Medical({history}) {
    const admin = useSelector(state => state.authentication.user.company);
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
            const response = await api.post('/new-medical-form', {
                receiver: capitalize(receiver.trim(), true),
                admin_id: admin.id,
            });
            setPatientInformation(response.data);
            setProcessing(false);
        } catch (error) {
            console.error(error);
            setProcessing(false);
        }
    }

    // Enviar formulário sem associação de cotação
    function handleSend() {
        shareOnWhatsapp(`cotações/0/medical-informations/${patientInformation.id}/passenger`);
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
            <section id="medical" className="medical">
               <div className="header">
                    <div className="title">
                        <PageTitle title="Consultar informações médicas" subtitle="Lista de formulários médicos" />
                    </div>
                    <div className="new-medical-form">
                    <Tooltip className="tooltip-med" onClick={handleOpen} title="Novo formulário médico">
                        <IconButton aria-label="closed">
                            <PostAddOutlinedIcon className="icon" />
                        </IconButton>
                    </Tooltip>
                    </div>
               </div>
                <Tabs
                    value={value}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChange}
                    aria-label="disabled tabs example"
                >
                    <Tab label="Aguardando preenchimento" />
                    <Tab label="Preenchidos" />
                </Tabs>
                <TabPanel value={value} index={0}>
                    <AwaitingForms history={history} />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <CompletedForms history={history} />
                </TabPanel>
            </section>
        </WrapperContent>
    );
}
