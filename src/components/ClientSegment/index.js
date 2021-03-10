import React, {useState, useEffect} from 'react';
import Input from '../../components/Input';
import {SegmentCard, FlexContent} from '../../core/design';
import {Row, Col} from 'react-bootstrap';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {EnumTypeOfTransport} from '../../global';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import Switch from '@material-ui/core/Switch';

import './styles.css';

export default function ClientSegment({defaultValues, submitted, onChange}) {
    const [inputs, setInputs] = useState(defaultValues ? defaultValues : {
        client_name: '',
        type_of_transport: '',
        ambulance_at_origin: false,
        ambulance_at_destination: false,
    });

    function handleChange(e) {
        const {name, value} = e.target;
        setInputs(inputs => ({ ...inputs, [name]: name.includes('ambulance') ? e.target.checked : value }));
    }

    useEffect(() => {
        onChange(inputs);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        inputs.client_name,
        inputs.type_of_transport,
        inputs.ambulance_at_origin,
        inputs.ambulance_at_destination,
    ]);

    return(
        <SegmentCard className="client-segment">
            <h3>Cliente</h3>
            <Row className="center-padding">
                <Col sm="6">
                    <label>Nome do cliente*</label>
                    <Input 
                        id="client_name"
                        type="text"
                        name="client_name" 
                        value={inputs.client_name} 
                        onChange={handleChange} 
                        placeholder="Nome do cliente"
                        error={submitted && !inputs.client_name}
                    />
                </Col>
                <Col sm="6">
                    <label>Tipo de transporte*</label>
                    <Select 
                        id="type_of_transport" 
                        name="type_of_transport"  
                        displayEmpty
                        value={inputs.type_of_transport}
                        disableUnderline={true}
                        onChange={handleChange}
                        className="select"
                    >
                        <MenuItem disabled value="">
                            <em>Tipo de transporte...</em>
                        </MenuItem>
                        {EnumTypeOfTransport.map(type_of_transport => <MenuItem key={type_of_transport.key} value={type_of_transport.key}>{type_of_transport.value}</MenuItem>)}
                    </Select>
                    {(submitted && !inputs.type_of_transport) && <span className="error">Este campo é obrigatório.</span>}
                </Col>
            </Row>

            {(inputs.type_of_transport === 'aeromedical') && (
                <div className="aeromedical">
                    <FlexContent>
                        <AddBoxOutlinedIcon className="aeromedical-icon" />
                        <h3 className="aeromedical-title">Aeromédico</h3>
                    </FlexContent>
                    
                    <FlexContent className="ambulance-config">
                        <FlexContent className="switch-ambulance">
                            <label>Ambulância na origem</label>
                            <Switch 
                                id="ambulance_at_origin"
                                name="ambulance_at_origin"
                                checked={inputs.ambulance_at_origin} 
                                onChange={handleChange}
                            />
                        </FlexContent>
                        <FlexContent className="switch-ambulance">
                            <label>Ambulância na destino</label>
                            <Switch 
                                id="ambulance_at_destination"
                                name="ambulance_at_destination"
                                checked={inputs.ambulance_at_destination} 
                                onChange={handleChange}
                            />
                        </FlexContent>
                    </FlexContent>
                </div>
            )}
        </SegmentCard>
    );
}