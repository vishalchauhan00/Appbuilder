import { Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import PopupDialog from '../../components/PopupDialog';
import { useAppStore } from '../../store/appDataStore';


interface ResourceManagerProps {
  show: boolean;
  onCloseEditor: () => void;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({show, onCloseEditor}) => {

    const { projectData } = useAppStore();    
    const appImages:any[] = (projectData && projectData['images']) ? projectData['images'] : [];
    console.info("app Images >>>", appImages);
    const appVideos:any[] = (projectData && projectData['videos']) ? projectData['videos'] : [];
    console.info("app Videos >>>", appVideos);
    const appAudios:any[] = (projectData && projectData['bgms']) ? projectData['bgms'] : [];
    console.info("app Audios >>>", appAudios);
    const appSounds:any[] = (projectData && projectData['soundeffects']) ? projectData['soundeffects'] : [];
    console.info("app Sounds >>>", appSounds);

    const handleCloseEditor = () => {
        onCloseEditor();
    };

    return (
        <PopupDialog
            open={show}
            onClose={handleCloseEditor}
            dialogTitle={
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <Typography variant="h6">Resource Manager</Typography>
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

export default ResourceManager;