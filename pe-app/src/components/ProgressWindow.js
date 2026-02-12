import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
      },
    progress: {
      margin: theme.spacing(2),
    },
}));

export default function ProgressWindow(props) {

    const message = props.message;
    const [open, setOpen] = React.useState(props.open);
    
    function handleClose() {
        setOpen(false);
    }

    const classes = useStyles();

    return (              
        <Dialog open={open} 
                onClose={handleClose}
                aria-labelledby="progress-dialog-title"
                fullWidth={false} maxWidth="xs" >             
            <DialogContent>
                <div id="progress" className={classes.root}>  
                    <CircularProgress className={classes.progress} color="primary" />
                    <DialogContentText id="alert-dialog-description">
                        {message}
                    </DialogContentText>
                </div>                   
            </DialogContent>              
        </Dialog>        
    );
}
