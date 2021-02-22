import React from "react";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from '@date-io/date-fns';
import ptLocation from 'date-fns/locale/pt-BR';

import './styles.css';

export default function Datepicker({value, onChange}) {
    const today = new Date();

    return(
        <div className="date-picker">
            <MuiPickersUtilsProvider utils={DateFnsUtils} locale={ptLocation}>
                <KeyboardDatePicker
                    autoOk
                    disableToolbar
                    className="datepicker-keyboard"
                    variant="inline"
                    inputVariant="standard"
                    label="Escolha o dia"
                    format="dd/MM/yyyy"
                    value={value}
                    minDate={today}
                    onChange={onChange}
                />
            </MuiPickersUtilsProvider>
        </div>
    );
}