import React, {useEffect, useState} from 'react';
import FullScreenDialog from '../FullScreenDialog';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import { FlexSpaceBetween } from '../../core/design';
import Calendar from '../Calendar';
import {getDate} from '../../utils';
import {EnumDatetimeFormatTypes} from '../../global';
import sistemavoar from '../../services/sistema-voar';
import api from '../../api';

import './styles.css';

function CustomToolbar({title, handleClose}) {
    return(
        <Toolbar style={{paddingLeft: '1rem', paddingRight: '0rem'}}>
            <FlexSpaceBetween>
                <Typography variant="h6">{title}</Typography>
                <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                    <CloseIcon />
                </IconButton>
            </FlexSpaceBetween>
        </Toolbar>
    );
}

export default function AircraftSchedule({prefix, open, handleClose, serverDatetime}) {
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date(serverDatetime));
    const [today, setToday] = useState(new Date(serverDatetime));
    const [events, setEvents] = useState([]);
    
    function handlePrev() {}
    function handleNext() {}

    async function index(prefix, current_date) {
        setLoading(true);
        const first_day = new Date(current_date.getFullYear(), current_date.getMonth(), 1);
        const last_day = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 0);

        let formatted_first_day = getDate(first_day, EnumDatetimeFormatTypes.SQL_ONLY_DATE);
        let formatted_last_day = getDate(last_day, EnumDatetimeFormatTypes.SQL_ONLY_DATE);

        try {
            const aircraft_status = await sistemavoar.getAircraftStatusByPrefix(prefix, formatted_first_day, formatted_last_day);
            makeEvents(aircraft_status);
        } catch (error) {
            setLoading(false);
            console.error(error);
        }
    }

    function makeEvents(aircraft_status) {
        let events = [];
        aircraft_status.data.forEach(el => {
            const initial_date = el.ast_initial_date.split('T');
            const final_date = el.ast_final_date.split('T');

            const start_time = initial_date[1].split(':');
            const end_time = final_date[1].split(':');

            events.push({
                start_time: `${initial_date[0]} ${start_time[0]}:${start_time[1]}`,
                end_time: `${final_date[0]} ${end_time[0]}:${end_time[1]}`,
                title: `${start_time[0]}:${start_time[1]} às ${end_time[0]}:${end_time[1]} - ${el.ast_status}`,
                subtitle: 'Subtítulo do evento',
                notes: el.ast_notes,
                status: el.ast_status,
            });
        });

        setEvents(events);
        setLoading(false);
    }

    useEffect(() => {
        async function getDatetimeFromServer() {
            try {
                const {data} = await api.get('/current-datetime');
                const current_datetime = new Date(data);
                setCurrentDate(current_datetime);
                setToday(current_datetime);
            } catch (error) {
                console.error(error);
            }
        }

        getDatetimeFromServer();
        index(prefix, currentDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefix]);

    async function onChangeDate(date) {
        setCurrentDate(date);
        index(prefix, date);
    }

    return(
        <FullScreenDialog 
            CustomToolbar={
                <CustomToolbar 
                    title={prefix} 
                    handleClose={handleClose} 
                    handlePrev={handlePrev} 
                    handleNext={handleNext} />} 
            open={open} 
            handleClose={handleClose}
        >
            <div className="aircraft-schedule">
                {loading ? <p>Carregando...</p> : (
                    <Calendar 
                        today={today}
                        events={events}
                        currentDate={currentDate} 
                        onChange={onChangeDate} 
                    />
                )}
            </div>
        </FullScreenDialog>
    );
}
