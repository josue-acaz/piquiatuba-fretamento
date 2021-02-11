import React, {useState} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { EnumAircraftStatus } from '../../global';
import { Row, Col } from 'react-bootstrap';
import TextArea from '../TextArea';
import DateTimerPicker from '../DateTimerPicker';
import Tooltip from '@material-ui/core/Tooltip';

import './styles.css';

const AircraftStatusSelect = ({aircraft_id, status, handleUpdate}) => {
    const [open, setOpen] = useState(false);
    const [inputs, setInputs] = useState({
        status,
        annotation: '',
        initial_datetime: '',
        final_datetime: '',
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    };

    function handleConfirm() {
        setOpen(false);
        handleUpdate(aircraft_id, inputs);
    }

    function handleOpenDialog() {
        setOpen(true);
    }

    function getStatusName(status_key) {
        return EnumAircraftStatus.find(aircraft_status => aircraft_status.key === status_key).value;
    }

    return(
        <Tooltip title="Clique para adicionar um novo status">
            <div className={`aircraft-status-select aircraft-status-${inputs.status}`}>
                <div onClick={handleOpenDialog} className={`select-status select-${inputs.status}`}>
                    <p>{getStatusName(inputs.status)}</p>
                </div>
                <Dialog className="dialog-status-update" fullScreen fullWidth open={open} onClose={() => setOpen(false)} aria-labelledby="form-dialog-title">
                    <DialogTitle id="dialog-title">Novo status</DialogTitle>
                    <DialogContent className="aircraft-status-select-form">
                        <Row className="center-padding">
                            <Col sm="12">
                                <label>Status</label>
                                <Select 
                                    id="status" 
                                    name="status" 
                                    displayEmpty
                                    className="select"
                                    value={inputs.status}
                                    disableUnderline={true}
                                    onChange={handleChange}
                                >
                                    <MenuItem disabled value="">
                                        <em>Status da aeronave...</em>
                                    </MenuItem>
                                    {EnumAircraftStatus.map(aircraft_status => <MenuItem key={aircraft_status.key} value={aircraft_status.key}>{aircraft_status.value}</MenuItem>)}
                                </Select>
                            </Col>
                            <Col className="col-field" sm="6">
                                <label>Data de início</label>
                                <DateTimerPicker 
                                    name="initial_datetime"
                                    value={inputs.initial_datetime}
                                    onChange={handleChange}
                                    maxDate={inputs.final_datetime}
                                />
                            </Col>
                            <Col className="col-field" sm="6">
                                <label>Data de fim</label>
                                <DateTimerPicker 
                                    name="final_datetime"
                                    value={inputs.final_datetime}
                                    onChange={handleChange}
                                    minDate={inputs.initial_datetime}
                                />
                            </Col>
                            <Col className="col-field" sm="12">
                                <label>Anotação</label>
                                <TextArea 
                                    name="annotation" 
                                    value={inputs.annotation}
                                    onChange={handleChange} 
                                    placeholder="Forneça uma descrição..."
                                />
                            </Col>
                        </Row>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={handleConfirm} color="default">
                            Cancelar
                        </Button>
                        <Button variant="contained" onClick={handleConfirm} color="primary">
                            Adicionar
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Tooltip>
    );
};

export default AircraftStatusSelect;