import React, {useEffect, useState} from 'react';
import {WrapperContent, FlexContent, FlexSpaceBetween} from '../../core/design';
import {PageTitle} from '../../components';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import SmsIcon from '@material-ui/icons/Sms';
import Switch from '@material-ui/core/Switch';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import api from '../../api';
//import no_image from '../../assets/img/no-image.png';

import './styles.css';

function AdminRow({admin, onUpdate}) {
    const {user} = admin;
    const [inputs, setInputs] = useState({
        receive_whatsapp_notification: false,
        receive_sms_notification: false,
        create: false,
        read: false,
        update: false,
        delete: false,
    });

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

    return(
        <tr className="admin-row">
            <td style={{textAlign: 'left'}}>
                <div className="admin-prefix">{user.name.substring(0, 2).toUpperCase()}</div>
            </td>
            <td style={{textAlign: 'left'}}>{user.name}</td>
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
                        <IconButton>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </td>
        </tr>
    );
}

export default function Config() {
    const [loading, setLoading] = useState(true);
    const [admins, setAdmins] = useState([]);

    useEffect(() => {
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

        index();
    }, []);

    async function handleUpdate(user_id, data) {
        try {
            const response = await api.put(`/admins/${user_id}/update`, data);
            console.log(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    return(
        <WrapperContent>
            <section id="config" className="config">
            <PageTitle title="Configurações" subtitle="Gerenciar ou alterar configurações" />
            
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
                        {admins.map(admin => <AdminRow admin={admin} onUpdate={handleUpdate} />)}
                    </table>
                </div>
            )}
            
            </section>
        </WrapperContent>
    );
}