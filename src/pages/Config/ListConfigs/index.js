import React, {useEffect, useState} from 'react';
import {WrapperContent, FlexContent, FlexSpaceBetween} from '../../../core/design';
import {useRouteMatch} from 'react-router-dom';
import {PageTitle} from '../../../components';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import SmsIcon from '@material-ui/icons/Sms';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import Alert from '../../../components/Alert';
import AddIcon from '@material-ui/icons/AddOutlined';
import DeleteIcon from '@material-ui/icons/Delete';
import {useFeedback} from '../../../core/feedback/feedback.context';
import CircularProgress from '@material-ui/core/CircularProgress';
import api from '../../../api';
//import no_image from '../../assets/img/no-image.png';

import './styles.css';

function AdminRow({admin, onUpdate, handleRefresh, path, history}) {
    const {user} = admin;
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const feedback = useFeedback();
    const [inputs, setInputs] = useState({
        receive_whatsapp_notification: false,
        receive_sms_notification: false,
        create: false,
        read: false,
        update: false,
        delete: false,
    });

    async function handleDelete(admin_id) {
        setOpen(false);
        setProcessing(true);
        try {
            await api.delete(`/admins/${admin_id}/delete`);
            setProcessing(false);
            feedback.open({
                severity: 'success',
                msg: 'Operação realizada com sucesso!',
            });
            handleRefresh();
        } catch (error) {
            setProcessing(false);
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro.',
            });
            console.error(error);
        }
    }

    useEffect(() => {
        Object.keys(admin).forEach(key => {
            const value = admin[key];

            if(key === 'receive_whatsapp_notification' || key === 'receive_sms_notification') {
                setInputs(inputs => ({ ...inputs, [key]: value }));
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleChange(e) {
        const {name, value, checked} = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value ? value : checked }));

        let data = {};
        if(name === 'receive_sms_notification' || name === 'receive_whatsapp_notification') {
            data.admin = {
                [name]: checked,
            };
        } else {
            data.user = {
                [name]: checked,
            };
        }

        if(!value) {
            onUpdate(user.id, data);
        }
    }

    function handleEdit(admin_id) {
        history.push(`${path}/${admin_id}/edit`);
    }

    return(
        <tr className="admin-row">
            <Alert 
                open={open} 
                title="Excluir adminstrador?" 
                message="Esta ação não poderá ser desfeita. Deseja continuar?" 
                onCancel={() => setOpen(false)}  
                onConfirm={() => handleDelete(admin.id)} 
            />
            <td style={{textAlign: 'left'}}>
                <div className="admin-prefix">{user.name.substring(0, 2).toUpperCase()}</div>
            </td>
            <td style={{textAlign: 'left'}}>
                <div className="name_and_sector">{`${user.name} (${admin.sector})`}</div>
                <div className="admin-email">{user.email}</div>
            </td>
            <td>
                <FlexSpaceBetween>
                    <div className="permission">
                        <FlexContent>
                            <Switch 
                                name="create" 
                                checked={inputs.create} 
                                onChange={handleChange}
                                color="primary"
                            />
                            <p>Create</p>
                        </FlexContent>
                    </div>
                    <div className="permission">
                        <FlexContent>
                            <Switch 
                                name="read" 
                                checked={inputs.read} 
                                onChange={handleChange}
                                color="primary"
                            />
                            <p>Read</p>
                        </FlexContent>
                    </div>
                    <div className="permission">
                        <FlexContent>
                            <Switch 
                                name="update" 
                                checked={inputs.update} 
                                onChange={handleChange}
                                color="primary"
                            />
                            <p>Update</p>
                        </FlexContent>
                    </div>
                    <div className="permission">
                        <FlexContent>
                            <Switch 
                                name="delete" 
                                checked={inputs.delete} 
                                onChange={handleChange}
                                color="primary"
                            />
                            <p>Delete</p>
                        </FlexContent>
                    </div>
                </FlexSpaceBetween>
            </td>
            <td style={{textAlign: 'right'}}>
                <div className="notifications">
                    <FlexContent>
                        <div className="whatsapp">
                            <FlexContent>
                                <WhatsAppIcon />
                                <p>Whatsapp</p>
                                <Switch 
                                    name="receive_whatsapp_notification" 
                                    checked={inputs.receive_whatsapp_notification}
                                    onChange={handleChange}
                                    color="primary"
                                />
                            </FlexContent>
                        </div>
                        <div className="sms">
                            <FlexContent>
                                <SmsIcon />
                                <p>Sms</p>
                                <Switch 
                                    name="receive_sms_notification" 
                                    checked={inputs.receive_sms_notification}
                                    onChange={handleChange}
                                    color="primary"
                                />
                            </FlexContent>
                        </div>
                    </FlexContent>
                </div>
            </td>
            <td style={{textAlign: 'right'}}>
                <div className="actions">
                    <Tooltip title="Editar administrador">
                        <IconButton onClick={() => handleEdit(admin.id)}>
                            <EditIcon className="icon" />
                        </IconButton>
                    </Tooltip>
                    <div className="delete-action">
                        {processing ? <CircularProgress size={20} className="spinner-delete" color="secondary" /> : (
                            <Tooltip title="Excluir adminstrador">
                                <IconButton className="delete-admin-btn" onClick={() => setOpen(true)}>
                                    <DeleteIcon className="icon" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
}

export default function ListConfigs({history}) {
    const [loading, setLoading] = useState(true);
    const [admins, setAdmins] = useState([]);
    const {path} = useRouteMatch();

    async function index() {
        try {
            const response = await api.get('/admins/pagination');
            const {count, rows} = response.data;
            setAdmins(rows);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

    useEffect(() => {
        index();
    }, []);

    async function handleRefresh() {
        index();
    }

    async function handleUpdate(user_id, data) {
        try {
            const response = await api.put(`/admins/${user_id}/update`, data);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    function handleAddAdmin() {
        history.push(`${path}/0/edit`);
    }

    return(
        <WrapperContent>
            <section id="config" className="config">
            <FlexSpaceBetween>
                <PageTitle title="Configurações" subtitle="Gerenciar ou alterar configurações" />
                <Tooltip title="Adicionar aeronave">
                    <IconButton onClick={handleAddAdmin}>
                        <AddIcon className="icon" />
                    </IconButton>
                </Tooltip>
            </FlexSpaceBetween>
            
            {loading ? <p>Carregando...</p> : (
                <div className="admin-table">
                    <h3>Adminstradores</h3>
                    <table id="admins">
                        <tr>
                            <th>#Code</th>
                            <th>Nome</th>
                            <th>Permissões</th>
                            <th>Notificações</th>
                            <th>Ações</th>
                        </tr>
                        {admins.map((admin, index) => <AdminRow key={index} path={path} admin={admin} onUpdate={handleUpdate} handleRefresh={handleRefresh} history={history} />)}
                    </table>
                </div>
            )}
            
            </section>
        </WrapperContent>
    );
}