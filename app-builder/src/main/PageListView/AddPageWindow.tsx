import React from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

export interface AddPageProps {
    onSubmit: (pagename : string) => void;
    onClose: () => void; 
}

const AddPageWindow: React.FC<AddPageProps> = ({ onSubmit, onClose }) => {

    const [pagetitle, setpagetitle] = React.useState<string>('');
    const [showError, setShowError] = React.useState<boolean>(false);

    function handleTitleFocus() {
        setShowError(false);
    }

    const handleSetTitle = (event: React.ChangeEvent<HTMLInputElement>) => {

      const val = event.target.value;
      //console.log(filterlist, pagetitle, "... handleFindPage >>>", val);
      if(val.length > 0) {
          const allowedChars = /\w/g;
          let allowedTitle = val.match(allowedChars);
          if(!allowedTitle) {
              setShowError(true);              
              return;
          }
          if(allowedTitle && (val.length !== allowedTitle.length)) {
              setShowError(true);
              return;
          }
          
          setpagetitle(val);

      }else {
          setShowError(true);
          setpagetitle('');
      }
    };

    const handleSubmitAddPage = () => {
        if(pagetitle.length === 0){
            setShowError(true);
            return;
        }
        onSubmit(pagetitle);
        onClose();
    };

    const handleCloseAddPage = () => {
        setpagetitle('');
        setShowError(false);

        onClose();
    }

    return (
        <Box 
            sx={{ 
                    p: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2,                    
                }}
        >
          <TextField sx={{ m:0, mt: 1}}
                id="newpagetitle" name="pagetitle" required fullWidth autoFocus                                    
                label="Set Page Title" value={pagetitle}
                helperText="Only alphabets, numbers & underscore allowed." error={showError}                                     
                margin="normal" variant="outlined"
                onChange={handleSetTitle} onFocus={handleTitleFocus}/>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }} >
            <IconButton aria-label="add page" sx={{border: '1px solid #666666'}} onClick={handleSubmitAddPage}>
                <CheckIcon />
            </IconButton>
            <IconButton aria-label="Close window" sx={{border: '1px solid #666666'}} onClick={handleCloseAddPage}>
                <CloseIcon />
            </IconButton>
          </Box>
          
        </Box>
    );

};

export default AddPageWindow;
