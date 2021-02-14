import React, {useState} from 'react';
import PageTitle from '../../../components/PageTitle';
import {WrapperContent, FlexSpaceBetween, FlexContent} from '../../../core/design';
import Switch from '@material-ui/core/Switch';
import styled from 'styled-components';

import './styles.css';

const days = [
    '20/Fev',
    '21/Fev',
    '22/Fev',
];

const hours_of_day = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    14,
    15,
    16,
    17,
    18,
    19,
    20,
    21,
    22,
    23,
];

const num_of_hours = hours_of_day.length;
const total_minutes = num_of_hours * 60;

const aircrafts = [
    {
        prefix: 'PT-SOK',
        days: [
            {
                number: '20',
                status: [
                    {
                        name: 'reserved',
                        code: 'REV',
                        hour_start: '02:00',
                        hour_end: '03:30',
                    },
                    {
                        name: 'unavailable',
                        code: 'IND',
                        hour_start: '04:30',
                        hour_end: '05:00',
                    },
                    {
                        name: 'unavailable_per_flight',
                        code: 'VOO',
                        hour_start: '05:00',
                        hour_end: '06:00',
                    },
                    {
                        name: 'unavailable_per_maintenance',
                        code: 'MNT',
                        hour_start: '08:00',
                        hour_end: '10:00',
                    },
                    {
                        name: 'unavailable_per_maintenance',
                        code: 'MNT',
                        hour_start: '22:00',
                        hour_end: '23:00',
                    },
                    {
                        name: 'unavailable_per_flight',
                        code: 'VOO',
                        hour_start: '23:30',
                        hour_end: '02:30',
                    },
                ]
            },
            {
                number: '21',
                status: [
                    {
                        name: 'unavailable_per_maintenance',
                        code: 'MNT',
                        hour_start: '03:00',
                        hour_end: '04:00',
                    },
                ]
            },
            {
                number: '22',
                status: [
                    {
                        name: 'unavailable_per_maintenance',
                        code: 'MNT',
                        hour_start: '03:00',
                        hour_end: '04:00',
                    },
                ]
            }
        ]
    },
    {
        prefix: 'PT-WNG',
        days: [
            {
                number: '20',
                status: [
                    {
                        name: 'reserved',
                        code: 'REV',
                        hour_start: '01:00',
                        hour_end: '01:30',
                    },
                    {
                        name: 'unavailable',
                        code: 'IND',
                        hour_start: '02:30',
                        hour_end: '04:00',
                    },
                    {
                        name: 'unavailable_per_flight',
                        code: 'VOO',
                        hour_start: '04:00',
                        hour_end: '06:00',
                    },
                    {
                        name: 'unavailable_per_maintenance',
                        code: 'MNT',
                        hour_start: '08:00',
                        hour_end: '09:00',
                    },
                    {
                        name: 'unavailable_per_maintenance',
                        code: 'MNT',
                        hour_start: '23:00',
                        hour_end: '01:30',
                    },
                ]
            },
            {
                number: '21',
                status: [
                    {
                        name: 'unavailable_per_flight',
                        code: 'VOO',
                        hour_start: '02:00',
                        hour_end: '03:30',
                    },
                    {
                        name: 'unavailable_per_flight',
                        code: 'VOO',
                        hour_start: '22:00',
                        hour_end: '01:30',
                    },
                ]
            },
            {
                number: '22',
                status: [
                    {
                        name: 'unavailable_per_maintenance',
                        code: 'MNT',
                        hour_start: '03:00',
                        hour_end: '04:00',
                    },
                ]
            }
        ]
    },
];

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
    width: ${props => props.width}px;
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
`;

function CollorFillingComponent({index, day, status, detailedView}) {
    const last_status = index === day.status.length-1;
    const start_position = convertTimeToMinutes(status.hour_start) / total_minutes;
    const end_position = convertTimeToMinutes(
        last_status ? getHourFromEndStatus(status.hour_start, status.hour_end) : status.hour_end
    ) / total_minutes;

    const init_at_position = start_position*100;
    const width = (end_position-start_position)*100;

    return(
        <CollorFilling className={`color-filling color-${status.name}`} width={width} initAtPosition={init_at_position}>
            <StatusCode fill={!detailedView}>{status.code}</StatusCode>
            {detailedView && (
                <div className="period">
                    <p>Início: {status.hour_start}</p>
                    <p>Fim: {status.hour_end}</p>
                </div>
            )}
        </CollorFilling>
    );
}

function TableRow({detailedView, tableWidth}) {
    const height = detailedView ? 100 : 50;

    return(
        aircrafts.map(aircraft => (
            <tr className="monitoring-table-row">
                <td className="cell-prefix">
                    <div className="prefix-name">
                        <p>{aircraft.prefix}</p>
                    </div>
                </td>
                {aircraft.days.map(day => {
                    
                    return(
                        <MonitoringCell height={height} className="monitoring-table-body-values">
                            <tr className="hours-group">
                                {hours_of_day.map((hour, index) => (
                                    <td className={`status-cell ${index === 0 ? 'no-border-left' : ''}`} />
                                ))}
                                {day.status.map((status, index) => (
                                    <CollorFillingComponent 
                                        status={status} 
                                        index={index} 
                                        day={day}
                                        detailedView={detailedView}
                                    />
                                ))}
                            </tr>
                        </MonitoringCell>
                    );
                })}
            </tr>
        ))
    );
}

function TableHead() {

    return(
        <>
            <tr className="monitoring-table-head">
                <th className="assigned-label"></th>
                {days.map(day => <th className="day">{day}</th>)}
            </tr>
            <tr className="monitoring-table-head-container">
                <td>Prefixo</td>
                {days.map((day, index) => (
                    <td className="monitoring-table-head-values">
                        <tr>
                            {hours_of_day.map((hour, index) => <td className={index%2 === 0 ? 'primary-color-value' : 'secondary-color-value'}>{hour}</td>)}
                        </tr>
                    </td>
                ))}
            </tr>
        </>
    );
}

function AircraftMonitoring({detailedView}) {
    const table_width = days.length*1600;

    return(
        <div className="aircraft-monitoring">
            <div className="monitoring-table">
                <TableLayout width={table_width} className="schedule-aircrafts-table">
                    <TableHead />
                    <TableRow detailedView={detailedView} tableWidth={table_width} />
                </TableLayout>
            </div>
        </div>
    );
}

export default function Programming() {
    const [detailedView, setDetailedView] = useState(false);
    function handleChangeDetailedView(e) {
        setDetailedView(e.target.checked);
    }

    return(
        <WrapperContent>
            <section id="programming" className="programming">
            <FlexSpaceBetween>
                <PageTitle title="Programação" subtitle="Status das aeronaves" />
                <div className="switch-detailed-view">
                    <FlexContent>
                        <p>Visão detalhada?</p>
                        <FlexContent>
                            <Switch 
                                name="detailed-view" 
                                value={detailedView} 
                                onChange={handleChangeDetailedView} 
                            />
                            <p><strong>{detailedView ? 'SIM' : 'NÃO'}</strong></p>
                        </FlexContent>
                    </FlexContent>
                </div>
            </FlexSpaceBetween>

            <AircraftMonitoring detailedView={detailedView} />

            </section>
        </WrapperContent>
    );
}