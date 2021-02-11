import React, { useState, useEffect, Fragment } from "react";
import { userService } from "../../auth/services";
import { QuotationList, PageTitle, Alert, Loader } from "../../components";
import { event } from "../../utils";
import api from "../../api";
import { WrapperContent } from '../../core/design';

import './styles.css';

export default function Consult({ history }) {
    const admin = userService.getUserLogged().company;
    const [open, setOpen] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const handleOpen = () => { setOpen(true) };
    const handleClose = () => { setOpen(false) };
    const handleRefresh = () => { setRefresh(!refresh) };
    const [processing, setProcessing] = useState(false);

    const [loading, setLoading] = useState(true);
    const [quotations, setQuotations] = useState([]);
    const [selecteds, setSelecteds] = useState([]);
    const [pagination, setPagination] = useState({ limit: 10, offset: 0, count: 0, page: 0 });
    const [filters, setFilters] = useState({ 
        order: "desc", 
        all: true, 
        orderBy: "createdAt", 
        filterBy: "client_name", 
        closedOnly: false, 
        text: "" 
    });

    const headCells = [
        { id: 'id', numeric: false, disablePadding: true, label: 'ID' },
        { id: 'name', numeric: false, disablePadding: false, label: 'Nome do Cliente' },
        { id: 'closed', numeric: false, disablePadding: false, label: 'Status' },
        { id: 'transporte', numeric: true, disablePadding: false, label: 'Tipo' },
        { id: 'filename', numeric: true, disablePadding: false, label: 'Nome da cotação' },
        { id: 'created_at', numeric: true, disablePadding: false, label: 'Data da cotação' },
        { id: 'actions', numeric: true, disablePadding: false, label: 'Ações' },
        //{ id: 'edit', numeric: true, disablePadding: false, label: 'Editar' }
    ];

    function handlePagination(e) {
        const { value, name } = e.target;
        setPagination(pagination => ({ ...pagination, [name]: value }));
    }

    function handleFilters(e) {
        const { value, name } = e.target;
        setFilters(filters => ({ ...filters, [name]: value }));
    }

    const handleLoading = () => { setLoading(!loading) }; 

    useEffect(() => {
        async function index() {
            setLoading(true);
            const endpoint = `/internal/${admin.id}/quotations`;
            try {
                let { order, orderBy, closedOnly, filterBy, text, all } = filters;

                const response = await api.get(endpoint, {
                    params: {
                        ...pagination,
                        order: order.toUpperCase(),
                        orderBy,
                        closedOnly,
                        filterBy,
                        text,
                        all,
                    },
                });
                
                const { count, rows } = response.data;
                handlePagination(event("count", count));
                
                if(rows.length > 0) {
                    setQuotations(rows);
                }
    
                setLoading(false);
                setProcessing(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
                setProcessing(false);
            }
        }

        index();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        filters.order,
        filters.orderBy,
        filters.all,
        filters.closedOnly,
        filters.filterBy,
        filters.text,
        pagination.limit,
        pagination.offset,
        refresh,
        admin.id
    ]);

    async function handleMarkClosed(selecteds=[], closed) {
        setProcessing(true);
        try {
            await Promise.all(selecteds.map(id => {
                return api.put(`/internal/quotations/${id}/update`, { closed });
            }));
            handleRefresh();
        } catch (error) {
            alert("Erro: não foi possível atualizar a(s) selecionada(s)!");
            setProcessing(false);
        }
    }

    function handleDelete(selecteds) {
        setSelecteds(selecteds);
        handleOpen();
    }

    async function onConfirmDelete() {
        handleClose();
        setProcessing(true);
        try {
            await Promise.all(selecteds.map(id => {
                return api.delete(`/internal/quotations/${id}/delete`);
            }));
            handleRefresh();
        } catch (error) {
            alert("Erro: não foi possível excluir a(s) selecionada(s)!");
            setProcessing(false);
        }
    }

    const goDetails = (id) => { history.push(`/${id}/details`) };

    return(
        <WrapperContent>
            <section id="consult" className="consult">
            <Alert 
                open={open} 
                title="Confirmar exclusão" 
                message="Excluir selecionada(s)?" 
                onConfirm={onConfirmDelete}
                onCancel={handleClose}
            />
            {processing ? <Loader title="Atualizando base de dados" /> : (
                <Fragment>
                    <PageTitle title="Consultar Cotações" subtitle="Lista de cotações" />
                    <QuotationList 
                        history={history}
                        filters={filters}
                        loading={loading}
                        pagination={pagination}
                        headCells={headCells} 
                        goDetails={goDetails}
                        handleFilters={handleFilters}
                        handleLoading={handleLoading}
                        handleDelete={handleDelete}
                        handleMarkClosed={handleMarkClosed}
                        handlePagination={handlePagination}
                        rows={quotations} 
                    />
                </Fragment>
            )}
        </section>
        </WrapperContent>
    );
}