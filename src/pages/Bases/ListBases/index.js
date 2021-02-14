import React, {useEffect, useState} from 'react';
import {useRouteMatch} from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import { PageTitle, Alert } from "../../../components";
import { WrapperContent } from '../../../core/design';
import TableTask from '../../../components/TableTask';
import { useFeedback } from '../../../core/feedback/feedback.context';
import api from '../../../api';

import './styles.css';

const headCells = [
    {
        id: 1,
        label: 'Nome',
        disablePadding: false,
        align: 'left',
    },
    {
        id: 2,
        label: 'Latitude',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 3,
        label: 'Longitude',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 4,
        label: 'Aeródromo',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 5,
        label: 'Criado em',
        disablePadding: false,
        align: 'right',
    },
];

function getTableRows(bases) {
    let rows = [];

    bases.forEach((base) => {
        rows.push({
            id: base.id,
            cells: [
                {
                    id: 1,
                    text: base.name,
                    disablePadding: false,
                    align: 'left',
                },
                {
                    id: 2,
                    text: base.latitude,
                    disablePadding: false,
                    align: 'right',
                },
                {
                    id: 3,
                    text: base.longitude,
                    disablePadding: false,
                    align: 'right',
                },
                {
                    id: 4,
                    text: base.aerodrome.full_name,
                    disablePadding: false,
                    align: 'right',
                },
                {
                    id: 5,
                    text: base.createdAt,
                    disablePadding: false,
                    align: 'right',
                },
            ],
        })
    });
    
    return rows;
}

export default function ListBases({history}) {
    const {path} = useRouteMatch();
    const feedback = useFeedback();
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [open, setOpen] = useState(false);
    const [selecteds, setSelecteds] = useState([]);
    const [deleting, setDeleting] = useState(false);
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
        setOpen(true);
    }

    async function index() {
        setLoading(true);
        try {
            const response = await api.get('/bases/pagination', {
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

    async function onConfirmDelete() {
        setDeleting(true);
        try {
            await Promise.all(selecteds.map(id => {
                return api.delete(`/bases/${id}/delete`);
            }));
            feedback.open({
                severity: 'success',
                msg: 'Operação realizada com sucesso!',
            });
            setDeleting(false);
            setOpen(false);
            index();
        } catch (error) {
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro ao processar a operação!',
            });
            setDeleting(false);
            setOpen(false);
            console.error(error);
        }
    }

    function handleAddBase() {
        history.push(`${path}/add`);
    }

    useEffect(() => {
        index();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        pagination.limit, 
        pagination.offset, 
        pagination.text,
    ]);

    return(
        <WrapperContent>
            <Alert 
                open={open} 
                processing={deleting}
                title="Remover as bases selecionadas"
                message="Esta ação não poderá ser desfeita. Deseja continuar?"
                processingTitle="Removendo bases..."
                processingMsg="Por favor, aguarde!"
                onConfirm={onConfirmDelete}
                onCancel={() => setOpen(false)}
            />
            <section id="bases" className="bases">
                <div className="header">
                    <div>
                        <PageTitle title="Bases operacionais" subtitle="cadastrar e gerenciar bases" />
                    </div>
                    <div>
                        <Tooltip title="Adicionar base">
                            <IconButton onClick={handleAddBase}>
                                <AddIcon className="icon" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <TableTask 
                    rows={rows} 
                    loading={loading} 
                    headCells={headCells}
                    limit={pagination.limit}
                    expansion={false}
                    withSwap={false}
                    page={pagination.page}
                    count={pagination.count}
                    handleRemoveSelecteds={handleRemoveSelecteds}
                    onSearch={handleSearch}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                    toolbar_search_placeholder="Pesquisar base..."
                />
            </section>
        </WrapperContent>
    );
}