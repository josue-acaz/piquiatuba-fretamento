import React from 'react';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';

import './styles.css';

const today = new Date();
export default function DateTimerPicker({
    id,
    name,
    className,
    placeholder='Selecione...',
    value,
    onChange,
    disabledDates,
    minDate=today,
    maxDate,
    disabled=false,
}) {

    addLocale('pt', {
        firstDayOfWeek: 1,
        dayNames: ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'],
        dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        today: 'Hoje',
        clear: 'Claro'
    });

    return(
        <Calendar 
            id={id} 
            locale="pt"
            showTime 
            showSeconds 
            name={name}
            value={value}
            minDate={minDate}
            maxDate={maxDate} 
            disabled={disabled}
            onChange={onChange}
            placeholder={placeholder}
            disabledDates={disabledDates}
            className={`calendar-select ${className}`}
        />
    );
}