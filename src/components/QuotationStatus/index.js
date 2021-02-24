import React, {useState, useEffect} from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FullScreenDialog from '../FullScreenDialog';
import { EnumInternalQuotationStatus, EnumDatetimeFormatTypes } from '../../global';
//import Alert from '@material-ui/lab/Alert';
import Alert from '../Alert';
import { Row, Col } from 'react-bootstrap';
import DateTimerPicker from '../DateTimerPicker';
import { FlexSpaceBetween } from '../../core/design';
import Button from '@material-ui/core/Button';
import { getDatetime } from '../../utils';
import { useFeedback } from '../../core/feedback/feedback.context';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Input from '../Input';
import TextArea from '../TextArea';
import api from '../../api';

import './styles.css';

function FlightSegmentDatetime({
    className, 
    flightSegment, 
    onCompleted, 
    departureMinDate, 
    disabled=false}) {

    const [inputs, setInputs] = useState({
        departure_datetime: '',
        arrival_datetime: '',
    });

    const {departure_datetime, arrival_datetime} = inputs;

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    useEffect(() => {
        if(departure_datetime && arrival_datetime) {
            onCompleted({
                id: flightSegment.id,
                completed: true,
                number: flightSegment.stretch_number,
                departure_datetime: inputs.departure_datetime,
                arrival_datetime: inputs.arrival_datetime,
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        departure_datetime,
        arrival_datetime,
    ]);

    return(
        <div className={`segment ${className}`}>
            <FlexSpaceBetween className="header">
                <p className="segment-number">Trecho {flightSegment.stretch_number}</p>
                <div className={`segment-type segment-type-${flightSegment.type}`}>
                    <p>{flightSegment.type === 'trip' ? 'Viagem' : 'Translado'}</p>
                </div>
            </FlexSpaceBetween>
            <p className="segment-origin">De {flightSegment.origin_aerodrome.full_name} ({flightSegment.origin_aerodrome.city.full_name})</p>
            <p className="segment-destination">Para {flightSegment.destination_aerodrome.full_name} ({flightSegment.destination_aerodrome.city.full_name})</p>
            
            <Row className="row-form" style={{paddingRight: 10, paddingLeft: 10}}>
                <Col className="col-field" sm="6">
                    <label>Data de partida</label>
                    <DateTimerPicker 
                        name="departure_datetime"
                        value={inputs.departure_datetime}
                        onChange={handleChange}
                        maxDate={inputs.arrival_datetime}
                        minDate={departureMinDate}
                        disabled={disabled}
                    />
                </Col>
                <Col className="col-field" sm="6">
                    <label>Data de chegada</label>
                    <DateTimerPicker 
                        name="arrival_datetime"
                        value={inputs.arrival_datetime}
                        onChange={handleChange}
                        minDate={inputs.departure_datetime}
                        disabled={disabled}
                    />
                </Col>
            </Row>
        </div>
    );
}

export default function QuotationStatus({flight_id, internal_quotation_id, internal_quotation_name, current_status, onChange}) {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(current_status);
    const [processing, setProcessing] = useState(false);
    const feedback = useFeedback();
    const [open, setOpen] = useState({
        dialog: false,
        alert: false,
        form: false,
    });

    const [submitted, setSubmitted] = useState(false);
    const [inputs, setInputs] = useState({
        reason: '',
        reason_description: '',
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs(inputs => ({ ...inputs, [name]: value }));
    }

    // Guarda o status até a sua alteração
    const [newStatus, setNewStatus] = useState(current_status);

    function handleOpen(name) {
        setOpen(inputs => ({ ...inputs, [name]: true }));
    }

    function handleClose(name) {
        setOpen(inputs => ({ ...inputs, [name]: false }));
    }

    const [flightSegments, setFlightSegments] = useState([]);
    const [flightSegmentsDatetime, setFlightSegmentsDatetime] = useState([]);

    function handleChangeStatus(e) {
        const {value} = e.target;
        
        if(value === 'opened') {
            handleOpenQuotation(value);
        } else if(value === 'closed') {
            handleCloseQuotation(value);
        } else if(value === 'not_closed') {
            handleNotCloseQuotation(value);
        }
    }

    async function handleOpenQuotation(status) {
        try {
            await api.put(`/internal-quotations/${internal_quotation_id}/mark-as-opened`);
            feedback.open({
                severity: 'success',
                msg: 'Status atualizado com sucesso!',
            });
            
            setStatus(status);
        } catch (error) {
            console.error(error);
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro!',
            });
        }
    }

    async function handleCloseQuotation(status) {
        setNewStatus(status);
        // Verificar se os trechos estão todos com horários preenchidos
        const check_segment_dates = await checkSegmentDates(flight_id);
        if(!check_segment_dates) {
            handleOpen('dialog');
            getFlightSegments(flight_id);
        } else {
            handleMarkAsClosed(status);
        }
    }

    function handleNotCloseQuotation(status) {
        setNewStatus(status);
        handleOpen('form');
    }

    function handleCompletedSegmentDatetime(segment_datetime) {
        const index = flightSegmentsDatetime.findIndex(el => el.number === segment_datetime.number);
        let copy_arr = [...flightSegmentsDatetime];

        copy_arr[index] = segment_datetime;
        setFlightSegmentsDatetime(copy_arr);
    }

    // Funções auxiliares
    /**
     * Retorna true se os segmentos estão com as datas preenchidas
     * Retorna false caso contrário
     * @param {string} flight_id 
     */
    async function checkSegmentDates(flight_id) {
        setLoading(true);
        var check = true;

        try {
            const response = await api.get(`/flights/${flight_id}/check-segment-dates`);
            const {checked_status} = response.data;
            check = checked_status;
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }

        return check;
    }

    async function getFlightSegments(flight_id) {
        setLoading(true);
        try {
            const response = await api.get(`/flights/${flight_id}/flight-segments`);
            const flight_segments = response.data;
            setFlightSegments(flight_segments);
            setFlightSegmentsDatetime(flight_segments.map(flight_segment => ({
                id: flight_segment.id,
                completed: false,
                number: flight_segment.stretch_number,
                departure_datetime: flight_segment.departure_datetime,
                arrival_datetime: flight_segment.arrival_datetime,
            })));

            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        handleOpen('alert');
    }

    // Marca como fechada
    async function handleMarkAsClosed(status) {
        setProcessing(true);

        // Formatar as datas dos segmentos
        const flight_segments_datetime = flightSegmentsDatetime.map(segment_datetime => ({
            id: segment_datetime.id,
            values: {
                departure_datetime: getDatetime(segment_datetime.departure_datetime, EnumDatetimeFormatTypes.SQL),
                arrival_datetime: getDatetime(segment_datetime.arrival_datetime, EnumDatetimeFormatTypes.SQL),
            }
        }));

        try {
            await api.put(`/internal-quotations/${internal_quotation_id}/mark-as-closed`, {
                internal_quotation_status: {
                    status: newStatus,
                },
                flight_segments_datetime,
            }, {
                headers: {flight_id},
            });

            setStatus(status);
            handleClose('alert');
            handleClose('dialog');
            setProcessing(false);

            feedback.open({
                severity: 'success',
                msg: 'Status atualizado com sucesso!',
            });
        } catch (error) {
            console.error(error);
            setProcessing(false);
            feedback.open({
                severity: 'error',
                msg: 'Ocorreu um erro!',
            });
        }
    }

    // Marca como não fechada
    async function handleMarkAsNotClosed() {
        setSubmitted(true);

        if(inputs.reason) {
            const data = {
                status: newStatus,
                reason: inputs.reason.trim(),
                reason_description: inputs.reason_description.trim(),
            };

            try {
                await api.put(`/internal-quotations/${internal_quotation_id}/mark-as-notclosed`, data);
                
                handleClose('form');
                setProcessing(false);
                setStatus(newStatus);
                feedback.open({
                    severity: 'success',
                    msg: 'Status atualizado com sucesso!',
                });
            } catch (error) {
                console.error(error);
                feedback.open({
                    severity: 'error',
                    msg: 'Ocorreu um erro!',
                });
                setProcessing(false);
            }
        } 
    }

    return(
        <div className="internal_quotation_status">

            {/**Mark as not closed */}
            <Dialog className="not-closed-form" open={open.form} fullWidth onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Marcar como não fechada</DialogTitle>
                {processing ? <p>Alterando status da cotação</p> : (
                    <>
                    <DialogContent>
                        <label>Motivo</label>
                        <Input 
                            type="text" 
                            name="reason"
                            value={inputs.reason} 
                            onChange={handleChange}
                            error={submitted && !inputs.reason}
                            placeholder="Motivo" 
                        />

                        <label>Descrição</label>
                        <TextArea 
                            type="text" 
                            name="reason_description"
                            value={inputs.reason_description} 
                            onChange={handleChange} 
                            placeholder="Descrição do motivo" 
                        />
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={() => handleClose('form')} color="default">
                        Cancelar
                    </Button>
                    <Button variant="contained" onClick={handleMarkAsNotClosed} color="primary">
                        Alterar
                    </Button>
                    </DialogActions>
                    </>
                )}
            </Dialog>

            {/**Mark as closed */}
            <FullScreenDialog className="close-quotation-dialog" open={open.dialog} title={internal_quotation_name} handleClose={() => setOpen(false)}>
                <Alert 
                    open={open.alert} 
                    processing={processing}
                    title="Fechar cotação" 
                    message="As datas e horários estão corretos?" 
                    processingTitle="Alterando cotação"
                    processingMsg="Por favor, aguarde!"
                    onConfirm={() => handleMarkAsClosed(newStatus)}
                    onCancel={() => handleClose('alert')}
                />
                
                {loading ? <p>Carregando...</p> : (
                    <div className="close-quotation">
                        {/**<Alert severity="warning">Para marcar como fechada esta cotação, você primeiro precisa fornecer as datas de decolagem e pouso dos trechos.</Alert> */}

                        <div className="flight-segments">
                            <form id="form-segment-status" onSubmit={handleSubmit}>
                                {flightSegments.map((flight_segment, index) => {

                                    const today = new Date(); // Substituir pela data do servidor

                                    return(
                                        <FlightSegmentDatetime 
                                            key={index} 
                                            className={index === flightSegments.length-1 ? 'border-bottom' : ''}
                                            flightSegment={flight_segment}
                                            onCompleted={handleCompletedSegmentDatetime}
                                            disabled={index === 0 ? false : !flightSegmentsDatetime[index-1].completed}
                                            departureMinDate={index === 0 ? today : flightSegmentsDatetime[index-1].arrival_datetime} 
                                        />
                                    );
                                })}

                                <Button 
                                    type="submit" 
                                    className="submit-btn" 
                                    variant="contained" 
                                    color="primary" 
                                    disabled={!flightSegmentsDatetime[flightSegmentsDatetime.length-1]?.completed}
                                >
                                    Salvar e marcar como fechada
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
            </FullScreenDialog>
            <Select 
                id="status" 
                name="status" 
                displayEmpty
                className={`select-quotation-status select-${status}`}
                value={status}
                disableUnderline={true}
                onChange={handleChangeStatus}
            >
                <MenuItem disabled value="">
                    <em>Status da cotação...</em>
                </MenuItem>
                {EnumInternalQuotationStatus.map((internal_quotation_status, index) => <MenuItem className="quotation-status-menu-item" key={index} value={internal_quotation_status.key}>{internal_quotation_status.value}</MenuItem>)}
            </Select>
        </div>
    );
}