import React, {useEffect, useState} from 'react';
import {getWeeksInMonth, lastDayOfMonth, getMonth, getDay} from 'date-fns';
import {getDayOfMonth, getDayOfWeek} from '../../../utils';
import styled from 'styled-components';

import './styles.css';

const TableHead = styled.th`
    padding-top: 12px;
    padding-bottom: 12px;
    text-align: left;
    background-color: #f2f2f2;
    color: #444444;
    width: ${props => props.headWidth}%;
    height: 50px;
    font-weight: bold;
`;

const TableRow = styled.tr`
    height: ${props => props.rowHeight}px;
`;

/**
 * @param {number} month month number, 0 based
 * @param {number} year year, not zero based, required to account for leap years
 */
function getDaysInMonth(month, year) {
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
        let day = new Date(date);
        days.push({
            day_of_week: getDayOfWeek(day),
            day_of_month: getDayOfMonth(day)
        });
        date.setDate(date.getDate() + 1);
    }
    return days;
}

export default function MonthView() {
    const [loading, setLoading] = useState(true);
    const [calendar, setCalendar] = useState([]);

    var today = new Date();
    const iso_current_month = getMonth(today);
    const iso_today = getDayOfMonth(today);
    const [currentMonth, setCurrentMonth] = useState(iso_current_month);
    const [prevMonth, setPrevMonth] = useState(new Date(today.setMonth(currentMonth-1)));

    const weeks_of_current_month = getWeeksInMonth(currentMonth);
    const days_of_current_month = getDaysInMonth(currentMonth, 2021);
    const last_day_of_prev_month = lastDayOfMonth(prevMonth);

    const days_of_week = [
        'Segunda-Feira',
        'Terça-Feira',
        'Quarta-Feira',
        'Quinta-Feira',
        'Sexta-Feira',
        'Sábado',
        'Domingo',
    ];

    const head_cell_length = 100/days_of_week.length;

    function makeMonth() {
        let calendar = [];
        let week = [];
        for (let index = 0; index < days_of_current_month.length; index++) {
            let current_week_day = days_of_current_month[index].day_of_week;
            let current_month_day = days_of_current_month[index].day_of_month;

            week.push(current_month_day);
            if(current_week_day === 7) {
                calendar.push({week});
                week = [];
            }
        }

        setCalendar(calendar);
        setLoading(false);
    }

    useEffect(() => {makeMonth()}, []);

    return(
        <div className="month-view">
            <table id="month-table-view" style={{height: '100%'}} className="month-table-view">
                <tr>
                    {days_of_week.map(week_day => <TableHead headWidth={head_cell_length}>{week_day}</TableHead>)}
                </tr>
                {calendar.map(calendar => (
                    <TableRow className="table-row">
                        {calendar.week.map(day_of_month => (
                            <td className={`cell ${day_of_month === iso_today ? 'cell-today' : ''}`}>
                                <div className="cell-content">{day_of_month}</div>
                            </td>
                        ))}
                    </TableRow>
                ))}
            </table>
        </div>
    );
}