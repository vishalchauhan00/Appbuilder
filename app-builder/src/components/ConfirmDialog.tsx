import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  cancelTitle?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, onClose, onConfirm, title, message, cancelTitle = 'Cancel' }) => {
  return (
    <Dialog open={open} onClose={onClose} sx={{ minWidth: '320px' }}>
      {title && (
        <DialogTitle sx={{ fontSize: '1rem', textAlign: 'left', paddingBottom: 1, borderBottom: '1px solid' }}>
          {title}
        </DialogTitle>
      )}
      <DialogContent>
        <Typography sx={{ textAlign: 'center', mt: 1 }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
        <Button onClick={onClose} variant="contained" color="primary" sx={{ textTransform: 'none'}}>
          {cancelTitle}
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary" sx={{ textTransform: 'none'}}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;