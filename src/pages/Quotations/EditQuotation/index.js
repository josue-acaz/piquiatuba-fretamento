import React, { useState, useEffect } from 'react';
import { useRouteMatch, useParams, useLocation } from 'react-router-dom';
import { WrapperContent } from '../../../core/design';
import { PageTitle, Extra, GoBack } from '../../../components';
import { useFeedback } from '../../../core/feedback/feedback.context';
import AircraftSegmentSelect from '../../../components/AircraftSegmentSelect';
import FlightSegment from '../../../components/FlightSegment';
import Button from '@material-ui/core/Button';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import ClientSegment from '../../../components/ClientSegment';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import Switch from '@material-ui/core/Switch';
import { useSelector } from 'react-redux';
import InputAdorment from '../../../components/InputAdorment';
import { Row, Col } from 'react-bootstrap';
import { FlexContent, FlexSpaceBetween } from '../../../core/design';
import { formatCurrency, priceToFloat, numberToReal, getDatetime } from '../../../utils';
import Alert from '../../../components/Alert';
import { EnumDatetimeFormatTypes } from '../../../global';
import api from '../../../api';

import './styles.css';

export default function Generate({history}) {
    const {internal_quotation_id} = useParams();
    const {state} = useLocation();
    const edit = internal_quotation_id !== '0';
    const [loading, setLoading] = useState(true);

    const authenticated = useSelector(state => state.authentication.user);
    const feedback = useFeedback();
    const {path} = useRouteMatch();
    const [submitted, setSubmitted] = useState(false);
    const [withExtraInfo, setWithExtraInfo] = useState(false);
    const [clientSegment, setClientSegment] = useState({
        client_name: '',
        type_of_transport: '',
        ambulance_at_origin: false,
        ambulance_at_destination: false,
    });
    const [aircraftSegment, setAircraftSegment] = useState({
        aircraft: '',
        aerodrome: '',
        aircraft_at_origin: false,
    });
    const [flightSegments, setFlightSegments] = useState([
        {
            number: 1,
            completed: false,
            inputs: {
                origin_city: '',
                origin_aerodrome: '',
                destination_city: '',
                destination_aerodrome: '',
                departure_datetime: '',
                arrival_datetime: '',
                type: '',
            },
            distance: 0,
            flight_time: 0,
        }
    ]);
    const [extraInfos, setExtraInfos] = useState([]);
    const [inputs, setInputs] = useState({
        final_price: '',
        provide_price: false,
        custom_price_per_km: '',
    });

    const [totalDistance, setTotalDistance] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [kmPrice, setKmPrice] = useState(0);

    const [processing, setProcessing] = useState(false);
    const [openAlert, setOpenAlert] = useState(false);

    // Mostrar uma cotação existente
    async function show(internal_quotation_id) {
        setLoading(true);
        try {
            const response = await api.get(`/internal-quotations/${internal_quotation_id}/show`);
            const internal_quotation = response.data;

            // Preencher formulário cliente
            Object.keys(internal_quotation).forEach(key => {
                const value = internal_quotation[key];

                if(key !== 'flight') { // Segmento cliente
                    setClientSegment(clientSegment => ({ 
                        ...clientSegment, 
                        [key]: value,
                    }));
                }
            });

            // Obter aeronave
            const {aircraft} = internal_quotation.flight.flight_segments[0];
            setAircraftSegment(aircraftSegment => ({ ...aircraftSegment, aircraft: aircraft }));

            // Segmentos do voo
            let arr_segments = [];
            const {flight_segments} = internal_quotation.flight;
            flight_segments.forEach(flight_segment => {
                const segment = {
                    number: flight_segment.stretch_number,
                    completed: true,
                    inputs: {
                        origin_city: flight_segment.origin_aerodrome.city,
                        origin_aerodrome: flight_segment.origin_aerodrome,
                        destination_city: flight_segment.destination_aerodrome.city,
                        destination_aerodrome: flight_segment.destination_aerodrome,
                        departure_datetime: new Date(flight_segment.departure_datetime),
                        arrival_datetime: new Date(flight_segment.arrival_datetime),
                        type: flight_segment.type,
                    },
                    distance: flight_segment.distance,
                    flight_time: flight_segment.flight_time,
                };

                arr_segments.push(segment);
            });

            setFlightSegments(arr_segments);

            // Voo
            const {flight} = internal_quotation;
            Object.keys(flight).forEach(key => {
                if(key !== 'flight_segments') {
                    let value = flight[key];

                    if(key === 'total_distance') {
                        setTotalDistance(value);
                        return;
                    }

                    if(key === 'calculated_price') {
                        setTotalPrice(value);
                        return;
                    }
                    
                    if(key === 'custom_price_per_km') {
                        if(value) {
                            value = Number(value).toFixed(2);
                            value = formatCurrency(value);
                            setInputs(inputs => ({ ...inputs, provide_price: true}));
                        }
                    }

                    if(key === 'final_price') {
                        value = Number(value).toFixed(2);
                        value = formatCurrency(value);
                    }

                    // Vai preencher os inputs 'final_price' e 'custom_price_per_km'
                    setInputs(inputs => ({ ...inputs, [key]: value }));
                }
            });

            // Mais informações, Extra Info
            const many_informations = internal_quotation.many_informations;
            if(many_informations) {
                let arr_extra_infos = [];

                many_informations.forEach((many_information, index) => {
                    arr_extra_infos.push({
                        id: index+1,
                        checked: true,
                        value: many_information,
                        editing: false
                    });
                });

                setExtraInfos(arr_extra_infos);
                setWithExtraInfo(true);
            }

            setLoading(false);
        } catch (error) {
            setLoading(false);   
        }
    }

    // Verificar se é uma nova cotação ou uma existente
    useEffect(() => {

        if(edit) {
            show(internal_quotation_id);
        } else {
            setLoading(false);
        }

    }, [edit, internal_quotation_id]);

    function handleChange(e) {
        let {name, value} = e.target;

        if(name === 'final_price' || 'custom_price_per_km') {
            value = formatCurrency(value);
            if(name === 'final_price') {
                calculateKmPrice(value);
            }
            if(name === 'custom_price_per_km') {
                calculatePriceUsiginCustomPricePerKm(value);
            }
        }

        if(name === 'provide_price') {
            if(!e.target.checked) {
                setInputs(inputs => ({ ...inputs, custom_price_per_km: '' }));
                recalculatePrice(); // Voltar ao cáculo normal, sem o preço por km personalizado
            }
        }

        setInputs(inputs => ({ ...inputs, [name]: name === 'provide_price' ? e.target.checked : value }));
    }

    function handleAddSegment() {
        const lastSegment = flightSegments[flightSegments.length-1];
        setFlightSegments(flightSegments => [...flightSegments, {
            number: lastSegment.number+1,
            completed: false,
            inputs: {
                origin_city: lastSegment.inputs.destination_city,
                origin_aerodrome: lastSegment.inputs.destination_aerodrome,
                destination_city: '',
                destination_aerodrome: '',
                departure_datetime: '',
                arrival_datetime: '',
                type: '',
            },
            distance: 0,
            flight_time: 0,
        }]);
    }

    async function calculatePrice({
        segments,
        total_distance,
        type_of_transport,
        price_per_km='',
        aircraft_id,
    }) {
        const response = await api.get('/flight-price', {
            headers: {aircraft_id},
            params: {
                segments,
                total_distance,
                type_of_transport,
                price_per_km,
            },
        });

        const price = Number(response.data);
        setTotalPrice(price);
    }

    function handleCompletedSegment(segment_number, data) {
        const flight_segments = flightSegments.map(flight_segment => {
            if(flight_segment.number === segment_number) {
                flight_segment.inputs = data.inputs;
                flight_segment.distance = data.distance;
                flight_segment.flight_time = data.flight_time;
                flight_segment.completed = true;
            }

            return flight_segment;
        });

        handleUpdateDistanceAndPrice(flight_segments);
        setFlightSegments(flight_segments);
    }

    function handleMissingInformation(segment_number) {
        setFlightSegments(flightSegments.map(flight_segment => {
            if(flight_segment.number === segment_number) {
                flight_segment.completed = false;
            }

            return flight_segment;
        }));

        setKmPrice(0);
        setTotalPrice(0);
        handleChange({target: {name: 'final_price', value: ''}});
    }

    function handleRemoveSegment(segment_number) {
        const flight_segments = flightSegments.filter(flight_segment => flight_segment.number !== segment_number);
        handleUpdateDistanceAndPrice(flight_segments);
        setFlightSegments(flight_segments);
    }

    function handleChangeClientSegment(inputs) {
        setClientSegment(inputs);
    }

    function handleChangeAircraftSegment(inputs) {
        setAircraftSegment(inputs);
    }

    function handleChangeExtraInfos(extra_infos) {
        setExtraInfos(extra_infos);
    }

    function handleUpdateDistanceAndPrice(flight_segments) {
        let total_distance = 0;
        const segments = flight_segments.map(segment => {
            total_distance += segment.distance;
            return ({
                distance: segment.distance,
                origin_aerodrome_class: segment.inputs.origin_aerodrome.category,
                destination_aerodrome_class: segment.inputs.destination_aerodrome.category,
            });
        });

        calculatePrice({
            segments,
            total_distance,
            aircraft_id: aircraftSegment.aircraft.id,
            type_of_transport: clientSegment.type_of_transport,
        });

        setTotalDistance(total_distance.toFixed(2));
    }

    async function getKmPrice({
        segments,
        total_price,
        total_distance,
        aircraft_id,
    }) {
        try {
            const response = await api.get('/km-price', {
                headers: {aircraft_id},
                params: {
                    segments,
                    total_price,
                    total_distance,
                },
            });

            const km_price = Number(response.data);
            setKmPrice(km_price);
        } catch (error) {
            console.error(error);
        }
    }

    async function recalculatePrice() {
        if(flightSegments.length > 0 && aircraftSegment.aircraft && clientSegment.type_of_transport) {
            const segments = flightSegments.map(segment => {
                return ({
                    distance: segment.distance,
                    origin_aerodrome_class: segment.inputs.origin_aerodrome.category,
                    destination_aerodrome_class: segment.inputs.destination_aerodrome.category,
                });
            });

            calculatePrice({
                segments,
                total_distance: totalDistance,
                aircraft_id: aircraftSegment.aircraft.id,
                type_of_transport: clientSegment.type_of_transport,
            });
        }
    }

    async function calculateKmPrice(final_price) {
        if(flightSegments.length > 0 && aircraftSegment.aircraft) {
            const segments = flightSegments.map(segment => {
                return ({
                    distance: segment.distance,
                    origin_aerodrome_class: segment.inputs.origin_aerodrome.category,
                    destination_aerodrome_class: segment.inputs.destination_aerodrome.category,
                });
            });

            getKmPrice({
                segments,
                total_distance: totalDistance,
                aircraft_id: aircraftSegment.aircraft.id,
                total_price: priceToFloat(final_price),
            });
        }
    }

    async function calculatePriceUsiginCustomPricePerKm(price_per_km) {
        if(flightSegments.length > 0 && aircraftSegment.aircraft && clientSegment.type_of_transport) {
            const segments = flightSegments.map(segment => {
                return ({
                    distance: segment.distance,
                    origin_aerodrome_class: segment.inputs.origin_aerodrome.category,
                    destination_aerodrome_class: segment.inputs.destination_aerodrome.category,
                });
            });

            calculatePrice({
                segments,
                total_distance: totalDistance,
                aircraft_id: aircraftSegment.aircraft.id,
                price_per_km: priceToFloat(price_per_km),
                type_of_transport: clientSegment.type_of_transport,
            });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);

        // Checar campos que podem faltar
        if(clientSegment.client_name && inputs.final_price) {
            setOpenAlert(true);
        } else {
            feedback.open({
                severity: 'error',
                msg: 'Preencha todos os campos.',
            });
        }
    }

    async function handleSave() {
        setProcessing(true);
        const {
            client_name, 
            type_of_transport, 
            ambulance_at_origin, 
            ambulance_at_destination
        } = clientSegment;
        
        const flight_segments = flightSegments.map(flight_segment => ({
            stretch_number: flight_segment.number,
            type: flight_segment.inputs.type,
            distance: flight_segment.distance,
            flight_time: flight_segment.flight_time,
            origin_aerodrome_id: flight_segment.inputs.origin_aerodrome.id,
            destination_aerodrome_id: flight_segment.inputs.destination_aerodrome.id,
            departure_datetime: flight_segment.inputs.departure_datetime ? getDatetime(flight_segment.inputs.departure_datetime, EnumDatetimeFormatTypes.SQL) : null,
            arrival_datetime: flight_segment.inputs.arrival_datetime ? getDatetime(flight_segment.inputs.arrival_datetime, EnumDatetimeFormatTypes.SQL) : null,
            aircraft_id: aircraftSegment.aircraft.id,
        }));

        const data = {
            internal_quotation: {
                client_name,
                type_of_transport
            },
            flight_segments,
            flight: {
                final_price: priceToFloat(inputs.final_price),
                total_distance: Number(totalDistance),
                calculated_price: totalPrice,
            },
        };

        // Se for transporte aeromédico, adicionar ambulâncias
        if(type_of_transport === 'aeromedical_with_uti' || type_of_transport === 'aeromedical_without_uti') {
            data.internal_quotation.ambulance_at_origin = ambulance_at_origin;
            data.internal_quotation.ambulance_at_destination = ambulance_at_destination;
        }

        // Se o preço por km for fornecido
        if(inputs.provide_price) {
            data.flight.custom_price_per_km = priceToFloat(inputs.custom_price_per_km);
        }

        // Se forem adicionadas informações extras
        if(extraInfos.length > 0) {
            data.internal_quotation.many_informations = extraInfos.map(extra_info => extra_info.value);
        }

        handleGenerate(authenticated.user.id, authenticated.user.admin.id, data);
    }

    async function handleGenerate(user_id, admin_id, data) {
        try {
            const response = edit ? 
            await api.put(`/internal-quotations/${internal_quotation_id}/update`, data) : 
            await api.post('/internal-quotations', data, {
                headers: {admin_id},
            });

            const internal_quotation = response.data;

            setOpenAlert(false);
            setProcessing(false);
            feedback.open({
                severity: 'success',
                msg: edit ? 'Cotação alterada com sucesso!' : 'Cotação gerada com sucesso!',
            });

            history.push(`/quotations/${internal_quotation.id}/export-pdf`);
        } catch (error) {
            setOpenAlert(false);
            setProcessing(false);
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro!',
            });
        }
    }

    return(
        <WrapperContent style={{backgroundColor: '#f2f2f2'}} className="generate-quotation">
            <Alert 
                open={openAlert} 
                title={edit ? 'Alterar cotação' : 'Gerar cotação'} 
                message={edit ? 'Atualizar os dados da cotação?' : 'Gerar cotação?'} 
                processing={processing}
                processingTitle="Salvando cotação..."
                processingMsg="Por favor, aguarde!"
                onConfirm={handleSave}
                onCancel={() => setOpenAlert(false)}
            />
            {loading ? <p>Carregando...</p> : (
                <section id="generate" className="generate">
                    <GoBack onClick={() => {
                        history.goBack();
                    }} />
                    <PageTitle 
                        title={edit ? `Cotação ${state?.internal_quotation_code}` : 'Nova cotação'} 
                        subtitle="Cotar preço e criar voo" 
                    />
                    <form id="form-quotation" onSubmit={handleSubmit}>
                        <ClientSegment 
                            submitted={submitted} 
                            defaultValues={clientSegment}
                            onChange={handleChangeClientSegment} 
                        />
                        <AircraftSegmentSelect 
                            defaultValues={aircraftSegment}
                            operates_aeromedical_transport={clientSegment.type_of_transport === 'aeromedical_with_uti' || clientSegment.type_of_transport === 'aeromedical_without_uti'} 
                            onChange={handleChangeAircraftSegment} 
                        />
                        {flightSegments.map(flight_segment => (
                            <FlightSegment 
                                key={flight_segment.number} 
                                type_of_transport={clientSegment.type_of_transport}
                                hide={flight_segment.completed && (flight_segment.number < flightSegments.length)}
                                segmentNumber={flight_segment.number} 
                                aircraft_id={aircraftSegment.aircraft.id}
                                onCompleted={handleCompletedSegment}
                                onMissing={handleMissingInformation}
                                onRemove={handleRemoveSegment}
                                segmentInputs={flight_segment.inputs}
                                enableRemove={((flight_segment.number === flightSegments.length) && flightSegments.length > 1)}
                                completed={(flight_segment.number < flightSegments.length) && flight_segment.completed}
                                submitted={submitted}
                                defaultValues={{
                                    distance: flight_segment.distance,
                                    flight_time: flight_segment.flight_time,
                                }}
                            />
                        ))}

                        <div className="add-stretch-container">
                            <Button disabled={!flightSegments[flightSegments.length-1].completed} variant="contained" color="primary" onClick={handleAddSegment}>
                                <AddOutlinedIcon className="icon" />
                            </Button>
                            <FlexContent className="with-extra-info">
                                <p>Adicionar informação extra?</p>
                                <Switch
                                    name="with-extra-info"
                                    className="switch-extra-info"
                                    onChange={(e) => {
                                        setWithExtraInfo(e.target.checked);
                                    }}
                                    checked={withExtraInfo}
                                />
                            </FlexContent>
                        </div>

                        {withExtraInfo && (
                            <div className="extra-informations">
                                <Extra defaultValues={extraInfos} getSelectedOptions={handleChangeExtraInfos} />
                            </div>
                        )}

                        <div className="view-quote-price">
                            <FlexSpaceBetween className="header">
                                <FlexContent className="title">
                                    <AttachMoneyIcon />
                                    <h3>Informações de preço</h3>
                                </FlexContent>
                                <div className="total_distance">
                                    <p>Km total: <strong>{formatCurrency(totalDistance)}Km</strong></p>
                                </div>
                            </FlexSpaceBetween>
                            <FlexContent>
                                <label>Fornecer preço por Km</label>
                                <Switch 
                                    name="provide_price"
                                    checked={inputs.provide_price} 
                                    onChange={handleChange} 
                                    color="primary"
                                />
                                <strong>{inputs.provide_price ? 'SIM' : 'NÃO'}</strong>
                            </FlexContent>
                            <FlexContent className="estimated">
                                <div className="estimated_price">Preço estimado ➟ <strong>{totalPrice > 0 ? numberToReal(totalPrice) : 'R$ 0,00'}</strong></div>
                                <div className="price_per_km">Preço do km (com base no preço final) ➟ <strong>{kmPrice > 0 ? numberToReal(kmPrice) : 'R$ 0,00'}</strong></div>
                            </FlexContent>
                            <Row className="center-padding">
                                {inputs.provide_price && (
                                    <Col sm="6">
                                        <label>Preço por Km</label>
                                        <InputAdorment 
                                            name="custom_price_per_km"
                                            value={inputs.custom_price_per_km} 
                                            onChange={handleChange}
                                            placeholder="Preço por km" 
                                            adormentPosition="start"
                                            adorment={<p>R$</p>}
                                            decoration="secondary"
                                        />
                                    </Col>
                                )}
                                <Col sm={inputs.provide_price ? '6' : '12'}>
                                    <label>Preço Final*</label>
                                    <InputAdorment 
                                        id="final_price"
                                        name="final_price"
                                        value={inputs.final_price} 
                                        onChange={handleChange}
                                        placeholder="Informe o preço final" 
                                        adormentPosition="start"
                                        adorment={<p>R$</p>}
                                        decoration="secondary"
                                        error={submitted && !inputs.final_price}
                                    />
                                </Col>
                            </Row>
                        </div>

                        <Button 
                            type="submit"
                            disabled={!flightSegments[flightSegments.length-1].completed || !inputs.final_price} 
                            variant="contained" 
                            color="primary"
                        >
                            {edit ? 'Alterar cotação' : 'Gerar Cotação'}
                        </Button>
                    </form>
                </section>
            )}
        </WrapperContent>
    );
}