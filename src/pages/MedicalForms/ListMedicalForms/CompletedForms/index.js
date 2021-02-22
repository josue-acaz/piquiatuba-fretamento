import React, {useState, useEffect} from 'react';
import {useRouteMatch} from 'react-router-dom';
import {useFeedback} from '../../../../core/feedback/feedback.context';
import Alert from '../../../../components/Alert';
import TableTask from '../../../../components/TableTask';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import AutocompleteDialog from '../../../../components/AutocompleteDialog';
import TransitionDialog from '../../../../components/TransitionDialog';
import {currency, normalizeString} from '../../../../utils';
import api from '../../../../api';

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

        setAttaching(false);
    }

    async function handleSelectedQuotation(internal_quotation, index) {
        toggleOpen('autocomplete');

        // Verifica se a referência para a cotação é válida
        if(internal_quotation) {
            setAttaching(true);
            
            try {
                await api.put(`/medical-forms/${patient_information.id}/attach-quotation`, {
                    internal_quotation_id: internal_quotation.id,
                });

                attachQuotation(internal_quotation);
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
        <div className="completed-forms">
            <AutocompleteDialog 
                open={open.autocomplete} 
                endpoint="/internal-quotations/autocomplete"
                handleClose={() => toggleOpen('autocomplete')} 
                handleSelectedOption={handleSelectedQuotation}
            />
            {(patientInformation.internal_quotation && !attaching) && (
                <TransitionDialog open={open.quotation} title={patientInformation.internal_quotation.full_name} handleClose={() => toggleOpen('quotation')}>
                    <p><strong>Cliente:  </strong>{patientInformation.internal_quotation.client_name}</p>
                    <p><strong>Preço cotado: </strong>{currency(patientInformation.internal_quotation.flight.final_price)}</p>
                </TransitionDialog>
            )}
            <Tooltip onClick={handleAttachAction} title="Clique para anexar cotação">
                <div className="ref_quotation">
                    {attaching ? <div className="auto-dialog-loader"></div> : (
                        patientInformation.internal_quotation ? <p><strong>{normalizeString(patientInformation.internal_quotation.full_name)}</strong></p> : <p>Nenhuma</p>
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
        </div>
    );
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
        label: 'Hospital de origem',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 5,
        label: 'Hospital de destino',
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
        id: 7,
        label: 'Ações',
        disablePadding: false,
        align: 'right',
    },
];

export default function CompletedForms({history}) {
    const feedback = useFeedback();
    const {path} = useRouteMatch();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState({
        alert: false,
        filters: false,
    });
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
        orderBy:'createdAt',
    });

    async function index() {
        setLoading(true);
        try {
            const response = await api.get('/medical-forms/pagination', {
                params: {
                    limit: pagination.limit,
                    offset: pagination.offset,
                    text: pagination.text,
                }
            });

            const {count, rows} = response.data;
            console.log({rows});
            handleChangePagination('count', count);
            setRows(getTableRows(rows));
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    }

    function handleOpen(name) {
        setOpen(open => ({ ...open, [name]: true }));
    }

    function handleClose(name) {
        setOpen(open => ({ ...open, [name]: false }));
    }

    function handleChangePagination(key, value) {
        setPagination(pagination => ({ ...pagination, [key]: value }));
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

    async function handleRemoveSelecteds(selecteds) {
        setSelecteds(selecteds);
        handleOpen('alert');
    }

    async function onConfirmDelete() {
        setDeleting(true);
        try {
            await Promise.all(selecteds.map(id => {
                return api.delete(`/internal-quotations/${id}/delete`);
            }));
            feedback.open({
                severity: 'success',
                msg: 'Operação realizada com sucesso!',
            });
            setDeleting(false);
            handleClose('alert');
            index();
        } catch (error) {
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro ao processar a operação!',
            });
            setDeleting(false);
            handleClose('alert');
            console.error(error);
        }
    }

    function handleEdit(patient_information_id) {
        history.push(`${path}/${patient_information_id}/edit`);
    }

    function getTableRows(medical_forms) {
        let rows = [];
    
        medical_forms.forEach((medical_form) => {
            rows.push({
                id: medical_form.id,
                expansive: {
                    headCells: [],
                    rows: [],
                    custom: () => (<></>),
                },
                cells: [
                    {
                        id: 1,
                        text: medical_form.code,
                        disablePadding: false,
                        align: 'left',
                    },
                    {
                        id: 2,
                        text: medical_form.receiver,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 3,
                        text: medical_form.name,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 4,
                        disablePadding: false,
                        align: 'right',
                        text: medical_form.origin_hospital
                    },
                    {
                        id: 5,
                        text: medical_form.destination_hospital,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 6,
                        disablePadding: false,
                        align: 'right',
                        text: <QuotationAttach index={index} patient_information={medical_form} />,
                    },
                    {
                        id: 7,
                        disablePadding: false,
                        align: 'right',
                        text: (
                            <div className="actions">
                                <Tooltip title="Editar formulário">
                                    <IconButton size="small" onClick={() => handleEdit(medical_form.id)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Exportar como PDF">
                                    <IconButton size="small">
                                        <i className="pi pi-file-pdf"></i>
                                    </IconButton>
                                </Tooltip>
                            </div>
                        ),
                    },
                ],
            })
        });
        
        return rows;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {index()}, []);

    return(
        <div className="completed-forms">
            <Alert 
                open={open.alert} 
                processing={deleting}
                title="Remover os formulários selecionados"
                message="Esta ação não poderá ser desfeita. Deseja continuar?"
                processingTitle="Removendo formulários..."
                processingMsg="Por favor, aguarde!"
                onConfirm={onConfirmDelete}
                onCancel={() => handleClose('alert')}
            />
            <TableTask 
                rows={rows} 
                loading={loading} 
                headCells={headCells}
                limit={pagination.limit}
                expansion={true}
                page={pagination.page}
                count={pagination.count}
                handleRemoveSelecteds={handleRemoveSelecteds}
                onSearch={handleSearch}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                toolbar_search_placeholder="Pesquisar formulário..."
                handleOpenFilterList={() => handleOpen('filters')}
            />
        </div>
    );
}