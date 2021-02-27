import React, { useState, useEffect } from 'react';
import Autocompletar from '../Autocompletar';
import { Row, Col } from 'react-bootstrap';
import { FlexSpaceBetween, FlexContent } from '../../core/design';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import AdjustIcon from '@material-ui/icons/Adjust';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {EnumFlightSegmentType} from '../../global';
import {formatCurrency, MinutesToHoursNotation} from '../../utils';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import api from '../../api';

import './styles.css';

export default function FlightSegment({
    type_of_transport,
    segmentNumber,
    enableRemove,
    submitted=false,
    onCompleted,
    onRemove,
    segmentInputs,
    onMissing,
    hide=false,
    completed,
    aircraft_id,
    defaultValues,
}) {
    const [inputs, setInputs] = useState(segmentInputs ? segmentInputs : {
        origin_city: '',
        origin_aerodrome: '',
        destination_city: '',
        destination_aerodrome: '',
        type: '',
    });

    const [initWithValues, setInitWithValues] = useState(!!defaultValues);
    const [distance, setDistance] = useState(defaultValues ? defaultValues.distance : 0);
    const [flightTime, setFlightTime] = useState(defaultValues ? defaultValues.flight_time : 0);

    const [expand, setExpand] = useState(false);
    function toggleExpand() {
        setExpand(!expand);
    }

    const {
        origin_city, 
        origin_aerodrome, 
        destination_city, 
        destination_aerodrome,
        type,
    } = inputs;

    function handleChange(e) {
        const {name, value} = e.target;
        let arr_name = name.split('_');

        // Autocompletar cidade baseado no aeródromo selecionado
        if(name === 'origin_aerodrome' || name === 'destination_aerodrome') {
            const fieldCity = `${arr_name[0]}_city`;
            if(!inputs[fieldCity]) {
                setInputs(inputs => ({ ...inputs, [fieldCity]: value.city }));
            }
        }

        // Limpar aeródromos quando a cidade for trocada
        if(name === 'origin_city' || name === 'destination_city') {
            const fieldAerodrome = `${arr_name[0]}_aerodrome`;
            if(!value) {
                setInputs(inputs => ({ ...inputs, [fieldAerodrome]: '' }));
            }
        }
        
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    async function calculateDistance(p1, p2) {
        const response = await api.get('/distance-between-two-coordinates', {
            params: {p1, p2}
        });

        const distance = Number(response.data);
        setDistance(distance.toFixed(2));

        // Calcular tempo de voo
        if(aircraft_id) {
            calculateFlightTime(aircraft_id, distance);
        }

        // Só dizer que está completo o trecho quando a aeronave e tipo de transporte for fornecido
        if(type && aircraft_id && type_of_transport) {
            onCompleted(segmentNumber, {
                inputs: {
                    origin_city, 
                    origin_aerodrome, 
                    destination_city, 
                    destination_aerodrome,
                    type,
                },
                distance,
                flight_time: flightTime,
            });
        }
    }

    async function calculateFlightTime(aircraft_id, distance) {
        const response = await api.get('flight-time', {
            params: {distance},
            headers: {aircraft_id},
        });

        const flight_time = Number(response.data);
        setFlightTime(flight_time);
    }

    useEffect(() => {
        if(!initWithValues) {
            // Calcular distância
            if(origin_aerodrome && destination_aerodrome) {
                const p1 = {
                    latitude: origin_aerodrome.latitude,
                    longitude: origin_aerodrome.longitude,
                };

                const p2 = {
                    latitude: destination_aerodrome.latitude,
                    longitude: destination_aerodrome.longitude,
                };

                calculateDistance(p1, p2);
            }

            // Acionar gatilho de informação faltando
            if(!origin_aerodrome || !destination_aerodrome || !type_of_transport || !aircraft_id) {
                if(!completed) {
                    onMissing(segmentNumber);
                }
            }
        }

        setInitWithValues(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        type,
        origin_aerodrome, 
        destination_aerodrome,
        type_of_transport,
        aircraft_id,
    ]);

    function GetSegmentName() {
        return(
            <FlexContent>
                <h3>Trecho {segmentNumber}</h3>
                <FlexContent className="segment-summary">
                    <div className="aerodrome">{origin_aerodrome?.oaci_code}</div>
                    <ArrowRightAltIcon />
                    <div className="aerodrome">{destination_aerodrome?.oaci_code}</div>
                </FlexContent>
            </FlexContent>
        );
    }

    return(
        <div className="flight-segment">
            <FlexSpaceBetween>
                <GetSegmentName />
                {enableRemove && (
                    <Tooltip title="Remover trecho" onClick={() => onRemove(segmentNumber)}>
                        <IconButton className="btn-remove-segment">
                            <CloseOutlinedIcon className="icon" />
                        </IconButton>
                    </Tooltip>
                )}
                {completed && (
                    <Tooltip title={expand ? 'Mostrar menos' : 'Mostrar mais'} onClick={toggleExpand}>
                        <IconButton className="btn-expand">
                            {expand ? <ExpandMoreIcon className="icon" /> : <ChevronRightIcon className="icon" />}
                        </IconButton>
                    </Tooltip>
                )}
            </FlexSpaceBetween>
            <Divider className="divider-segment" />
            {hide ? (
                <div className="flight-segment-minimized">
                    <div className="content">
                        {expand && (
                            <div className="expand-content">
                                <p className="origin">{origin_aerodrome.full_name}, {origin_city.full_name}</p>
                                <p className="destination">{destination_aerodrome.full_name}, {destination_city.full_name}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flight-segment-editing">
                    <Row className="center-padding">
                        <Col sm="4">
                            <label>Cidade de Origem</label>
                            <Autocompletar
                                name="origin_city"
                                inputText={origin_city?.full_name}
                                fieldName="full_name"
                                renderOption={(op) => (<div>{op.full_name}</div>)}
                                endpoint="/cities/autocomplete"
                                placeholder="Informe a cidade de origem"
                                onOptionSelected={handleChange}
                                error={submitted && !origin_city}
                            />
                        </Col>
                        <Col sm="8">
                            <label>Aeródromo de Origem</label>
                            <Autocompletar
                                params={{
                                    city: origin_city?.name,
                                    uf: origin_city?.uf?.acronym,
                                }}
                                fieldName="name"
                                name="origin_aerodrome"
                                inputText={origin_aerodrome?.full_name}
                                renderOption={(op) => (<div>{op.full_name}</div>)} 
                                endpoint="/aerodromes/autocomplete"
                                placeholder="Informe o aeródromo de origem"
                                onOptionSelected={handleChange}
                                Icon={AdjustIcon}
                                error={submitted && !origin_aerodrome}
                            />
                        </Col>
                        <Col sm="4">
                            <label>Cidade de Destino</label>
                            <Autocompletar
                                name="destination_city"
                                inputText={destination_city?.full_name}
                                fieldName="full_name"
                                renderOption={(op) => (<div>{op.full_name}</div>)}
                                endpoint="/cities/autocomplete"
                                placeholder="Informe a cidade de destino"
                                onOptionSelected={handleChange}
                                error={submitted && !destination_city}
                            />
                        </Col>
                        <Col sm="8">
                            <label>Aeródromo de Destino</label>
                            <Autocompletar
                                params={{
                                    city: destination_city?.name,
                                    uf: destination_city?.uf?.acronym,
                                }}
                                inputText={destination_aerodrome?.full_name}
                                name="destination_aerodrome"
                                fieldName="name"
                                renderOption={(op) => (<div>{op.full_name}</div>)} 
                                endpoint="/aerodromes/autocomplete"
                                placeholder="Informe o aeródromo de destino"
                                onOptionSelected={handleChange}
                                Icon={LocationOnIcon}
                                error={submitted && !destination_aerodrome}
                            />
                        </Col>
                    </Row>
                </div>
            )}

            <FlexSpaceBetween className="segment-footer">
                <div className="segment-type">
                    <Select 
                        id="type" 
                        name="type"  
                        displayEmpty
                        value={type || ''}
                        disableUnderline={true}
                        onChange={handleChange}
                        className={`select-segment-type select-segment-${type}`}
                    >
                        <MenuItem disabled value="">
                            <em>Tipo de trecho...</em>
                        </MenuItem>
                        {EnumFlightSegmentType.map(flight_segment_type => <MenuItem key={flight_segment_type.key} value={flight_segment_type.key}>{flight_segment_type.value}</MenuItem>)}
                    </Select>
                    {(submitted && !type) && <span className="error">Este campo é obrigatório.</span>}
                </div>
                <FlexContent className="calculed">
                    <p className="calculed_distance"><strong>Distância: </strong> {formatCurrency(distance)}Km</p>
                    <p className="calculed_flight_time"><strong>Tempo de voo: </strong> {MinutesToHoursNotation(flightTime)}</p>
                </FlexContent>
            </FlexSpaceBetween>
        </div>
    );
}