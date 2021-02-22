import React from 'react';
import MonthView from './MonthView';
import FullScreenDialog from '../FullScreenDialog';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import { FlexSpaceBetween } from '../../core/design';

import './styles.css';

function CustomToolbar({title, handleClose, handlePrev, handleNext}) {
    return(
        <Toolbar style={{paddingLeft: '1rem', paddingRight: '1rem'}}>
            <FlexSpaceBetween>
                <Typography variant="h6">{title}</Typography>
                <div className="month-switch">
                    <FlexSpaceBetween style={{alignItems: 'center'}}>
                        <button className="prev-month-btn" onClick={handlePrev}>
                            <ArrowLeftIcon />
                        </button>
                        <Typography variant="h6">Fevereiro</Typography>
                        <button className="next-month-btn" onClick={handleNext}>
                            <ArrowRightIcon />
                        </button>
                    </FlexSpaceBetween>
                </div>
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
                <MonthView />
            </div>
        </FullScreenDialog>
    );
}