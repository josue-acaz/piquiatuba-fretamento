import React, {useState} from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useSelector } from 'react-redux';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import Autocompletar from '../../../components/Autocompletar';
import { Row, Col } from 'react-bootstrap';
import { PageTitle, GoBack, Input, Button, Alert, InputAdorment, TextArea, IOSSwitch } from "../../../components";
import { WrapperContent, FlexContent } from '../../../core/design';
import { baseURL, EnumAircraftType, EnumAircraftCarrier, EnumAircraftEngineType, EnumAircraftNumberEngines } from '../../../global';
import { useFeedback } from '../../../core/feedback/feedback.context';
import api from '../../../api';
import { formatCurrency, priceToFloat } from '../../../utils';

import './styles.css';

export default function AddAircraft({history}) {
    const feedback = useFeedback();
    const authenticated = useSelector(state => state.authentication.user);
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [inputs, setInputs] = useState({
        prefix: '',
        name: '',
        type: '',
        manufacturer: '',
        carrier_dimensions:  '',
        engine_type:  '',
        description:  '',
        year:  '',
        crew:  '',
        passengers:  '',
        empty_weight:  '',
        autonomy:  '',
        maximum_takeoff_weight:  '',
        maximum_speed:  '',
        cruising_speed:  '',
        range:  '',
        fixed_price_radius:  '',
        price_per_km_passengers:  '',
        fixed_price_for_passenger_transport:  '',
        price_per_km_aeromedical:  '',
        fixed_price_for_aeromedical_transport:  '',
        number_of_engines:  '',
        carrier:  '',
        pressurized:  false,
        operates_aeromedical_transport:  false,
        base_id: '',
    });

    function handleGoBack() {
        history.goBack();
    }
    
    function handleChange(e) {
        let {name, value} = e.target;

        if(name === 'price_per_km_passengers' 
        || name === 'fixed_price_for_passenger_transport'
        || name === 'price_per_km_aeromedical'
        || name === 'fixed_price_for_aeromedical_transport') {
            if(!(value.length <= 13)) { // impede números grandes
                return;
            }
            value = formatCurrency(value);
        }

        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    function handleBaseSelected(op) {
        handleChange({target: {
            name: 'base_id',
            value: op.target.value.id,
        }});
    }

    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);

        if(
            inputs.prefix && 
            inputs.name && 
            inputs.type &&
            inputs.year &&
            inputs.crew &&
            inputs.autonomy &&
            inputs.range && 
            inputs.cruising_speed && 
            inputs.maximum_speed && 
            inputs.empty_weight && 
            inputs.maximum_takeoff_weight && 
            inputs.carrier && 
            inputs.carrier_dimensions && 
            inputs.manufacturer && 
            inputs.price_per_km_passengers && 
            inputs.fixed_price_for_passenger_transport && 
            inputs.fixed_price_radius && 
            inputs.engine_type && 
            inputs.number_of_engines &&
            inputs.base_id) {

            if(inputs.operates_aeromedical_transport) {
                if(!inputs.price_per_km_aeromedical || !inputs.fixed_price_for_aeromedical_transport) {
                    return;
                }
            }

            setOpen(true);
        }
    }

    async function handleAdd() {
        let data = {
            prefix: inputs.prefix.trim().toUpperCase(),
            name: inputs.name.trim(),
            type: inputs.type,
            manufacturer: inputs.manufacturer.trim(),
            carrier_dimensions: inputs.carrier_dimensions,
            engine_type: inputs.engine_type,
            year: Number(inputs.year),
            crew: Number(inputs.crew),
            passengers: Number(inputs.passengers),
            empty_weight: Number(inputs.empty_weight),
            autonomy: Number(inputs.autonomy),
            maximum_takeoff_weight: Number(inputs.maximum_takeoff_weight),
            maximum_speed: Number(inputs.maximum_speed),
            cruising_speed: Number(inputs.cruising_speed),
            range: Number(inputs.range),
            fixed_price_radius: Number(inputs.fixed_price_radius),
            price_per_km_passengers: priceToFloat(inputs.price_per_km_passengers),
            fixed_price_for_passenger_transport: priceToFloat(inputs.fixed_price_for_passenger_transport),
            number_of_engines: inputs.number_of_engines,
            carrier: inputs.carrier,
            pressurized: inputs.pressurized,
            operates_aeromedical_transport: inputs.operates_aeromedical_transport,
            description: inputs.description.trim(),
        };

        if(inputs.operates_aeromedical_transport) {
            data.price_per_km_aeromedical = priceToFloat(inputs.price_per_km_aeromedical);
            data.fixed_price_for_aeromedical_transport = priceToFloat(inputs.fixed_price_for_aeromedical_transport);
        }
        
        setProcessing(true);
        console.log(authenticated);
        try {
            await api.post('/aircrafts', data, {
                headers: {
                    base_id: inputs.base_id,
                    user_id: authenticated.user.id,
                }
            });
            setProcessing(false);
            setOpen(false);
            feedback.open({
                severity: 'success',
                msg: 'Aeronave adicionada com sucesso!',
            });
            history.goBack();
        } catch (error) {
            setProcessing(false);
            setOpen(false);
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro!',
            });
            console.error(error);
        }
    }

    // Se opera transporte aeromedico
    function handleChangeOperateAeromedicalTransport(e) {
        handleChange({target: {
            name: 'operates_aeromedical_transport',
            value: e.target.checked,
        }});
    }

    // Se a aeronave é pressuzirada
    function handleChangePressurized(e) {
        handleChange({target: {
            name: 'pressurized',
            value: e.target.checked,
        }});
    }

    return(
        <WrapperContent>
            <Alert 
                open={open} 
                processing={processing}
                title="Adicionar nova aeronave?"
                message={`A aeronave ${inputs.name} será adicionada!`}
                processingTitle="Adicionando aeronave..."
                processingMsg="Por favor, aguarde!"
                onConfirm={handleAdd}
                onCancel={() => setOpen(false)}
            />
            <section id="new-aircraft" className="new-aircraft">
                <GoBack onClick={handleGoBack} />
                <PageTitle title="Nova aeronave" subtitle="Piquiatuba Táxi Aéreo" />
            </section>

            <form id="new-aircraft-form" onSubmit={handleSubmit}>
                <Row className="center-padding">
                    <Col sm="2">
                        <label>Prefixo</label>
                        <Input  
                            name="prefix" 
                            value={inputs.prefix}
                            placeholder="Prefixo da aeronave"
                            onChange={handleChange} 
                            decoration="primary"
                            error={submitted && !inputs.prefix}
                        />
                    </Col>
                    <Col sm="6">
                        <label>Modelo da aeronave</label>
                        <Input  
                            name="name" 
                            value={inputs.name}
                            placeholder="Modelo da aeronave"
                            onChange={handleChange} 
                            decoration="primary"
                            error={submitted && !inputs.name}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Tipo de aeronave</label>
                        <Select 
                            id="type" 
                            name="type" 
                            className="select" 
                            displayEmpty
                            value={inputs.type}
                            disableUnderline={true}
                            onChange={handleChange}
                        >
                            <MenuItem disabled value="">
                                <em>Tipo de aeronave...</em>
                            </MenuItem>
                            {EnumAircraftType.map(aircraft_type => <MenuItem key={aircraft_type.key} value={aircraft_type.key}>{aircraft_type.value}</MenuItem>)}
                        </Select>
                        {(submitted && !inputs.type) && <span className="error">Este campo é obrigatório.</span>}
                    </Col>
                    <Col sm="4">
                        <label>Ano</label>
                        <Input  
                            name="year" 
                            type="number"
                            value={inputs.year}
                            placeholder="Ano da aeronave"
                            onChange={handleChange} 
                            decoration="primary"
                            error={submitted && !inputs.year}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Tripulação</label>
                        <Input  
                            name="crew" 
                            type="number"
                            value={inputs.crew}
                            placeholder="Nº de tripulantes"
                            onChange={handleChange} 
                            decoration="primary"
                            error={submitted && !inputs.crew}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Passageiros</label>
                        <Input  
                            name="passengers" 
                            type="number"
                            value={inputs.passengers}
                            placeholder="Nº de passageiros"
                            onChange={handleChange} 
                            decoration="primary"
                            error={submitted && !inputs.passengers}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Autonomia da aeronave</label>
                        <InputAdorment
                            name="autonomy"
                            type="number"
                            adorment={<p>h</p>}
                            adormentPosition="end"
                            value={inputs.autonomy} 
                            onChange={handleChange}
                            decoration="secondary"
                            placeholder="Autonomia da aeronave em horas"
                            error={submitted && !inputs.autonomy}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Alcance</label>
                        <InputAdorment
                            name="range"
                            type="number"
                            adorment={<p>Km</p>}
                            adormentPosition="end"
                            value={inputs.range} 
                            onChange={handleChange}
                            decoration="secondary"
                            placeholder="Alcance da aeronave em Km"
                            error={submitted && !inputs.range}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Velocidade de Cruzeiro</label>
                        <InputAdorment
                            name="cruising_speed"
                            type="number"
                            adorment={<p>Km/h</p>}
                            adormentPosition="end"
                            value={inputs.cruising_speed} 
                            onChange={handleChange}
                            decoration="secondary"
                            placeholder="Velocidade de cruzeiro da aeronave em Km/h"
                            error={submitted && !inputs.cruising_speed}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Velocidade Máxima</label>
                        <InputAdorment
                            name="maximum_speed"
                            type="number"
                            adorment={<p>Km/h</p>}
                            adormentPosition="end"
                            value={inputs.maximum_speed} 
                            onChange={handleChange}
                            decoration="secondary"
                            placeholder="Velocidade máxima da aeronave em Km/h"
                            error={submitted && !inputs.maximum_speed}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Peso da aeronave vazia</label>
                        <InputAdorment
                            name="empty_weight"
                            type="number"
                            adorment={<p>Kg</p>}
                            adormentPosition="end"
                            value={inputs.empty_weight} 
                            onChange={handleChange}
                            decoration="secondary"
                            placeholder="Peso da aeronave vazia em Kg"
                            error={submitted && !inputs.empty_weight}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Peso máximo para decolagem</label>
                        <InputAdorment
                            name="maximum_takeoff_weight"
                            type="number"
                            adorment={<p>Kg</p>}
                            adormentPosition="end"
                            value={inputs.maximum_takeoff_weight} 
                            onChange={handleChange}
                            decoration="secondary"
                            placeholder="Peso máximo para decolagem em Kg"
                            error={submitted && !inputs.maximum_takeoff_weight}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Tamanho do bagageiro</label>
                        <Select 
                            id="carrier" 
                            name="carrier" 
                            className="select" 
                            displayEmpty
                            value={inputs.carrier}
                            disableUnderline={true}
                            onChange={handleChange}
                        >
                            <MenuItem disabled value="">
                                <em>Tamanho do bagageiro...</em>
                            </MenuItem>
                            {EnumAircraftCarrier.map(aircraft_carrier => <MenuItem key={aircraft_carrier.key} value={aircraft_carrier.key}>{aircraft_carrier.value}</MenuItem>)}
                        </Select>
                        {(submitted && !inputs.carrier) && <span className="error">Este campo é obrigatório.</span>}
                    </Col>
                    <Col sm="4">
                        <label>Dimensões do bagageiro</label>
                        <Input  
                            name="carrier_dimensions" 
                            type="text"
                            value={inputs.carrier_dimensions}
                            placeholder="Ex.: 46cm x 50cm x 80cm"
                            onChange={handleChange} 
                            decoration="primary"
                            error={submitted && !inputs.carrier_dimensions}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Fabricante</label>
                        <Input  
                            name="manufacturer" 
                            type="text"
                            value={inputs.manufacturer}
                            placeholder="Fabricante da aeronave"
                            onChange={handleChange} 
                            decoration="primary"
                            error={submitted && !inputs.manufacturer}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Base de referência</label>
                        <Autocompletar 
                            name="base_id"
                            Icon={LocationSearchingIcon}
                            endpoint={baseURL+'/bases/autocomplete'}
                            fieldName="name"
                            renderOption={(op) => (<div>{op.name}</div>)} 
                            onOptionSelected={handleBaseSelected}
                            placeholder="Escolha a base de referência da aeronave..."
                            error={submitted && !inputs.base_id}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Preço por Km (passageiros)</label>
                        <InputAdorment  
                            name="price_per_km_passengers" 
                            type="text"
                            adormentPosition="start"
                            adorment={<p>R$</p>}
                            value={inputs.price_per_km_passengers}
                            placeholder="Preço por Km para o transporte de passageiros..."
                            onChange={handleChange} 
                            decoration="secondary"
                            error={submitted && !inputs.price_per_km_passengers}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Preço fixo Km (passageiros)</label>
                        <InputAdorment  
                            name="fixed_price_for_passenger_transport" 
                            type="text"
                            adormentPosition="start"
                            adorment={<p>R$</p>}
                            value={inputs.fixed_price_for_passenger_transport}
                            placeholder="Preço fixo para o transporte de passageiros..."
                            onChange={handleChange} 
                            decoration="secondary"
                            error={submitted && !inputs.fixed_price_for_passenger_transport}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Raio do preço fixo</label>
                        <InputAdorment  
                            name="fixed_price_radius" 
                            type="text"
                            adormentPosition="end"
                            adorment={<p>Km</p>}
                            value={inputs.fixed_price_radius}
                            placeholder="Raio do preço fixo em Km"
                            onChange={handleChange} 
                            decoration="secondary"
                            error={submitted && !inputs.fixed_price_radius}
                        />
                    </Col>
                    <Col sm="4">
                        <label>Tipo de motor</label>
                        <Select 
                            id="engine_type" 
                            name="engine_type" 
                            className="select" 
                            displayEmpty
                            value={inputs.engine_type}
                            disableUnderline={true}
                            onChange={handleChange}
                        >
                            <MenuItem disabled value="">
                                <em>Escolha o tipo de motor...</em>
                            </MenuItem>
                            {EnumAircraftEngineType.map(aircraft_engine_type => <MenuItem key={aircraft_engine_type.key} value={aircraft_engine_type.key}>{aircraft_engine_type.value}</MenuItem>)}
                        </Select>
                        {(submitted && !inputs.engine_type) && <span className="error">Este campo é obrigatório.</span>}
                    </Col>
                    <Col sm="4">
                        <label>Caracterização quanto a quantidade de motores</label>
                        <Select 
                            id="number_of_engines" 
                            name="number_of_engines" 
                            className="select" 
                            displayEmpty
                            value={inputs.number_of_engines}
                            disableUnderline={true}
                            onChange={handleChange}
                        >
                            <MenuItem disabled value="">
                                <em>Quantidade de motores...</em>
                            </MenuItem>
                            {EnumAircraftNumberEngines.map(aircraft_number_of_engines => <MenuItem key={aircraft_number_of_engines.key} value={aircraft_number_of_engines.key}>{aircraft_number_of_engines.value}</MenuItem>)}
                        </Select>
                        {(submitted && !inputs.number_of_engines) && <span className="error">Este campo é obrigatório.</span>}
                    </Col>
                </Row>

                <FlexContent>
                    <div className="operate-aeromedical">
                        <label>Opera transporte aeromédico?</label>
                        <div className="aeromedical">
                            <div className="aeromedical-switch">
                                <IOSSwitch 
                                    checked={inputs.operates_aeromedical_transport} 
                                    onChange={handleChangeOperateAeromedicalTransport} 
                                    name="operates_aeromedical_transport"
                                />
                            </div>
                            <div className="paragraph">
                                <p><strong>{inputs.operates_aeromedical_transport ? 'SIM' : 'NÃO'}</strong></p>
                            </div>
                        </div>
                    </div>
                    <div className="aircraft-pressurized">
                        <label>Aeronave pressuizada?</label>
                        <FlexContent>
                            <div className="pressurized-switch">
                                <IOSSwitch 
                                    checked={inputs.pressurized} 
                                    onChange={handleChangePressurized} 
                                    name="pressurized"
                                />
                            </div>
                            <div className="paragraph">
                                <p><strong>{inputs.pressurized ? 'SIM' : 'NÃO'}</strong></p>
                            </div>
                        </FlexContent>
                    </div>
                </FlexContent>

                {inputs.operates_aeromedical_transport && (
                    <Row className="center-padding">
                        <Col sm="6">
                            <label>Preço por Km (aeromédico)</label>
                            <InputAdorment  
                                name="price_per_km_aeromedical" 
                                type="text"
                                adormentPosition="start"
                                adorment={<p>R$</p>}
                                value={inputs.price_per_km_aeromedical}
                                placeholder="Preço por Km para o transporte aeromédico..."
                                onChange={handleChange} 
                                decoration="secondary"
                                error={submitted && !inputs.price_per_km_aeromedical}
                            />
                        </Col>
                        <Col sm="6">
                            <label>Preço fixo Km (aeromédico)</label>
                            <InputAdorment  
                                name="fixed_price_for_aeromedical_transport" 
                                type="text"
                                adormentPosition="start"
                                adorment={<p>R$</p>}
                                value={inputs.fixed_price_for_aeromedical_transport}
                                placeholder="Preço fixo para o transporte aeromédico..."
                                onChange={handleChange} 
                                decoration="secondary"
                                error={submitted && !inputs.fixed_price_for_aeromedical_transport}
                            />
                        </Col>
                    </Row>
                )}

                <Row className="center-padding">
                    <Col sm="12">
                        <label>Descrição</label>
                        <TextArea 
                            name="description" 
                            value={inputs.description} 
                            placeholder="Descrição para essa aeronave..." 
                            onChange={handleChange}
                        />
                    </Col>
                </Row>
            
                <Button type="submit">Salvar</Button>
            </form>
        </WrapperContent>
    );
}