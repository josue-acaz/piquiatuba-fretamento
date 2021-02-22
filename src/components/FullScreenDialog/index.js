import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Transition from '../Transition';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
    backgroundColor: '#324f80',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

export default function FullScreenDialog({children, className, CustomToolbar, open, handleClose, title}) {
  const classes = useStyles();

  return (
    <Dialog className={className} fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          {CustomToolbar ? CustomToolbar : (
            <Toolbar style={{padding: 1}}>
              <Typography variant="h6" className={classes.title}>
                {title}
              </Typography>
              <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
                <CloseIcon />
              </IconButton>
            </Toolbar>
          )}
        </AppBar>
        {children}
    </Dialog>
  );
}
