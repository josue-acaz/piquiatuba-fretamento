/* eslint-disable react-hooks/exhaustive-deps */
import React, {useState, useEffect} from 'react';
import {addDays, subDays, isSameDay} from 'date-fns';
import PageTitle from '../../../components/PageTitle';
import {
    WrapperContent, 
    FlexSpaceBetween, 
    FlexContent,
} from '../../../core/design';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Processing from '../../../components/Processing';
import Skeleton from '@material-ui/lab/Skeleton';
import IconButton from '@material-ui/core/IconButton';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import AircraftSchedule from '../../../components/AircraftSchedule';
import Datepicker from '../../../components/Datepicker';
import sistemavoar from '../../../services/sistema-voar';
import styled from 'styled-components';
import {getDate} from '../../../utils';
import Transition from '../../../components/Transition';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import {EnumDatetimeFormatTypes} from '../../../global';

import './styles.css';

const hours_of_day = [
    '0h',
    '1h',
    '2h',
    '3h',
    '4h',
    '5h',
    '6h',
    '7h',
    '8h',
    '9h',
    '10h',
    '11h',
    '12h',
    '13h',
    '14h',
    '15h',
    '16h',
    '17h',
    '18h',
    '19h',
    '20h',
    '21h',
    '22h',
    '23h',
];

const num_of_hours = hours_of_day.length;
const total_minutes = num_of_hours * 60;

/**
 * 
 * @param {strig} readable_hour 
 */
function convertTimeToMinutes(readable_hour) {
    const [hour, minute] = readable_hour.split(':');
    const minutes = (Number(hour)*60) + Number(minute);
    return minutes;
}

/**
 * Verifica o último status do dia, no caso da posição final
 * @param {string} start_hour 
 * @param {string} end_hour 
 */
function getHourFromEndStatus(start_hour, end_hour) {
    const [start_hours, start_minutes] = start_hour.split(':');
    const [end_hours, end_minutes] = end_hour.split(':');

    const start_hours_number = Number(start_hours);
    const end_hours_number = Number(end_hours);

    // Colocar somente os minutos da hora de fim
    const end_minutes_number = Number(end_minutes);

    const time_difference = 1; // Compensar diferença de 1h quando vira de um dia para o outro
    let end_hour_time = start_hours_number+end_hours_number;
    end_hour_time += time_difference;

    if(end_hours_number < start_hours_number) {
        end_hour = `${end_hour_time}:${end_minutes_number}`;
    }

    return end_hour;
}

/**
 * 
 * @param {string} hour_left 00:00
 * @param {string} hour_right 00:00
 * Retorna em minutos a diferença entre duas horas
 */
function subHours(hour_left, hour_right) {
    const [left_hours, left_minutes] = hour_left.split(':');
    const [right_hours, right_minutes] = hour_right.split(':');

    // 08:30 left hour
    // 10:40 right hour
    const left_minutes_value = Number(left_minutes);
    const right_minutes_value = Number(right_minutes);

    const left_hours_value = Number(left_hours) + (left_minutes_value/60);
    const right_hours_value = Number(right_hours) + (right_minutes_value/60);

    const difference_hours = right_hours_value - left_hours_value;
    return difference_hours*60;
}

const TableLayout = styled.table`
    @media screen and (max-width: 800px) {
        width: ${props => props.widthSize}px;
    }
`;

const MonitoringCell = styled.td`
    height: ${props => props.height}px;
`;

const StatusCode = styled.div`
    width: 100%;
    height: ${props => props.fill ? '100%' : 'auto'};
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CollorFilling = styled.div`
    height: 100%;
    position: absolute;
    width: ${props => props.width}%;
    left: ${props => props.initAtPosition}%;
    z-index: 910;
`;

function CollorFillingComponent({index, day, notes, status, detailedView, hour_start, hour_end, data, prevProgrammings}) {
    const last_status = index === day-1;
    const start_position = convertTimeToMinutes(hour_start) / total_minutes;
    const end_position = convertTimeToMinutes(
        last_status ? getHourFromEndStatus(hour_start, hour_end) : hour_end
    ) / total_minutes;

    const init_at_position = start_position*100;
    const width = (end_position-start_position)*100;

    const [open, setOpen] = useState(false);

    function handleOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    return(
        <>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-labelledby="alert-event"
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle id="alert-event-title">{hour_start} às {hour_end} ({status})</DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">{notes}</DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleClose} color="primary">
                    OK
                </Button>
                </DialogActions>
            </Dialog>
            <CollorFilling onClick={handleOpen} className={`color-filling color-${status}`} width={width} initAtPosition={init_at_position}>
                <StatusCode fill={!detailedView}>{status}</StatusCode>
                {detailedView && (
                    <div className="period">
                        {status !== 'MNT' && (
                            <>
                                <p>De Teste 1</p>
                                <p>Para Teste 2</p>
                            </>
                        )}
                    </div>
                )}
            </CollorFilling>
            {prevProgrammings.map(prevProgramming => (
                prevProgramming.width > 0 && (
                    <CollorFilling 
                        className="color-filling color-DIS" 
                        width={prevProgramming.width} 
                        initAtPosition={prevProgramming.init_at_position}
                    >
                        <div className="available-status">
                            <p>{data.destination}</p>
                        </div>
                    </CollorFilling>
                )
            ))}
        </>
    );
}

function NextPrevPageAction({onNext, onPrev}) {

    return(
        <div className="next-prev-page-action">
            <FlexSpaceBetween>
                <IconButton className="btn-action" onClick={onPrev}>
                    <ArrowLeftIcon />
                </IconButton>
                <IconButton className="btn-action btn-action-2" onClick={onNext}>
                    <ArrowRightIcon />
                </IconButton>
            </FlexSpaceBetween>
        </div>
    );
}

function TableRow({data, detailedView, openSchedule, processing}) {
    const height = detailedView ? 80 : 40;
    return(
        <>
            {data.map((model, index) => {
                const {data} = model;

                return(
                    <>
                        <tr className="monitoring-table-row">
                            <td style={{height}} className={`cell-prefix ${index < data.length-1 ? 'no-border-bottom' : ''}`}>
                                <div className="prefix-name prefix-btn" onClick={() => openSchedule(model.prefix)}>
                                    <p>{model.prefix}</p>
                                </div>
                            </td>
                            <MonitoringCell height={height} className="monitoring-table-body-values">
                                <tr className="hours-group">
                                    {processing ? (
                                        <div className="cell-loader">
                                            <Skeleton height={40} animation="wave" variant="rect" />
                                        </div>
                                    ) : (
                                        <>
                                            {hours_of_day.map((hour, index) => (
                                                <td className={`status-cell ${index === 0 ? 'no-border-left' : ''}`} />
                                            ))}
                                            {data.map((model_data, index) => {
                                                // Calcular disponibilidade entre status
                                                let prev_programmings = [];
        
                                                // Se for o primeiro status, pegar as 00:00 como hora início e a data de início do primeiro status como hora final 
                                                if(index === 0) {
                                                    const difference = subHours('00:00', model_data.hora_inicial);
                                                    
                                                    if(difference >= 60) {
                                                        prev_programmings.push({
                                                            width: (difference / total_minutes) * 100,
                                                            init_at_position: 0,
                                                        });
                                                    }
                                                } else {
                                                    // Se não, calcular usando a hora fim do status anterior menos a hora de início do status atual
                                                    const difference = subHours(data[index-1].hora_final, model_data.hora_inicial);
                                                    if(difference >= 60) {
                                                        prev_programmings.push({
                                                            width: (difference / total_minutes) * 100,
                                                            init_at_position: (convertTimeToMinutes(data[index-1].hora_final) / total_minutes)*100,
                                                        });
                                                    }
                                                }
        
                                                // Se for o último
                                                if(index === data.length-1) {
                                                    const difference = subHours(model_data.hora_final, '23:59');
                                                    if(difference >= 60) {
                                                        prev_programmings.push({
                                                            width: (difference / total_minutes) * 100,
                                                            init_at_position: (convertTimeToMinutes(model_data.hora_final) / total_minutes)*100,
                                                        });
                                                    }
                                                }
        
                                                return(
                                                    <CollorFillingComponent 
                                                        index={index}
                                                        status={model_data.status}  
                                                        hour_start={model_data.hora_inicial}
                                                        hour_end={model_data.hora_final}
                                                        notes={model_data.notes}
                                                        day={model.data.length}
                                                        detailedView={detailedView}
                                                        data={model_data}
                                                        prevProgrammings={prev_programmings}
                                                    />
                                                );
                                            })}    
                                        </>
                                    )}
                                </tr>
                            </MonitoringCell>
                        </tr>
                    </>
                );
            })}
        </>
    );
}

function TableHead({currentDay}) {

    return(
        <>
            <tr className="monitoring-table-head">
                <th className="assigned-label"></th>
                {/**<th className="day">{getDatetime(currentDay, EnumDatetimeFormatTypes.READABLE_V2)}</th> */}
            </tr>
            <tr className="monitoring-table-head-container">
                <td className="cell-prefix">
                    <div className="prefix-name">
                        <p>Prefixo</p>
                    </div>
                </td>
                <td className="monitoring-table-head-values">
                    <tr>
                        {hours_of_day.map((hour, index) => <td className={index%2 === 0 ? 'primary-color-value' : 'secondary-color-value'}>{hour}</td>)}
                    </tr>
                </td>
            </tr>
        </>
    );
}

function AircraftMonitoring({rows, processing, detailedView, currentDay, openSchedule}) {
    const table_width = 1600;

    const subtitles = [
        {
            color: 'rgba(255, 255, 255, .8)',
            subtitle: 'Disponível',
        },
        {
            color: 'rgba(240, 128, 128, .8)',
            subtitle: 'Indisponível por voo',
        },
        {
            color: 'rgba(240, 230, 140, .8)',
            subtitle: 'Reservado',
        },
        {
            color: 'rgba(119, 136, 153, .8)',
            subtitle: 'Indisponível por manutenção',
        },
    ];

    return(
        <div className="aircraft-monitoring">
            <div className="monitoring-table">
                <TableLayout widthSize={table_width} className="schedule-aircrafts-table">
                    <TableHead currentDay={currentDay} />
                    <TableRow processing={processing} data={rows} openSchedule={openSchedule} detailedView={detailedView} />
                </TableLayout>
            </div>

            <div className="monitoring-subtitles">
                {subtitles.map(subtitle => (
                    <FlexContent className="subtitle">
                        <div style={{backgroundColor: subtitle.color}} className="color-subtitle"></div>
                        <p>{subtitle.subtitle}</p>
                    </FlexContent>
                ))}
            </div>
        </div>
    );
}

export default function Programming({serverDatetime}) {
    const today = new Date(serverDatetime);
    const [viewType, setViewType] = useState('simplified');
    const [currentDay, setCurrentDay] = useState(today);
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    
    async function index(current_date) {
        setLoading(true);
        try {
            const aircrafts = await sistemavoar.getAircraftList();
            const aircraft_status = await sistemavoar.getAircraftStatusList(getDate(current_date, EnumDatetimeFormatTypes.SQL_ONLY_DATE), getDate(current_date, EnumDatetimeFormatTypes.SQL_ONLY_DATE));

            //const flight_order_types = await sistemavoar.getFlightOrderTypes();
            makeRows(aircrafts.data, aircraft_status.sort((a, b) => b.initial_date - a.initial_date));
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {index(currentDay)}, []);

    function makeRows(aircrafts, aircraft_status) {
        let arr = aircrafts.map(aircraft => ({
            prefix: aircraft.air_mark
        }));

        setPrefix(arr[0]);

        arr.map(el => {
            let data = [];
            for (let index = 0; index < aircraft_status.length; index++) {
                const aircraft_status_el = aircraft_status[index];
                
                let initial_date = aircraft_status_el.initial_date.split('T');
                let final_date = aircraft_status_el.final_date.split('T');

                let initial_time = initial_date[1].split(':');
                let final_time = final_date[1].split(':');

                if(aircraft_status_el.aircraft === el.prefix) {
                    let el_status = {
                        status: aircraft_status_el.status,
                        hora_inicial: `${initial_time[0]}:${initial_time[1]}`,
                        hora_final: `${final_time[0]}:${final_time[1]}`,
                        notes: aircraft_status_el.notes,
                    };

                    if(aircraft_status_el.status === 'VOO') {
                        el_status.origin = 'SNCJ';
                        el_status.destination = 'previous location';
                    }

                    data.push(el_status);
                }
            }

            el.data = data;
            return el;
        });
    
        setRows(arr);
        setLoading(false);
    }

    function handleChangeViewType(e) {
        setViewType(e.target.value);
    }

    const [viewSchedule, setViewSchedule] = useState(false);
    const [prefix, setPrefix] = useState('');

    /**
     * 
     * @param {string} prefix 
     */
    function openSchedule(prefix) {
        setPrefix(prefix);
        setViewSchedule(true);
    }

    function closeSchedule() {
        setViewSchedule(false);
    }

    function handleNext() {
        const current_day = addDays(currentDay, 1);
        setCurrentDay(current_day);
        index(current_day);
    }

    function handlePrev() {
        if(isSameDay(currentDay, today)) return;
        const current_day = subDays(currentDay, 1);
        setCurrentDay(current_day);
        index(current_day);
    }

    function handleChangeFromDatepicker(date) {
        setCurrentDay(date);
        index(date);
    }

    return(
        <WrapperContent>
            <section id="programming" className="programming">
            <PageTitle title="Programação" />
            
            {rows.length === 0 && loading ? <Processing /> : (
                <>
                    <div className="header">
                        <div className="select-detailed-view">
                            <Select 
                                id="type" 
                                name="type" 
                                className="select" 
                                displayEmpty
                                value={viewType}
                                disableUnderline={true}
                                onChange={handleChangeViewType}
                            >
                                <MenuItem value="simplified">Visão simplificada</MenuItem>
                                <MenuItem value="detailed">Visão detalhada</MenuItem>
                            </Select>
                        </div>
                        <div className="actions-programing">
                            <Datepicker value={currentDay} onChange={handleChangeFromDatepicker} />
                            <NextPrevPageAction 
                                onNext={handleNext} 
                                onPrev={handlePrev} 
                            />
                        </div>
                    </div>
                    <AircraftMonitoring 
                        rows={rows} 
                        processing={loading}
                        currentDay={currentDay} 
                        openSchedule={openSchedule}
                        detailedView={viewType === 'detailed'} 
                    />
                    <AircraftSchedule 
                        serverDatetime={serverDatetime}
                        prefix={prefix}
                        open={viewSchedule} 
                        handleClose={closeSchedule} 
                    />
                </>
            )}
            </section>
        </WrapperContent>
    );
}