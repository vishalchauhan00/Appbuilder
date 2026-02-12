import React from 'react';

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  Paper,
  ListItemIcon,
  Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

import { useAppComponentStore } from '../store/appComponentStore';

interface ProjectDetailsProps {
  open?: boolean; // optional override
  data: Record<string, any>; // or use a proper ProjectData interface
  onClose: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ data, onClose }) => {
    const ulmargin: React.CSSProperties = {
        margin: '16px',
        marginTop: '8px',
        padding: '8px 32px',
        border: '2px solid rgb(227,227,227)',
        borderRadius: '8px',
        boxShadow: '-4px 4px 4px 0px rgb(227,227,227)',
        fontSize: '14px'
    };
    const limargin: React.CSSProperties = {
        marginBottom: 8,
    };

    const { addComponent } = useAppComponentStore();
    const [selectedAppFunction, setSelectedFunction] = React.useState('');
    const handleAppFunctionsClick = (value: string) => {
        console.info("handleAppFunctionsClick ...", value),
        setSelectedFunction(value);

        toggleAppFunction(value);
    };

    const toggleAppFunction = (panel: string) => {
        //setOpenComponent(selectedAppFunction === panel ? null : panel);
        addComponent(selectedAppFunction === panel ? '' : panel);
    };


    const [openOptions, setOpenOptions] = React.useState(false);
    const handleOptions = () => {
        setOpenOptions(!openOptions);
        if(!openOptions)    setSelectedFunction('options');
        else{
            setSelectedFunction('');
        }
    };

    const [checked, setChecked] = React.useState(['']);
    const handleEnableOptions = (value: string) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
        setSelectedFunction('');
    };

    
    return (
        <Drawer anchor="left" open={true} onClose={onClose}>
            <Box sx={{ width: 400, px: 0, py: 0.75 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{marginLeft: 2}}>Project Detail</Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ my: 0, backgroundColor:'#1976d2' }} />

                <Paper elevation={9}>
                    <List
                        sx={{ width: '100%', bgcolor: 'background.paper' }}
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                    >                        
                        <ul style={ulmargin} key={data.projectid}>
                            <li style={limargin} ><strong>Project Id: </strong>{data.projectid}</li>
                            <li style={limargin} ><strong>Title: </strong>{data.Title}</li>
                            <li style={limargin} ><strong>Name: </strong>{data.ProjectName}</li>
                            <li style={limargin} ><strong>Owner: </strong>{data.owner}</li>
                            <li style={limargin} ><strong>Version: </strong>{data.version}</li>
                            <li style={limargin} ><strong>Created at: </strong>{data.createddatetime}</li>
                        </ul>
                        
                        <ListItemButton sx={{ py: 0.5, pl: 4 }} selected={selectedAppFunction === 'validation'}
                                onClick={() => handleAppFunctionsClick('validation')}>
                            <ListItemText primary="Project Validation" />
                            <ListItemIcon>
                                <ChevronRightIcon/>
                            </ListItemIcon>
                        </ListItemButton>                                
                        <ListItemButton sx={{ py: 0.5, pl: 4 }} selected={selectedAppFunction === 'resources'}
                                onClick={() => handleAppFunctionsClick('resources')}>
                            <ListItemText primary="Resources" />
                            <ListItemIcon>
                                <ChevronRightIcon/>
                            </ListItemIcon>
                        </ListItemButton>
                        <ListItemButton sx={{ py: 0.5, pl: 4 }} selected={selectedAppFunction === 'database'}
                                onClick={() => handleAppFunctionsClick('database')}>
                            <ListItemText primary="Database" />
                            <ListItemIcon>
                                <ChevronRightIcon/>
                            </ListItemIcon>
                        </ListItemButton>
                        <ListItemButton sx={{ py: 0.5, pl: 4 }} selected={selectedAppFunction === 'screens'}
                                onClick={() => handleAppFunctionsClick('screens')}>
                            <ListItemText primary="Screens" />
                            <ListItemIcon>
                                <ChevronRightIcon/>
                            </ListItemIcon>
                        </ListItemButton>
                        <ListItemButton sx={{ py: 0.5, pl: 4 }} selected={selectedAppFunction === 'variables'}
                                onClick={() => handleAppFunctionsClick('variables')}>
                            <ListItemText primary="Project Variables" />
                            <ListItemIcon>
                                <ChevronRightIcon/>
                            </ListItemIcon>
                        </ListItemButton>
                        <ListItemButton sx={{ py: 0.5, pl: 4 }} selected={selectedAppFunction === 'options'}
                                 onClick={handleOptions}>
                            <ListItemText primary="Options" />
                            <ListItemIcon>
                                {openOptions ? <ExpandLess /> : <ExpandMore />}
                            </ListItemIcon>
                        </ListItemButton>
                        <Collapse in={openOptions} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ px: 2 }}>
                                <ListItemButton sx={{ height: 40 }} selected={selectedAppFunction === 'priority'}
                                        onClick={() => handleAppFunctionsClick('priority')}>
                                    <ListItemText primary="Priority Modules" />
                                    <ListItemIcon>
                                        <ChevronRightIcon/>
                                    </ListItemIcon>
                                </ListItemButton>
                                <ListItemButton sx={{ height: 40 }} onClick={handleEnableOptions('autosave')}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={checked.includes('autosave')}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary="Enable Auto Saving" />
                                </ListItemButton>
                                <ListItemButton sx={{ height: 40 }} onClick={handleEnableOptions('isGASet')}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={checked.includes('isGASet')}
                                            tabIndex={-1}
                                            disableRipple
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary="Enable Google Analytics" />
                                </ListItemButton>
                            </List>
                        </Collapse>
                    </List>
                </Paper>
            </Box>
        </Drawer>
    );
};

export default ProjectDetails;