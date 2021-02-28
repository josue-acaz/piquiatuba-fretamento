import React, {useState, useEffect} from 'react';
import {useRouteMatch} from 'react-router-dom';
import {useFeedback} from '../../../../core/feedback/feedback.context';
import TableTask from '../../../../components/TableTask';
import Alert from '../../../../components/Alert';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import api from '../../../../api';
import {getDatetime, shareOnWhatsapp} from '../../../../utils';
import {EnumDatetimeFormatTypes, EnumShareWhatsappEndpoints} from '../../../../global';

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
        label: 'Criado por',
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
        id: 6,
        label: 'Ações',
        disablePadding: false,
        align: 'right',
    },
];

export default function EmptyForms({history}) {
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
            const response = await api.get('/medical-forms/empty-forms/pagination', {
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

    function getTableRows(medical_forms) {
        let rows = [];
    
        medical_forms.forEach((medical_form) => {
            rows.push({
                id: medical_form.id,
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
                        text: medical_form.admin.user.name,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 4,
                        disablePadding: false,
                        align: 'right',
                        text: getDatetime(medical_form.createdAt, EnumDatetimeFormatTypes.READABLE_V1),
                    },
                    {
                        id: 6,
                        disablePadding: false,
                        align: 'right',
                        text: (
                            <div className="actions">
                                <Tooltip className="action-tooltip" title="Enviar no whatsapp" onClick={() => {
                                    shareOnWhatsapp(`${EnumShareWhatsappEndpoints.FORMS}/medical-forms/${medical_form.id}/patient`);
                                }}>
                                    <IconButton size="small" aria-label="whatsapp">
                                        <WhatsAppIcon className="icon icon-whatsapp" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip className="action-tooltip" title="Editar formulário">
                                        <IconButton size="small" aria-label="edit" onClick={() => handleEdit(medical_form.id)}>
                                        <EditIcon className="icon icon-edit" />
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

    function handleEdit(patient_information_id) {
        history.push(`${path}/${patient_information_id}/edit`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {index()}, []);

    return(
        <div className="empty-forms">
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