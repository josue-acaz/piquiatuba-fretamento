import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

// Inspired by the former Facebook spinners.
const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
  bottom: {
    color: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  top: {
    color: '#1a90ff',
    animationDuration: '550ms',
    position: 'absolute',
    left: 0,
  },
  circle: {
    strokeLinecap: 'round',
  },
}));

function CustomCircularProgress(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CircularProgress
        variant="determinate"
        className={classes.bottom}
        size={40}
        thickness={4}
        {...props}
        value={100}
      />
      <CircularProgress
        variant="indeterminate"
        disableShrink
        className={classes.top}
        classes={{
          circle: classes.circle,
        }}
        size={40}
        thickness={4}
        {...props}
      />
    </div>
  );
}

export default function FormDialog({
  children, 
  open=false, 
  processing=false, 
  title='', 
  msg='', 
  code='',
  submitted=false,
  handleClose, 
  handleSubmit, 
  handleSend}) {

  return (
    <div>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">{title}</DialogTitle>
        <DialogContent>
          {submitted ? (
            <DialogContentText>
              Formulário criado!
            </DialogContentText>
          ) : (
            <>
              <DialogContentText>
                {processing ? 'Um momento...' : msg}
              </DialogContentText>
              {processing && (
                <CustomCircularProgress />
              )}
            </>
          )}
          {children}
        </DialogContent>
        {!processing && (
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancelar
            </Button>
            {submitted ? (
              <Button onClick={handleSend} color="primary">
                Enviar
              </Button>
            ) : (
              <Button onClick={handleSubmit} color="primary">
                Criar
              </Button>
            )}
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
}
