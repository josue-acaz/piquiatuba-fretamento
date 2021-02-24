import React, {useState} from 'react';
import {setMonth, getMonth, getYear} from 'date-fns';
import {getDayOfMonth} from '../../utils';
import {getDaysOfMonth, getMonthView} from './functions';
import {FlexContent} from  '../../core/design';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
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
`;

const TableRow = styled.tr`
    height: ${props => props.rowHeight}px;
`;

const Toolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: .5rem;
`;

const month_names = [
    "Janeiro", 
    "Fevereiro", 
    "Março", 
    "Abril", 
    "Maio", 
    "Junho",
    "Julho", 
    "Agosto", 
    "Setembro", 
    "Outubro", 
    "Novembro", 
    "Dezembro",
];

const days_of_week = [
    'Domingo',
    'Segunda-Feira',
    'Terça-Feira',
    'Quarta-Feira',
    'Quinta-Feira',
    'Sexta-Feira',
    'Sábado',
];

function MonthView() {
    const today = new Date();
    const iso_today = getDayOfMonth(today);
    const month_of_today = getMonth(today);
    const year_of_today = today.getFullYear();
    const [currentDate, setCurrentDate] = useState(today);
    const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
    
    let prev_month = setMonth(currentDate, currentMonth-1);
    let next_month = setMonth(currentDate, currentMonth+1);
    
    let currentYear = currentDate.getFullYear();
    const disable_prev_months_before_today = (!(currentMonth > month_of_today)) && year_of_today === currentYear;
    const calendar = getMonthView(getDaysOfMonth(currentMonth, currentYear), prev_month, next_month);
    const head_cell_length = 100/days_of_week.length;

    function handlePrev() {
        // Limita a voltar até a data atual
        if(disable_prev_months_before_today) {
            return;
        }

        const prev_month = currentMonth-1;
        setCurrentDate(setMonth(currentDate, prev_month));

        // Ano anterior
        if(prev_month === -1) {
            setCurrentMonth(11);
        } else {
            setCurrentMonth(prev_month);
        }
    }

    function handleNext() {
        const next_month = currentMonth+1;
        setCurrentDate(setMonth(currentDate, next_month));

        // Próximo ano
        if(next_month === 12) {
            setCurrentMonth(0);
        } else {
            setCurrentMonth(next_month);
        }
    }

    return(
        <div className="month-view-container">
            <Toolbar>
                <p className="current_month">{`${month_names[currentMonth]} de ${currentYear}`}</p>
                <FlexContent>
                    <button className={`prev-button ${disable_prev_months_before_today ? 'action-disabled' : ''}`} onClick={handlePrev}>
                        <ArrowBackIosIcon className="icon" />
                    </button>
                    <button className="next-button" onClick={handleNext}>
                        <ArrowForwardIosIcon className="icon" />
                    </button>
                </FlexContent>
            </Toolbar>

            <div className="month-view">
                <table id="month-table-view" style={{height: '100%'}} className="month-table-view">
                    <tr>
                        {days_of_week.map(week_day => (
                            <TableHead headWidth={head_cell_length}>
                                <div className="week-day">{week_day}</div>
                            </TableHead>
                        ))}
                    </tr>
                    {calendar.map(calendar => (
                        <TableRow className="table-row">
                            {calendar.week.map(day => (
                                <td className={`cell ${day.current_month_day ? '' : 'other_month_days'} ${(day.day_of_month === iso_today && (month_of_today === currentMonth && year_of_today === currentYear)) ? 'cell-today' : ''}`}>
                                    <div className="cell-content">{day.day_of_month}</div>
                                </td>
                            ))}
                        </TableRow>
                    ))}
                </table>
            </div>
        </div>
    );
}

export default function Calendar() {
    return(
        <div className="calendar">
            <MonthView />
        </div>
    );
}