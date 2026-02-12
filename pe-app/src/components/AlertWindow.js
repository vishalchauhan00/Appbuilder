import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1,
  },
  title: {
    background: theme.palette.background.default,
    whiteSpace: 'pre-wrap'
  },
  content: {
    background: theme.palette.background.default
  },
  actions: {
    display: 'flex', 
    justifyContent: 'center',    
    background: theme.palette.background.default,
  },
  btn:{
    height: 32,
    minWidth: 72
  }
}));

export default function AlertWindow(props) {

  const title = props.title;
  const description = props.message;
  const ok = props.ok;
  const cancel = props.cancel;

  const [open, setOpen] = React.useState(props.open);

  function handleCancel() {
    props.cancelclick();

    handleClose();
  }
  function handleOK() {
    props.okclick();

    handleClose();
  }
  function handleClose() {
    setOpen(false);
  }

  const classes = useStyles();

  return (
    <div>  
      <Dialog className={classes.root}
        disableBackdropClick
        disableEscapeKeyDown
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" className={classes.title}>{title}</DialogTitle>
        <DialogContent className={classes.content}>
          <DialogContentText id="alert-dialog-description" className={classes.title}>
            {description}
          </DialogContentText>
        </DialogContent>
        <DialogActions className={classes.actions}>
          {(cancel.length > 0 && 
            <Button variant="contained" color="default" className={classes.btn} onClick={handleCancel}>
              {cancel}
            </Button>          
          )}
          <Button variant="contained" color="primary" className={classes.btn} autoFocus onClick={handleOK}>
            {ok}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
