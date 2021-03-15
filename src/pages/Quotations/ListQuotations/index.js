import React, {useEffect, useState} from 'react';
import { useFeedback } from '../../../core/feedback/feedback.context';
import {WrapperContent, FlexSpaceBetween} from '../../../core/design';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import WhatsappIcon from '@material-ui/icons/WhatsApp';
import EmailOutlinedIcon from '@material-ui/icons/EmailOutlined';
import PageTitle from '../../../components/PageTitle';
import TableTask from '../../../components/TableTask';
import QuotationStatus from '../../../components/QuotationStatus';
import Alert from '../../../components/Alert';
import Dialog from '@material-ui/core/Dialog';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import DialogContent from '@material-ui/core/DialogContent';
import { getDatetime, shareOnWhatsapp, currency } from '../../../utils';
import { EnumDatetimeFormatTypes, EnumShareWhatsappEndpoints } from '../../../global';
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

function Actions({internal_quotation, last_internal_quotation_status, handleEditQuotation}) {
    const [open, setOpen] = useState(false);

    function handleSend() {
        if(internal_quotation.document) {
            setOpen(true);
        } else {
            alert('Cotação sem documento. Por favor, edite a cotação e gere um novo documento.');
        }
    }

    function handleClose() {
        setOpen(false);
    }

    function sendWithWhatsapp(internal_quotation_id) {
        shareOnWhatsapp(`${EnumShareWhatsappEndpoints.FORMS}/quotations/${internal_quotation_id}/download`);
    }

    function handleDownload() {
        window.open(internal_quotation.document.url, "_blank");
    }

    return(
        <div className="actions">
            <Dialog open={open} onClose={handleClose} className="dialog-send">
                <DialogContent>
                    <div className="send-action">
                        <p className="title">Enviar por</p>

                        <div className="send-content">
                            <FlexSpaceBetween>
                                <div className="share" onClick={() => sendWithWhatsapp(internal_quotation.id)}>
                                    <IconButton>
                                        <WhatsappIcon />
                                    </IconButton>
                                    <p>Whatsapp</p>
                                </div>
                                <div className="share">
                                    <IconButton>
                                        <EmailOutlinedIcon />
                                    </IconButton>
                                    <p>Email</p>
                                </div>
                                <div className="download">
                                    <IconButton onClick={handleDownload}>
                                        <CloudDownloadIcon />
                                    </IconButton>
                                    <p>Baixar</p>
                                </div>
                            </FlexSpaceBetween>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {last_internal_quotation_status.status !== 'closed' && (
                <Tooltip className="action-tooltip" title="Editar cotação">
                    <IconButton size="small" aria-label="edit" onClick={() => {
                        console.log(internal_quotation);
                        handleEditQuotation(internal_quotation.id, internal_quotation.code);
                    }}>
                        <EditIcon className="icon icon-edit" />
                    </IconButton>
                </Tooltip>
            )}
            <Tooltip className="action-tooltip pdf-tooltip" title="Enviar PDF"> 
                <IconButton size="small" aria-label="pdf" onClick={() => handleSend()}>
                    <i className="pi pi-file-pdf"></i>
                </IconButton>
            </Tooltip>
        </div>
    );
}

export default function ListQuotations({history, serverDatetime}) {
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

            rows.push({
                id: internal_quotation.id,
                expansive: {
                    headCells: [
                        {
                            id: 1,
                            label: 'Número do trecho',
                            disablePadding: false,
                            align: 'left',
                        },
                        {
                            id: 1,
                            label: 'Aeródromo de origem',
                            disablePadding: false,
                            align: 'left',
                        },
                        {
                            id: 1,
                            label: 'Aeródromo de destino',
                            disablePadding: false,
                            align: 'left',
                        },
                    ],
                    rows: internal_quotation.flight.flight_segments.map((flight_segment, index) => ({
                        id: index+1,
                        cells: [
                            {
                                id: 1,
                                text: flight_segment.stretch_number,
                                disablePadding: false,
                                align: 'left',
                            },
                            {
                                id: 1,
                                text: flight_segment.origin_aerodrome.full_name,
                                disablePadding: false,
                                align: 'left',
                            },
                            {
                                id: 1,
                                text: flight_segment.destination_aerodrome.full_name,
                                disablePadding: false,
                                align: 'left',
                            }
                        ]
                    })),
                    custom: () => (
                        <div className="custom-info">
                            <p><strong>Aeronave:</strong> {internal_quotation.flight.flight_segments[0].aircraft.full_name}</p>
                            <p><strong>Preço cotado:</strong> {currency(internal_quotation.flight.final_price)}</p>
                        </div>
                    ),
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
                        text: (
                            <QuotationStatus 
                                serverDatetime={serverDatetime}
                                internal_quotation_id={internal_quotation.id}
                                internal_quotation_name={internal_quotation.full_name}
                                flight_id={internal_quotation.flight.id}
                                current_status={last_internal_quotation_status.status} 
                            />
                        ),
                        disablePadding: false,
                        align: 'right',
                    },
                    {
                        id: 4,
                        disablePadding: false,
                        align: 'right',
                        text: internal_quotation.type_of_transport,
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
                            <Actions 
                                last_internal_quotation_status={last_internal_quotation_status} 
                                internal_quotation={internal_quotation} 
                                handleEditQuotation={handleEditQuotation}
                            />
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

    function handleAddQuotation() {
        history.push('/quotations/0/edit');
    }

    function handleEditQuotation(internal_quotation_id, internal_quotation_code) {
        history.push(`/quotations/${internal_quotation_id}/edit`, {internal_quotation_code});
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
                <FlexSpaceBetween>
                    <PageTitle title="Lista de cotações" subtitle="Cotações" />
                    <Tooltip title="Adicionar cotação">
                        <IconButton onClick={handleAddQuotation}>
                            <AddIcon className="icon" />
                        </IconButton>
                    </Tooltip>
                </FlexSpaceBetween>
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
                    toolbar_search_placeholder="Pesquisar cotação..."
                    handleOpenFilterList={() => handleOpen('filters')}
                />
            </section>
        </WrapperContent>
    );
}