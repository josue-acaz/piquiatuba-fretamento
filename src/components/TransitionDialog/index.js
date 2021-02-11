import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { DialogContentText } from '@material-ui/core';

import './styles.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function TransitionDialog({children, open, disableBackdropClick=false, title, msg, handleClose, disableActions=false}) {

  return (
    <Dialog
        open={open}
        className="transition-dialog"
        TransitionComponent={Transition}
        disableBackdropClick={disableBackdropClick}
        keepMounted
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">
            <strong>{title}</strong>
        </DialogTitle>
        <DialogContentText className="msg">{msg}</DialogContentText>
        <DialogContent>
          {children}
        </DialogContent>
        {!disableActions && (
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Fechar
            </Button>
          </DialogActions>
        )}
    </Dialog>
  );
}
