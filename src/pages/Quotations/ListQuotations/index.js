import React, {useEffect, useState} from 'react';
import { useFeedback } from '../../../core/feedback/feedback.context';
import {WrapperContent} from '../../../core/design';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import PageTitle from '../../../components/PageTitle';
import TableTask from '../../../components/TableTask';
import Alert from '../../../components/Alert';
import FullScreenDialog from '../../../components/FullScreenDialog';
import { EnumInternalQuotationStatus, EnumDatetimeFormatTypes } from '../../../global';
import { getDatetime } from '../../../utils';
import api from '../../../api';
import './styles.css';

const headCells = [
    {
        id: 1,
        label: 'Código',
        disablePadding: false,
        align: 'left',
    },
    {
        id: 2,
        label: 'Nome do cliente',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 3,
        label: 'Status da cotação',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 4,
        label: 'Modalidade',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 5,
        label: 'Criada em',
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

function InternalQuotationStatus({current_status, onChange}) {
    const [status, setStatus] = useState(current_status);
    const [inputs, setInputs] = useState({
        departure_datetime: '',
        arrival_datetime: '',
    });

    return(
        <>
            <FullScreenDialog />
            <Select 
                id="status" 
                name="status" 
                displayEmpty
                className={`select-quotation-status select-${status}`}
                value={status}
                disableUnderline={true}
                onChange={(e) => setStatus(e.target.value)}
            >
                <MenuItem disabled value="">
                    <em>Status da cotação...</em>
                </MenuItem>
                {EnumInternalQuotationStatus.map(internal_quotation_status => <MenuItem key={internal_quotation_status.key} value={internal_quotation_status.key}>{internal_quotation_status.value}</MenuItem>)}
            </Select>
        </>
    );
}

export default function ListQuotations() {
    const feedback = useFeedback();
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
            const response = await api.get('/internal-quotations/pagination', {
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

    function getTableRows(internal_quotations) {
        let rows = [];
    
        internal_quotations.forEach((internal_quotation) => {

            const last_internal_quotation_status = internal_quotation.internal_quotation_status[0];
            console.log({
                last_internal_quotation_status,
            })

            rows.push({
                id: internal_quotation.id,
                expansive: {
                    headCells: [],
                    rows: [],
                    custom: () => (<></>),
                },
                cells: [
                    {
                        id: 1,
                        text: internal_quotation.code,
                        disablePadding: false,
                        align: 'left',
                    },
                    {
                        id: 2,
                        text: internal_quotation.client_name,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 3,
                        text: <InternalQuotationStatus current_status={last_internal_quotation_status.status} />,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 4,
                        text: (
                            <div className={`type_of_transport ${internal_quotation.type_of_transport}-transport`}>
                                <p>{internal_quotation.type_of_transport === 'aeromedical' ? 'UTI' : 'PAX'}</p>
                            </div>
                        ),
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 5,
                        text: getDatetime(internal_quotation.created_at, EnumDatetimeFormatTypes.READABLE_V1),
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 6,
                        disablePadding: false,
                        align: 'right',
                        text: (
                            <div className="actions">
                                <Tooltip className="action-tooltip" title="Editar cotação" onClick={() => {}}>
                                    <IconButton size="small" aria-label="edit">
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

    useEffect(() => {
        index();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        pagination.limit, 
        pagination.offset, 
        pagination.text,
    ]);

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

    return(
        <WrapperContent>
            <Alert 
                open={open.alert} 
                processing={deleting}
                title="Remover as cotações selecionadas"
                message="Esta ação não poderá ser desfeita. Deseja continuar?"
                processingTitle="Removendo cotações..."
                processingMsg="Por favor, aguarde!"
                onConfirm={onConfirmDelete}
                onCancel={() => handleClose('alert')}
            />
            <section id="list-quotations" className="list-quotations">
                <PageTitle title="Lista de cotações" subtitle="Cotações" />

                <TableTask 
                    rows={rows} 
                    loading={loading} 
                    headCells={headCells}
                    limit={pagination.limit}
                    expansion={true}
                    withSwap={true}
                    page={pagination.page}
                    count={pagination.count}
                    handleRemoveSelecteds={handleRemoveSelecteds}
                    onSearch={handleSearch}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                    toolbar_search_placeholder="Pesquisar cotação..."
                    handleOpenFilterList={() => handleOpen('filters')}
                />
            </section>
        </WrapperContent>
    );
}