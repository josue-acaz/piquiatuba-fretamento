import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import Autocompletar from '../Autocompletar';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import { FlexSpaceBetween, FlexContent, FlexVerticalSpaceBetween } from '../../core/design';
import { currency } from '../../utils';
import LocationOnOutlinedIcon from '@material-ui/icons/LocationOnOutlined';
import AircraftSchedule from '../AircraftSchedule';
import ScheduleIcon from '@material-ui/icons/Schedule';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';

import no_image from '../../assets/img/no-image.png';

import './styles.css';

function RenderAircraft({aircraft, operates_aeromedical_transport, serverDatetime}) {
    const [viewSchedule, setViewSchedule] = useState(false);

    function openSchedule() {
        setViewSchedule(true);
    }
    
    function closeSchedule() {
        setViewSchedule(false);
    }

    return(
        <div className="render-aircraft-segment">
            <AircraftSchedule 
                open={viewSchedule} 
                serverDatetime={serverDatetime}
                aircraft_id={aircraft.id} 
                aircraft_name={aircraft.full_name}
                handleClose={closeSchedule}
            />
            <FlexContent className="flex-aircraft-segment">
                <div className="thumbnail">
                    <img src={aircraft.thumbnail ? aircraft.thumbnail.url : no_image} alt="thumbnail" />
                    <div className="view-schedule">
                        <Tooltip title="Consultar programação">
                            <IconButton onClick={openSchedule}>
                                <ScheduleIcon className="icon" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <div className="details">
                    <FlexVerticalSpaceBetween>
                        <div className="main-aircraft-segment">
                            <FlexSpaceBetween className="header">
                                <h4 className="aircraft-name">{aircraft.name}</h4>
                                <h4 className="aircraft-prefix">{aircraft.prefix}</h4>
                            </FlexSpaceBetween>
                            <FlexContent>
                                <LocationOnOutlinedIcon className="icon" />
                                <p>Santarém, PA</p>
                            </FlexContent>
                        </div>
                        <div className="aircraft-summary">
                            <p><strong>{aircraft.passengers} Passageiros</strong></p>
                            <p><strong>Velocidade: </strong>{aircraft.cruising_speed}Km/h (cruzeiro), {aircraft.maximum_speed}Km/h (máxima).</p>
                            {operates_aeromedical_transport ? (
                                aircraft.operates_aeromedical_transport && (
                                    <p><strong>Preço (aeromédico): </strong>Até {aircraft.fixed_price_radius}Km, preço fixo de {currency(aircraft.fixed_price_aeromedical)}. Acima de 900Km {currency(aircraft.price_per_km_aeromedical)} por Km.</p>
                                )
                            ) : (
                                <p><strong>Preço (passageiros): </strong>Até {aircraft.fixed_price_radius}Km, preço fixo de {currency(aircraft.fixed_price_passengers)}. Acima de 900Km {currency(Number(aircraft.price_per_km_passengers))} por Km.</p>
                            )}
                        </div>
                    </FlexVerticalSpaceBetween>
                </div>
            </FlexContent>
        </div>
    );
}

export default function AircraftSegmentSelect({
    defaultValues,
    onChange,
    serverDatetime,
    operates_aeromedical_transport,
    submitted=false,
}) {
    const [initWithValues, setInitWithValues] = useState(!!defaultValues);
    const [inputs, setInputs] = useState(defaultValues ? defaultValues : {
        aircraft: '',
        aerodrome: '',
        aircraft_at_origin: false,
    });

    function handleChange(e) {
        const {name, value} = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    useEffect(() => {
        onChange(inputs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        inputs.aircraft,
        inputs.aerodrome,
        inputs.aircraft_at_origin,
    ]);

    // Se o tipo de transporte é alterado
    useEffect(() => {
        if(!initWithValues) {
            handleChange({
                target: {
                    name: 'aircraft',
                    value: '',
                },
            });
        }

        setInitWithValues(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [operates_aeromedical_transport]);

    return(
        <div className="aircraft-segment-select">
            <h3>Aeronave</h3>
            <Row className="center-padding">
                <Col sm="12">
                    <label>Selecione a aeronave*</label>
                    <Autocompletar
                        params={{
                            operates_aeromedical_transport,
                        }}
                        inputText={inputs.aircraft?.full_name}
                        fieldName="full_name"
                        name="aircraft"
                        renderOption={(op) => (<div>{op.full_name}</div>)} 
                        endpoint="/aircrafts/autocomplete"
                        placeholder="Selecione uma aeronave"
                        onOptionSelected={handleChange}
                        Icon={AirplanemodeActiveIcon}
                        error={submitted && !inputs.aircraft}
                    />
                </Col>
                {inputs.aircraft && (
                    <Col sm="12">
                        <RenderAircraft serverDatetime={serverDatetime} aircraft={inputs.aircraft} operates_aeromedical_transport={operates_aeromedical_transport} />
                    </Col>
                )}
            </Row>
        </div>
    );
}