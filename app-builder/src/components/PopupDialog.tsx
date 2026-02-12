import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';

import type { DialogProps } from '@mui/material';

interface PopupDialogProps extends DialogProps {
  open: boolean;
  onClose: () => void;
  dialogTitle?: React.ReactNode;
  children?: React.ReactNode;         // content body
  actions?: React.ReactNode;          // bottom actions
}

const PopupDialog: React.FC<PopupDialogProps> = ({
  open,
  onClose,
  dialogTitle,
  children,
  actions,
  ...rest
}) => {
  const theme = useTheme();

  return (
    <Dialog maxWidth="md"
      open={open}
      onClose={onClose}
      slotProps={{
            paper: {
              sx: {
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  borderRadius: 2,
              },
            },
      }}
      {...rest}
    >
      {dialogTitle && 
        <DialogTitle sx={{px:2, py:1, borderBottom:'1px solid'}}>{dialogTitle}</DialogTitle>
      }
      {children && 
        <DialogContent sx={{mt:2}}>{children}</DialogContent>
      }
      {actions && 
        <DialogActions>{actions}</DialogActions>
      }
    </Dialog>
  );
};

export default PopupDialog;
