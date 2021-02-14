import React, {useEffect, useState} from 'react';
import {useRouteMatch} from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddIcon from '@material-ui/icons/Add';
import { PageTitle, Alert } from "../../../components";
import { WrapperContent } from '../../../core/design';
import TableTask from '../../../components/TableTask';
import { useFeedback } from '../../../core/feedback/feedback.context';
import { currency } from '../../../utils';
import api from '../../../api';
import ImageOutlinedIcon from '@material-ui/icons/ImageOutlined';

import './styles.css';

const headCells = [
    {
        id: 1,
        label: 'Prefixo',
        disablePadding: false,
        align: 'left',
    },
    {
        id: 2,
        label: 'Modelo',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 3,
        label: 'Base de referência',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 4,
        label: 'Preço por hora (passageiros)',
        disablePadding: false,
        align: 'right',
    },
    {
        id: 5,
        label: 'Aeromédico?',
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

export default function ListAircrafts({history}) {
    const {path} = useRouteMatch();
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

    async function index() {
        setLoading(true);
        try {
            const response = await api.get('/aircrafts/pagination', {
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
                return api.delete(`/aircrafts/${id}/delete`);
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

    function handleAddAircraft() {
        history.push(`${path}/add`);
    }

    function handleAccessGallery(aircraft_id, data) {
        history.push(`${path}/${aircraft_id}/gallery`, data);
    }

    useEffect(() => {
        index();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        pagination.limit, 
        pagination.offset, 
        pagination.text,
    ]);

    function getTableRows(aircrafts) {
        let rows = [];
    
        aircrafts.forEach((aircraft) => {
            rows.push({
                id: aircraft.id,
                expansive: {
                    headCells: [],
                    rows: [],
                    custom: () => (<></>),
                },
                cells: [
                    {
                        id: 1,
                        text: aircraft.prefix,
                        disablePadding: false,
                        align: 'left',
                    },
                    {
                        id: 2,
                        text: aircraft.name,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 3,
                        text: aircraft.base.name,
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 4,
                        text: currency(aircraft.price_per_km_passengers),
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 5,
                        text: (<strong>{aircraft.operates_aeromedical_transport ? 'SIM' : 'NÃO'}</strong>),
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 6,
                        disablePadding: false,
                        align: 'right',
                        text: (
                            <Tooltip className="action-tooltip" title="Acessar galeria" onClick={() => {
                                handleAccessGallery(aircraft.id, {
                                    aircraft_name: aircraft.full_name, 
                                    aircraft_images: aircraft.aircraft_images,
                                    operates_aeromedical_transport: aircraft.operates_aeromedical_transport,
                                });
                            }}>
                                <IconButton size="small" aria-label="gallery">
                                    <ImageOutlinedIcon className="icon icon-gallery" />
                                </IconButton>
                            </Tooltip>
                        ),
                    },
                ],
            })
        });
        
        return rows;
    }

    return(
        <WrapperContent>
            <Alert 
                open={open.alert} 
                processing={deleting}
                title="Remover as aeronaves selecionadas"
                message="Esta ação não poderá ser desfeita. Deseja continuar?"
                processingTitle="Removendo aeronaves..."
                processingMsg="Por favor, aguarde!"
                onConfirm={onConfirmDelete}
                onCancel={() => handleClose('alert')}
            />
            <section id="aeronaves" className="aeronaves">
                <div className="header">
                    <div>
                        <PageTitle title="Frota de aeronaves" subtitle="cadastrar e gerenciar aeronaves" />
                    </div>
                    <div>
                        <Tooltip title="Adicionar aeronave">
                            <IconButton onClick={handleAddAircraft}>
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
                    expansion={true}
                    withSwap={true}
                    page={pagination.page}
                    count={pagination.count}
                    handleRemoveSelecteds={handleRemoveSelecteds}
                    onSearch={handleSearch}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                    toolbar_search_placeholder="Pesquisar aeronave..."
                    handleOpenFilterList={() => handleOpen('filters')}
                />
            </section>
        </WrapperContent>
    );
}