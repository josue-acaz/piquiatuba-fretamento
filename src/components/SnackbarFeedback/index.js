import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

export default function SnackbarFeedback({
    severity, 
    handleClose, 
    open, 
    msg, 
    autoHideDuration=6000,
}) {

  const classes = useStyles();

  function getMessage() {
      let message = msg;

      switch(severity) {
        case 'success':
            if(!msg) {
                message = 'Operação terminou com êxito!';
            }
        break;

        case 'error':
            if(!msg) {
                message = 'Operação terminou com erro!';
            }
        break;

        default:
          break;
      }

    return message;
  }

  return (
    <div className={classes.root}>
      <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
          {getMessage()}
        </Alert>
      </Snackbar>
    </div>
  );
}
