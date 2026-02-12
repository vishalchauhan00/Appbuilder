import { Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import PopupDialog from '../../components/PopupDialog';
import { useAppStore } from '../../store/appDataStore';


interface ProjectValidationProps {
  show: boolean;
  onCloseEditor: () => void;
}

const ProjectValidation: React.FC<ProjectValidationProps> = ({show, onCloseEditor}) => {

    const { projectData } = useAppStore();    
    console.info("projectData >>>", projectData);

    const handleCloseEditor = () => {
        onCloseEditor();
    };

    return (
        <PopupDialog
            open={show}
            onClose={handleCloseEditor}
            dialogTitle={
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <Typography variant="h6">Project Validation</Typography>
                    <IconButton aria-label="Close" onClick={handleCloseEditor}>
                        <CloseIcon />
                    </IconButton>
                </div>
            }
            children={
                <></>
            }
            actions={
                <>
                    <Button sx={{textTransform:'none'}}
                        onClick={() => {
                            handleCloseEditor()                            
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Close
                    </Button>
                </>
            }
        />
    )
};

export default ProjectValidation;