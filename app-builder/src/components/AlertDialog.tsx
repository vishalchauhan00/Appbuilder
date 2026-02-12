import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ open, onClose, title, message }) => {
  return (
    <Dialog open={open} onClose={onClose} sx={{minWidth: '320px'}}>
      {title && (
        <DialogTitle sx={{ fontSize: '1rem', textAlign: 'left', paddingBottom: 1, borderBottom: '1px solid' }}>
        {title}
        </DialogTitle>
      )}
      <DialogContent>
        <Typography sx={{ textAlign: 'center', mt: 1 }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
