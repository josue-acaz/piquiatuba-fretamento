import React, {useState} from 'react';
import {addDays, subDays, isSameDay} from 'date-fns';
import PageTitle from '../../../components/PageTitle';
import {
    WrapperContent, 
    FlexSpaceBetween, 
    FlexContent,
} from '../../../core/design';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import AircraftSchedule from '../../../components/AircraftSchedule';
import Datepicker from '../../../components/Datepicker';
import Skeleton from '@material-ui/lab/Skeleton';
import styled from 'styled-components';
import {getDatetime} from '../../../utils';
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

    console.log({end_hour});

    return end_hour;
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

function CollorFillingComponent({index, day, status, detailedView, hour_start, hour_end}) {
    const last_status = index === day-1;
    const start_position = convertTimeToMinutes(hour_start) / total_minutes;
    const end_position = convertTimeToMinutes(
        last_status ? getHourFromEndStatus(hour_start, hour_end) : hour_end
    ) / total_minutes;

    const init_at_position = start_position*100;
    const width = (end_position-start_position)*100;

    return(
        <CollorFilling className={`color-filling color-${status}`} width={width} initAtPosition={init_at_position}>
            <StatusCode fill={!detailedView}>{status}</StatusCode>
            {/**
             * detailedView && (
                <div className="period">
                    <p>De: {hour_start}</p>
                    <p>Às: {hour_end}</p>
                </div>
            )
             */}
        </CollorFilling>
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

function TableRow({data, detailedView}) {
    const height = detailedView ? 80 : 40;
    const [viewSchedule, setViewSchedule] = useState(false);

    function openSchedule() {
        setViewSchedule(true);
    }

    function closeSchedule() {
        setViewSchedule(false);
    }

    return(
        data.map((model, index) => (
            <>
                <tr className="monitoring-table-row">
                    <td style={{height}} className={`cell-prefix ${index < data.length-1 ? 'no-border-bottom' : ''}`}>
                        <div className="prefix-name prefix-btn" onClick={openSchedule}>
                            <p>{model.prefix}</p>
                        </div>
                    </td>
                    <MonitoringCell height={height} className="monitoring-table-body-values">
                        <tr className="hours-group">
                            {hours_of_day.map((hour, index) => (
                                <td className={`status-cell ${index === 0 ? 'no-border-left' : ''}`} />
                            ))}
                            {model.data.map((data, index) => (
                                <CollorFillingComponent 
                                    status={data.status} 
                                    index={index} 
                                    hour_start={data.hora_inicial}
                                    hour_end={data.hora_final}
                                    day={model.data.length}
                                    detailedView={detailedView}
                                />
                            ))}
                        </tr>
                    </MonitoringCell>
                </tr>
                <AircraftSchedule 
                    open={viewSchedule} 
                    prefix={model.prefix}
                    handleClose={closeSchedule} 
                />
            </>
        ))
    );
}

function TableHead({currentDay}) {

    return(
        <>
            <tr className="monitoring-table-head">
                <th className="assigned-label"></th>
                <th className="day">{getDatetime(currentDay, EnumDatetimeFormatTypes.READABLE_V2)}</th>
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

function AircraftMonitoring({rows, detailedView, currentDay}) {
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
            subtitle: 'Reservada',
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
                    <TableRow data={rows} detailedView={detailedView} />
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

export default function Programming() {
    const today = new Date();
    const [viewType, setViewType] = useState('simplified');
    const [currentDay, setCurrentDay] = useState(today);
    const [rows, setRows] = useState([
        {
            prefix: 'PT-SOK',
            data: [
                {
                    status: 'IM',
                    hora_inicial: '08:30:00',
                    hora_final: '10:30:00',
                    user_name: 'Josué',
                    notes: '',
                },
                {
                    status: 'RE',
                    hora_inicial: '11:30:00',
                    hora_final: '13:00:00',
                    user_name: 'Josué',
                    notes: '',
                },
                {
                    status: 'IM',
                    hora_inicial: '14:30:00',
                    hora_final: '15:30:00',
                    user_name: 'Josué',
                    notes: '',
                },
                {
                    status: 'IF',
                    hora_inicial: '22:30:00',
                    hora_final: '23:59:00',
                    user_name: 'Josué',
                    notes: '',
                },
            ]
        },
        {
            prefix: 'PT-WNG',
            data: [
                {
                    status: 'IM',
                    hora_inicial: '10:30:00',
                    hora_final: '12:30:00',
                    user_name: 'Josué',
                    notes: '',
                },
                {
                    status: 'RE',
                    hora_inicial: '13:30:00',
                    hora_final: '14:00:00',
                    user_name: 'Josué',
                    notes: '',
                },
                {
                    status: 'IM',
                    hora_inicial: '16:30:00',
                    hora_final: '18:30:00',
                    user_name: 'Josué',
                    notes: '',
                },
                {
                    status: 'IF',
                    hora_inicial: '21:30:00',
                    hora_final: '23:00:00',
                    user_name: 'Josué',
                    notes: '',
                },
            ]
        },
        {
            prefix: 'PT-WHT',
            data: [
                {
                    status: 'IM',
                    hora_inicial: '08:30:00',
                    hora_final: '10:30:00',
                    user_name: 'Josué',
                    notes: '',
                },
                {
                    status: 'RE',
                    hora_inicial: '11:30:00',
                    hora_final: '13:00:00',
                    user_name: 'Josué',
                    notes: '',
                },
                {
                    status: 'IM',
                    hora_inicial: '14:30:00',
                    hora_final: '15:30:00',
                    user_name: 'Josué',
                    notes: '',
                },
                {
                    status: 'IF',
                    hora_inicial: '22:30:00',
                    hora_final: '23:59:00',
                    user_name: 'Josué',
                    notes: '',
                },
            ]
        },
    ]);
    
    function handleChangeViewType(e) {
        setViewType(e.target.value);
    }

    const [loading, setLoading] = useState(false);

    function handleNext() {
        const current_day = addDays(currentDay, 1);
        setCurrentDay(current_day);
    }

    function handlePrev() {
        if(isSameDay(currentDay, today)) return;
        const current_day = subDays(currentDay, 1);
        setCurrentDay(current_day);
    }

    function handleChangeFromDatepicker(date) {
        setCurrentDay(date);
    }

    return(
        <WrapperContent>
            <section id="programming" className="programming">
            
            <PageTitle title="Programação" subtitle="Status das aeronaves" />
            
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
            {loading ? (
                <>
                    <Skeleton height={50} animation="wave" />
                    <Skeleton height={50} animation="wave" />
                    <Skeleton height={50} animation="wave" />
                </>
            ) : (
                <AircraftMonitoring rows={rows} currentDay={currentDay} detailedView={viewType === 'detailed'} />
            )}
            </section>
        </WrapperContent>
    );
}