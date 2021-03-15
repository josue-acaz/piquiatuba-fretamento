import React, {useState, useEffect} from 'react';
import {setMonth, getMonth} from 'date-fns';
import {getDayOfMonth, getDate} from '../../utils';
import {getDaysOfMonth, getMonthView} from './functions';
import {FlexContent} from  '../../core/design';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import styled from 'styled-components';
import {EnumDatetimeFormatTypes} from '../../global';
import Transition from '../../components/Transition';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

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

function Event({event, formatted_day, day}) {
    const [open, setOpen] = useState(false);

    function handleOpen() {
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
    }

    const arr_start_date = event.start_time.split(' ');
    const start_part_of_date = arr_start_date[0];
    
    const arr_end_date = event.end_time.split(' ');
    const end_part_of_date = arr_end_date[0];

    return(
        (formatted_day === start_part_of_date) && day.current_month_day && (
            <>
                <Dialog
                    open={open}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={handleClose}
                    aria-labelledby="alert-event"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle id="alert-event-title">{event.title}</DialogTitle>
                    <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">{event.notes}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        OK
                    </Button>
                    </DialogActions>
                </Dialog>
                <div onClick={handleOpen} className={`item-event item-event-${event.status}`}>
                <p>{event.title}</p>
                </div>
            </>
        )
    );
}

function WeekDay({day, events, iso_today, month_of_today, currentMonth, year_of_today, currentYear}) {
    const date_day = new Date(currentYear, currentMonth, day.day_of_month);
    const formatted_day = getDate(date_day, EnumDatetimeFormatTypes.SQL_ONLY_DATE);
    return(
        <td className={`cell ${day.current_month_day ? '' : 'other_month_days'} ${((day.day_of_month === iso_today) && (month_of_today === currentMonth) && (year_of_today === currentYear)) ? 'cell-today' : ''}`}>
            <div className="cell-content">{day.day_of_month}</div>
            <div className="events">
                {events.map(event => <Event event={event} formatted_day={formatted_day} day={day} />)}
            </div>
        </td>
    );
}

export default function Calendar({today, currentDate, onChange, events}) {
    const iso_today = getDayOfMonth(today);
    const month_of_today = getMonth(today);
    const year_of_today = today.getFullYear();
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
        onChange(setMonth(currentDate, prev_month));

        // Ano anterior
        if(prev_month === -1) {
            setCurrentMonth(11);
        } else {
            setCurrentMonth(prev_month);
        }
    }

    function handleNext() {
        const next_month = currentMonth+1;
        onChange(setMonth(currentDate, next_month));

        // Próximo ano
        if(next_month === 12) {
            setCurrentMonth(0);
        } else {
            setCurrentMonth(next_month);
        }
    }

    return(
        <div className="calendar">
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
                                <WeekDay 
                                    day={day} 
                                    events={events}
                                    iso_today={iso_today} 
                                    month_of_today={month_of_today}
                                    currentMonth={currentMonth} 
                                    year_of_today={year_of_today} 
                                    currentYear={currentYear} 
                                />
                            ))}
                        </TableRow>
                    ))}
                </table>
            </div>
        </div>
        </div>
    );
}