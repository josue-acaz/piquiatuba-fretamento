import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import './styles.css';

export default function Alert({ 
    open, 
    title, 
    processing=false, 
    processingTitle, 
    processingMsg, 
    message, 
    onConfirm, 
    onCancel, 
    disableActions=false, 
    onOK}) {

    return(
        <Dialog
            open={open}
            className="alert"
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <div className="content">
                <DialogTitle id="alert-dialog-title">{processing ? processingTitle : title}</DialogTitle>
                <DialogContent className="dialog-content">
                    {!processing ? (
                            <>
                                <DialogContentText id="alert-dialog-description">{message}</DialogContentText>
                                <DialogActions className="actions">
                                        {!disableActions ? (
                                            <>
                                                <button onClick={onConfirm} className="btnConfirm">SIM</button>
                                                <button onClick={onCancel} className="btnCancel">NÃO</button>
                                            </>
                                        ) : (
                                            <button onClick={onOK} className="btnOK btnConfirm">OK</button>
                                        )}
                                </DialogActions>
                            </>
                    ) : (
                        <>
                            <div className="sk-folding-cube">
                                <div className="sk-cube1 sk-cube"></div>
                                <div className="sk-cube2 sk-cube"></div>
                                <div className="sk-cube4 sk-cube"></div>
                                <div className="sk-cube3 sk-cube"></div>
                            </div>
                            <DialogContentText id="alert-dialog-description">{processingMsg}</DialogContentText>
                        </>
                    )}
                </DialogContent>
            </div>
        </Dialog>
    );
}