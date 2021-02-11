import React, { useState, Fragment, useEffect } from "react";
import { Select, MenuItem, Radio, Switch } from "@material-ui/core";
import { Row, Col } from "react-bootstrap";
import LatLon from "geodesy/latlon-spherical";
import { Input, Divider, Autocomplete, Leg, PageTitle, Aircraft, Extra, Alert, Loader, InputAdorment } from "../../components";
import { event, priceToFloat, currency, formatCurrency, MinutesToHoursNotation, getCurrentDate, getExpirationDateOfProposal } from "../../utils";
import { QuotePrice, GetKmPrice, GetFlightTime } from "../../calc";
import serverless from "../../serverless";
import api from "../../api";
import AdjustIcon from '@material-ui/icons/Adjust';
import LocationCityIcon from '@material-ui/icons/LocationCity';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import {WrapperContent} from '../../core/design';
import {capitalize} from '../../utils';

import './styles.css';

export default function Home(props) {
    const { history, location } = props;

    // STATES
    const[inputs, setInputs] = useState({ 
        name: "", 
        type_of_transport: "passengers", 
        tripmode: "oneway",
        aircraft: null,
        aircraft_base: null, // aerodrome
        price_per_km: "",
        price: "",
        images: []
    });
    const { 
        name, 
        type_of_transport, 
        tripmode,
        aircraft,
        aircraft_base,
        images
    } = inputs;
    function handleChange(e) {
        const { value, name } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }
    const[origin, setOrigin] = useState({ 
        city: null, 
        aerodrome: null, 
        cmd_city: "", 
        params: { city: "", uf: "" } 
    });
    const[destination, setDestination] = useState({ 
        city: null, 
        aerodrome: null, 
        cmd_city: "", 
        params: { city: "", uf: "" } 
    });
    const[code, setCode] = useState("");
    function handleOrigin(e) {
        const { value, name } = e.target;
        setOrigin(origin => ({ ...origin, [name]: value }));
    }
    function handleDestination(e) {
        const { value, name } = e.target;
        setDestination(destination => ({ ...destination, [name]: value }));
    }

    const[calculed, setCalculed] = useState({ 
        transfer_distance: 0, 
        trip_distance: 0, 
        return_distance: 0, 
        flight_time: "", 
        price_per_km: "",
        price: "",
        clsPriceAerodromes: 0
    });
    const { transfer_distance, trip_distance, return_distance, clsPriceAerodromes, flight_time } = calculed;
    function handleCalculed(e) {
        const { name, value } = e.target;
        setCalculed(calculed => ({ ...calculed, [name]: value }));
    }

    const[checked, setChecked] = useState({ 
        same_origin: false, 
        per_km: false,
        ambulance_at_origin: false,
        ambulance_at_destination: false,
        extra_info: false,
    });
    function handleChecked(e) {
        setChecked(inputs => ({ ...inputs, [e.target.name]: e.target.checked }));
    }

    const[composed, setComposed] = useState({ legs:[], airport_classes: [], extra_infos: [] });
    const {legs, airport_classes, extra_infos} = composed;
    function handleComposed(e) {
        const { name, value } = e.target;
        setComposed(composed => ({ ...composed, [name]: value }));
    }

    // Alert
    const[open, setOpen] = useState(false);
    // Gerar PDF
    const[loading, setLoading] = useState(false);
    const[error, setError] = useState(false);

    // CONSTANTS
    const isAeromedical = type_of_transport === "aeromedical";
    const isRoundTrip = tripmode === "roundtrip";
    const generateBudget = calculed.trip_distance && calculed.price && inputs.name && inputs.price;

    // AUTO PREENCHER (EDIT)
    useEffect(() => {
        const { state } = location;
        if(state) {
            const { client_name } = state;
            handleChange(event("name", client_name));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // FUNCTIONS
    const getTotalKm = () => {
        let km = 0;
        if(isRoundTrip && !checked.same_origin) {
            km = transfer_distance+(2*trip_distance)+return_distance;
        } else {
            km = transfer_distance+trip_distance+return_distance;
        }

        return km.toFixed(2);
    };

    const handlePrice = (e) => {
        const value = formatCurrency(e.target.value);
        value==='0,0' ? e.target.value = "" : e.target.value = value;
        handleChange(e);
        return priceToFloat(value);
    };

    const handleKmPrice = (e) => { handlePrice(e) };

    const handleFinalPrice = (e) => {
        const value = handlePrice(e);
        const distances = {
            transferDistance: transfer_distance,
            tripDistance: trip_distance,
            returnDistance: return_distance
        };
        setKmPrice(clsPriceAerodromes, value, distances);
    };
    
    const setKmPrice = (clsPriceAerodromes, price, distances) => {
        const kmPrice = GetKmPrice(clsPriceAerodromes, aircraft, distances, price, isRoundTrip);
        handleCalculed(event("price_per_km", kmPrice));
    };

    const handleOriginAerodrome = (op) => {
        const { city } = op;
        handleOrigin(event("aerodrome", op));
        handleOrigin(event("city", city));
        handleOrigin(event("cmd_city", `${city.name} • ${city.uf}`));
    };

    const handleOriginCity = (op) => {
        const arr = op.name.split(" • ");
        handleOrigin(event("city", { name: arr[0], uf: arr[1] }));
        handleOrigin(event("aerodrome", null));
        handleOrigin(event("params", { city: arr[0], uf: arr[1] }));
    };

    const handleDestinationAerodrome = (op) => {
        const { city } = op;
        handleDestination(event("aerodrome", op));
        handleDestination(event("city", city));
        handleDestination(event("cmd_city", `${city.name} • ${city.uf}`));
    };

    const handleDestinationCity = (op) => {
        const arr = op.name.split(" • ");
        handleDestination(event("city", { name: arr[0], uf: arr[1] }));
        handleDestination(event("aerodrome", null));
        handleDestination(event("params", { city: arr[0], uf: arr[1] }));
    };

    const handleExtraInfos = (options) => {
        if(!!options) {
            handleComposed(event("extra_infos", options));
        }
    };

    function handleTypeOfTransport(e){
        handleChange(e);
        // Limpar dados de aeronave
        handleChange(event("aircraft", null));
        // Limpar dados do preço calculado
        handleCalculed(event("price", ""));
    };

    function handleSubmit(e) {
        e.preventDefault();

        // VERIFICATIONS
        let images=[];
        if(inputs.type_of_transport==="passengers") {
            images = aircraft.aircraftImages.filter(el => el.type==="passenger" && el.doc);
        } else if(inputs.type_of_transport==="aeromedical") {
            images = aircraft.aircraftImages.filter(el => el.type==="aeromedical" && el.doc);
        }
        handleChange(event("images", images));

        // imagens da aeronave
        if(images.length < 3) {
            alert("A aeronave selecionada não possui imagens suficientes para gerar o documento. Por favor, selecione outra aeronave.");
            return;
        }

        // informações extras
        if(checked.extra_info && !(extra_infos.length > 0)) {
            alert("A opção de adicionar informações extras foi marcada, porém nenhuma foi fornecida ou selecionada!");
            return;
        }

        // Abre alert para confirmar geração do documento
        handleOpenAlert();
    }

    const handleOpenAlert = () => { setOpen(true) };
    const handleCloseAlert = () => { setOpen(false) };

    async function getNextCode() {
        const response = await api.get("/quotations/nextcode");
        return response.data;
    }

    useEffect(() => {
        async function getCode() {
            try {
                const code = await getNextCode();
                setCode(code);
            } catch (error) {
                alert("Ocorreu um erro. Verifique sua conexão!");
                window.location.reload();
            }
        }

        getCode();
    }, []);

    async function generatePDF() {
        handleCloseAlert();
        setLoading(true);
        setError(false);

        // Formatar dados
        const formattedFlightTime = MinutesToHoursNotation(calculed.flight_time);
        const flight_time = formattedFlightTime.includes("0h ") ? formattedFlightTime.split("0h ")[1] : formattedFlightTime;

        let data = {
            code,
            type_of_transport,
            origin: {
                uf: origin.city.uf,
                city: origin.city.name,
                aerodrome: origin.aerodrome,
            },
            destination: {
                uf: destination.city.uf,
                city: destination.city.name,
                aerodrome: destination.aerodrome,
            },
            current_date: getCurrentDate(),
            expiration_date: getExpirationDateOfProposal(7),
            client_name: capitalize(name, true),
            is_roundtrip: isRoundTrip,
            calculed: {
                distance: calculed.trip_distance,
                price: currency(calculed.price),
                flight_time,
            },
            aircraft,
            images,
            price: inputs.price
        };

        // Inforções extras
        data.with_extra_info = checked.extra_info;
        if(checked.extra_info) {
            if(extra_infos.length > 0) {
                data.extra_infos = extra_infos;
            }
        }

        // Se for aeromédico
        if(isAeromedical) {
            data.ambulance_at_origin = checked.ambulance_at_origin;
            data.ambulance_at_destination = checked.ambulance_at_destination;
            data.with_ambulance = checked.ambulance_at_origin || checked.ambulance_at_destination;
        }

        // Submit data
        try {
            const response = await serverless.post("/dev/pdf", data);
            const { name, url } = response.data;
            const nextParams = {
                filename: name,
                pdf_url: url,
                code,
                client_name: data.client_name,
                type_of_transport: data.type_of_transport,
                current_date: data.current_date,
                price: priceToFloat(data.price),
                aircraft_id: aircraft.id,
                origin_aerodrome_id: origin.aerodrome.id,
                destination_aerodrome_id: destination.aerodrome.id,
            };

            history.push("/generated", nextParams);
        } catch (error) {
            setError(true);
            setLoading(false);
        }
    }

    // MONITORED EVENTS
    /**
     * 1. Extra info
     * 2. Calc distance
     * 3. Calc price & flight time
     */
    /*1*/useEffect(() => {
        handleComposed(event("extra_infos", []));
    }, [checked.extra_info]);

    /*2*/useEffect(() => {
        /**
         * Obs.: Usar essa função quando os objetos forem definidos
         * 
         * Possibilities
         * 
         * 1. Oneway (Aeronave na origem) (sameOrigin && !isRoundTrip)
         * Origin Aerodrome => Destination Aerodrome (Ida)
         * Destination Aerodrome => Origin Aerodrome (Translado de Volta)
         * 
         * 2. Oneway (Aeronave não está na origem) (!sameOrigin && !isRoundTrip)
         * Aircraft Base => Origin Aerodrome (Translado de Ida)
         * Origin Aerodrome => Destination Aerodrome (Ida)
         * Destination Aerodrome => Aircraft Base (Translado de Volta)
         * 
         * 3. Roundtrip (Aeronave na origem) (sameOrigin && isRoundTrip)
         * Origin Aerodrome => Destination Aerodrome (Ida)
         * Destination Aerodrome => Origin Aerodrome (Volta)
         * 
         * 4. Roundtrip (Aeronave não está na origem) (!sameOrigin && isRoundTrip)
         * Aircraft Base => Origin Aerodrome (Translado de Ida)
         * Origin Aerodrome => Destination Aerodrome (Ida)
         * Destination Aerodrome => Origin Aerodrome (Volta)
         * Origin Aerodrome => Aircraft Base (Translado de Volta)
         */
        function calcDistance(origin_aerodrome, destination_aerodrome, aircraft_base, sameOrigin=false, isRoundTrip=false) {
            let tripDistance = 0; // Trecho principal
            let transferDistance = 0; // Translado de Origem
            let returnDistance = 0; // Translado de Destino
            let legs = []; // Array com as pernas do voo
            let airport_classes = []; // Array com as classes dos aeroportos

            const pOrigin = new LatLon(origin_aerodrome.latitude, origin_aerodrome.longitude);
            const pDestination = new LatLon(destination_aerodrome.latitude, destination_aerodrome.longitude);

            tripDistance = parseFloat(pOrigin.distanceTo(pDestination).toPrecision(4))/1000;
            // Colocar perna principal
            legs.push({
                id: 2,
                type: "Ida",
                airport_origin: origin_aerodrome.name,
                airport_destination: destination_aerodrome.name,
                km: tripDistance.toFixed(2)
            });
            airport_classes.push(origin_aerodrome.airport_class);
            airport_classes.push(destination_aerodrome.airport_class);

            if(isRoundTrip && !sameOrigin) {
                legs.push({
                    id: 3,
                    type: "Volta",
                    airport_origin: destination_aerodrome.name,
                    airport_destination: origin_aerodrome.name,
                    km: tripDistance.toFixed(2)
                });
            }
            
            if(!sameOrigin) {
                const pBase = new LatLon(aircraft_base.latitude, aircraft_base.longitude);
                transferDistance = parseFloat(pBase.distanceTo(pOrigin).toPrecision(4))/1000;
                // Colocar perna do translado de origem
                legs.push({
                    id: 1,
                    type: "Translado de Ida",
                    airport_origin: aircraft_base.name,
                    airport_destination: origin_aerodrome.name,
                    km: transferDistance.toFixed(2)
                });
                airport_classes.push(aircraft_base.airport_class);

                if(isRoundTrip) { // Se for ida e volta, o translado de destino será "Aeródromo de Origem ==> Aeródromo Base da Aeronave"
                    returnDistance = parseFloat(pOrigin.distanceTo(pBase).toPrecision(4))/1000;
                } else {
                    returnDistance = parseFloat(pDestination.distanceTo(pBase).toPrecision(4))/1000;
                }

                const airport = isRoundTrip ? origin_aerodrome : destination_aerodrome;
                legs.push({
                    id: 4,
                    type: "Translado de Volta",
                    airport_origin: airport.name,
                    airport_destination: aircraft_base.name,
                    km: return_distance.toFixed(2)
                });

            } else {
                returnDistance = parseFloat(pDestination.distanceTo(pOrigin).toPrecision(4))/1000;
                
                const type = isRoundTrip ? "Volta" : "Translado de Volta";
                legs.push({
                    id: 3,
                    type,
                    airport_origin: destination_aerodrome.name,
                    airport_destination: origin_aerodrome.name,
                    km: returnDistance.toFixed(2)
                });
            }

            return({
                tripDistance,
                transferDistance,
                returnDistance,
                legs,
                airport_classes
            });
        }

        const calculateDistance = !!origin.aerodrome && !!destination.aerodrome && (checked.same_origin ? true : !!aircraft_base);
        if(calculateDistance) {
            const { transferDistance, tripDistance, returnDistance, legs, airport_classes } = calcDistance(
                origin.aerodrome, 
                destination.aerodrome, 
                aircraft_base, 
                checked.same_origin, 
                isRoundTrip
            );

            const arr = [
                {
                    name: "transfer_distance",
                    value: transferDistance
                },
                {
                    name: "trip_distance",
                    value: tripDistance
                },
                {
                    name: "return_distance",
                    value: returnDistance
                }
            ];

            arr.forEach(el => handleCalculed(event(el.name, el.value)));
            handleComposed(event("airport_classes", airport_classes));
            handleComposed(event("legs", legs));
        }

    }, [
        aircraft_base, 
        origin.aerodrome, 
        destination.aerodrome, 
        checked.same_origin, 
        isRoundTrip, 
        return_distance,
    ]);

    /*3*/useEffect(() => {
        const calculatePrice = !!origin.aerodrome && !!destination.aerodrome && aircraft && (checked.same_origin ? true : !!aircraft_base) && (checked.per_km ? !!inputs.price_per_km : true);
        
        // Calc Price
        function calcPrice(distances={
            transferDistance: 0,
            tripDistance: 0,
            returnDistance: 0
        }, airport_classes=[], isAeromedical=false, isRoundTrip=false, aircraft={}, perKm=false) {
            const customPrice = perKm ? priceToFloat(inputs.price_per_km) : 0.0;
            return QuotePrice(distances, airport_classes, aircraft, isAeromedical, isRoundTrip, !perKm, customPrice);
        }

        if(calculatePrice) {
            // Calc Flight Time
            const flightTime = GetFlightTime(trip_distance, aircraft.maximum_speed);
            handleCalculed(event("flight_time", flightTime));

            const distances = {
                transferDistance: transfer_distance,
                tripDistance: trip_distance,
                returnDistance: return_distance
            };
            const {price, clsPriceAerodromes} = calcPrice(distances, airport_classes, isAeromedical, isRoundTrip, aircraft, checked.per_km);
            const arr = [
                {
                    name: "price",
                    value: price
                },
                {
                    name: "clsPriceAerodromes",
                    value: clsPriceAerodromes
                }
            ];
            
            arr.forEach(el => handleCalculed(event(el.name, el.value)));
        }
    }, [
        aircraft_base, 
        origin.aerodrome, 
        destination.aerodrome, 
        inputs.price_per_km, 
        checked.per_km, 
        checked.same_origin,
        aircraft,
        airport_classes,
        isAeromedical,
        isRoundTrip,
        return_distance,
        transfer_distance,
        trip_distance,
    ]);

    return(
        <WrapperContent style={{padding: 0}} className="wrapper-home" color="#f2f2f2">
            <Alert 
                open={open} 
                title="Finalizar e gerar orçamento?" 
                message="Esta ação irá gerar o PDF e finalizar o processo!"
                onConfirm={generatePDF}
                onCancel={handleCloseAlert}
            />
            {loading && <Loader title="Gerando PDF" />}
            <section id="home" className="home">
                <div style={{padding: '1rem 1rem 0rem 1rem'}}>
                    <PageTitle title="Documento de Cotação" subtitle="Gerar documento" />
                </div>
                <form id="quotation-form" onSubmit={handleSubmit}>
                    <Row className="center-padding">
                        <Col  sm="8">
                            <Input 
                                id="name"
                                type="text" 
                                value={name} 
                                name="name"
                                placeholder="Nome do cliente"
                                onChange={handleChange} 
                            />
                        </Col>
                        <Col sm="4">
                            <Select 
                                id="type_of_transport" 
                                name="type_of_transport" 
                                className="select" 
                                displayEmpty={true} 
                                value={type_of_transport}
                                disableUnderline={true}
                                onChange={handleTypeOfTransport}
                            >
                                <MenuItem value="">
                                    <em>Selecione o tipo de transporte...</em>
                                </MenuItem>
                                <MenuItem value={"passengers"}>Passageiros</MenuItem>
                                <MenuItem value={"aeromedical"}>Aeromédico</MenuItem>
                            </Select>
                        </Col>
                    </Row>
                    
                    {/*Stretch Component (START)*/}
                    <h3>Informações do Trecho</h3>
                    <div className="tripmode">
                        <div className="radio-input">
                            <Radio 
                                id="oneway"
                                name="tripmode"
                                className="radio" 
                                checked={tripmode==="oneway"}
                                onChange={handleChange}
                                value="oneway"
                                inputProps={{ "aria-label": "ONEWAY" }}
                            />
                            <span>Somente Ida</span>
                        </div>
                        <div className="radio-input">
                            <Radio 
                                id="roundtrip"
                                name="tripmode"
                                className="radio" 
                                checked={tripmode==="roundtrip"}
                                onChange={handleChange}
                                value="roundtrip"
                                inputProps={{ "aria-label": "ROUNDTRIP" }}
                            />
                            <span>Ida e Volta</span>
                        </div>
                    </div>
                    <div className="stretch">
                        <p className="title">Origem</p>
                        <Row className="center-padding">
                            <Col sm="4">
                                <Autocomplete 
                                    id="origin-city"
                                    url="/autocomplete"
                                    filter="city"
                                    resource="city"
                                    inputValue={origin.cmd_city}
                                    placeholder="Cidade de Origem"
                                    handleOptionSelected={handleOriginCity}
                                    icon={<LocationCityIcon className="icon" />} 
                                />
                            </Col>
                            <Col sm="8">
                                <Autocomplete 
                                    id="origin-aerodrome"
                                    url="/autocomplete"
                                    filter="aerodrome" 
                                    resource="aerodrome"
                                    params={origin.params}
                                    placeholder="Aeródromo de Origem"
                                    handleOptionSelected={handleOriginAerodrome}
                                    icon={<AdjustIcon className="icon" />} 
                                />
                            </Col>
                        </Row>

                        <p className="title">Destino</p>
                        <Row className="center-padding">
                            <Col sm="4">
                                <Autocomplete 
                                    id="destination-city"
                                    url="/autocomplete"
                                    filter="city" 
                                    resource="city"
                                    inputValue={destination.cmd_city}
                                    placeholder="Cidade de Destino"
                                    handleOptionSelected={handleDestinationCity}
                                    icon={<LocationCityIcon className="icon" />} 
                                />
                            </Col>
                            <Col sm="8">
                                <Autocomplete 
                                    id="destination-aerodrome"
                                    url="/autocomplete"
                                    filter="aerodrome" 
                                    resource="aerodrome"
                                    params={destination.params}
                                    placeholder="Aeródromo de Destino"
                                    handleOptionSelected={handleDestinationAerodrome}
                                    icon={<LocationOnIcon className="icon" />} 
                                />
                            </Col>
                        </Row>
                    </div>
                    {/*Stretch Component (END)*/}

                    <p className="kmTotal"><strong>Km total: </strong>{formatCurrency(getTotalKm())} Km</p>
                    <div className="legs">
                        <Row className="center-padding">
                            {legs.sort((a, b) => a.id - b.id).map(leg => (
                                <Col key={leg.id} sm={legs.length === 4 ? "3" : "4"}>
                                    <Leg 
                                        style={leg.type === "Ida" || leg.type === "Volta" ? styles.empty : styles.opacityLeg}
                                        type={leg.type}
                                        airport_origin={leg.airport_origin} 
                                        airport_destination={leg.airport_destination} 
                                        km={leg.km} 
                                    />
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {type_of_transport === "aeromedical" && (
                        <Fragment>
                            <Divider />
                            <h3>Informações do Aeromédico</h3>
                            <div className="aeromedical">
                                <div className="checked">
                                    <span>Ambulância na Origem? <strong>{checked.ambulance_at_origin ? "SIM" : "NÃO"}</strong></span>
                                    <Switch
                                        name="ambulance_at_origin"
                                        checked={checked.ambulance_at_origin}
                                        onChange={handleChecked}
                                        color="secondary"
                                    />
                                </div>
                                <div className="checked">
                                    <span>Ambulância no Destino? <strong>{checked.ambulance_at_destination ? "SIM" : "NÃO"}</strong></span>
                                    <Switch
                                        name="ambulance_at_destination"
                                        checked={checked.ambulance_at_destination}
                                        onChange={handleChecked}
                                        color="secondary"
                                    />
                                </div>
                            </div>
                            <Divider />
                        </Fragment>
                    )}

                    {/*Aircraft Component (START)*/}
                    <h3>Informações do Aeronave</h3>
                    <div className="aircraft">
                        <div className="checked">
                            <span>A aeronave está na origem? <strong>{checked.same_origin ? "SIM" : "NÃO"}</strong></span>
                            <Switch
                                name="same_origin"
                                checked={checked.same_origin}
                                onChange={handleChecked}
                                color="primary"
                            />
                        </div>
                        <Row className="center-padding">
                            <Col sm={checked.same_origin ? "12" : "6"}>
                                <Autocomplete 
                                    id="aircraft"
                                    url="/aircrafts/autocomplete"
                                    filter="name"
                                    resource="aircraft" 
                                    params={{ transport: type_of_transport }}
                                    placeholder="Selecione uma aeronave..."
                                    handleOptionSelected={(op) => { handleChange(event("aircraft", op)) }}
                                    icon={<AirplanemodeActiveIcon className="icon" />} 
                                />
                            </Col>
                            {!checked.same_origin && (
                                <Col sm="6">
                                    <Autocomplete 
                                        id="aircraft_base"
                                        url="/autocomplete"
                                        filter="aerodrome" 
                                        placeholder="Onde a aeronave está?"
                                        handleOptionSelected={(op) => { handleChange(event("aircraft_base", op)) }}
                                        icon={<LocationSearchingIcon className="icon" />} 
                                    />
                                </Col>
                            )}
                        </Row>
                        <Row className="center-padding">
                            <Col sm="6">
                                {aircraft && <Aircraft aircraft={aircraft} flight_time={flight_time} />}
                            </Col>
                        </Row>
                    </div>
                    {/*Aircraft Component (END)*/}

                    <div className="extra-info">
                        <div className="checked">
                            <span>Adicionar informações extras? <strong>{checked.extra_info ? "SIM" : "NÃO"}</strong></span>
                            <Switch
                                name="extra_info"
                                checked={checked.extra_info}
                                onChange={handleChecked}
                                color="primary"
                            />
                        </div>
                        {checked.extra_info && (
                            <Fragment>
                                <h3>Informações Extras</h3>
                                <Extra getSelectedOptions={handleExtraInfos} />
                            </Fragment>
                        )}
                    </div>

                    <Divider />
                    <div className="price">
                        <div className="checked">
                            <span>Fornecer preço por Km? <strong>{checked.per_km ? "SIM" : "NÃO"}</strong></span>
                            <Switch
                                name="per_km"
                                checked={checked.per_km}
                                onChange={handleChecked}
                                color="primary"
                            />
                        </div>
                        <Row className="center-padding">
                            {checked.per_km && (
                                <Col sm="6">
                                    <p className="custom-km-price"><strong>Fornecer preço do Km</strong></p>
                                    <InputAdorment
                                        id="price_per_km"
                                        name="price_per_km"
                                        type="text"
                                        adorment={<p>R$</p>}
                                        value={inputs.price_per_km}
                                        onChange={handleKmPrice}
                                        placeholder="Informe o preço do Km"
                                    />
                                </Col>
                            )}
                            <Col sm={!checked.per_km ? "12" : "6"}>
                                <p className="estimated-price"><strong>Preço Estimado: </strong>{calculed.price ? currency(calculed.price) : "0,00"}</p>
                                {calculed.price && (
                                    <Fragment>
                                        <InputAdorment 
                                            id="price"
                                            name="price"
                                            type="text"
                                            adorment={<p>R$</p>}
                                            value={inputs.price}
                                            onChange={handleFinalPrice}
                                            placeholder="Preço final"
                                        />
                                        <p className="kmPrice"><strong>Preço do Km (com base no preço final): </strong>R$ {formatCurrency(calculed.price_per_km)}</p>
                                    </Fragment>
                                )}
                            </Col>
                        </Row>
                        
                    </div>

                    <button 
                        style={!generateBudget ? styles.disabledBtn : styles.empty}
                        disabled={!generateBudget} 
                        className="submitBtn"
                        type="submit"
                    >
                        <span>Gerar Orçamento</span>
                    </button>
                    {error && <p className="error">Ocorreu um erro ao gerar o PDF. Por favor, tente novamente!</p>}

                </form>
            </section>
        </WrapperContent>
    )
}

const styles = {
    empty: {},
    opacityLeg: {
        backgroundColor: '#fdfdfd',
        opacity: .7
    },
    disabledBtn: {
        backgroundColor: '#d9d9d9',
        color: '#ffffff'
    }
};