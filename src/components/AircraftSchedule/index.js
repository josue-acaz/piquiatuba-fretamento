import React from 'react';
import FullScreenDialog from '../FullScreenDialog';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import { FlexSpaceBetween } from '../../core/design';
import Calendar from '../Calendar';

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

export default function AircraftSchedule({prefix, open, handleClose}) {
    
    function handlePrev() {}
    function handleNext() {}

    return(
        <FullScreenDialog 
            CustomToolbar={
                <CustomToolbar 
                    title="PT-SOK" 
                    handleClose={handleClose} 
                    handlePrev={handlePrev} 
                    handleNext={handleNext} />} 
            open={open} 
            title={prefix} 
            handleClose={handleClose}
        >
            <div className="aircraft-schedule">
                <Calendar />
            </div>
        </FullScreenDialog>
    );
}
