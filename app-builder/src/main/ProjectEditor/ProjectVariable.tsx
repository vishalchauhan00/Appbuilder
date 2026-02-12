import React from 'react';
import PopupDialog from '../../components/PopupDialog';
import { Button, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { useAppStore } from '../../store/appDataStore';
import { helpTextBoxSx } from './styles';

interface ProjectVariableProps {
  show: boolean;
  onCloseEditor: () => void;
}

const ProjectVariable: React.FC<ProjectVariableProps> = ({show, onCloseEditor}) => {
    const dblist: React.CSSProperties = {
        width: '420px',
        maxHeight: '250px',
        padding: 0, 
        overflow: 'auto',
        background: 'background.default',
    };
    const dbtableitem: React.CSSProperties = {
        border: '1px solid',
        background: 'background.paper',
    };
    const addicon: React.CSSProperties = {
        width: '48px',
        height: '48px',
        background: 'background.paper',
        border: '1px solid lightgrey',
    };

    const { projectData } = useAppStore();    
    const appVariables:any[] = (projectData && projectData['appVariables']) ? projectData['appVariables'] : [];
    console.info("ProjectVariable >>>", appVariables);

    const handleCloseEditor = () => {
        onCloseEditor();
    };

    const [collapseDBs, setCollapseDBs] = React.useState('');    
    function handleExpandCollapseFields(event: React.MouseEvent<HTMLDivElement>) {
        const dataset = event.currentTarget.dataset;
        const _tablename: string = dataset?.name ?? '';
        
        let strTable = collapseDBs;      
        strTable = setCollapseDBTables(strTable, _tablename);
        setCollapseDBs(strTable);
    }
    
        

    return (
        <PopupDialog
            open={show}
            onClose={handleCloseEditor}
            dialogTitle={
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <Typography variant="h6">Project Variables</Typography>
                    <IconButton aria-label="Close" onClick={handleCloseEditor}>
                        <CloseIcon />
                    </IconButton>
                </div>
            }
            children={
                <>
                    {(projectData && !(projectData.isProjectRoleOwner)) && 
                        <Typography variant="body2" gutterBottom sx={{ ...helpTextBoxSx, display:'none' }}>
                            A contributor is not allowed to update
                        </Typography>
                    }
                    {(projectData && (projectData.isContributorWorking && projectData.isProjectRoleOwner)) && 
                        <Typography variant="body2" gutterBottom sx={{ ...helpTextBoxSx, display:'none' }}>
                            Since contributor(s) is/are working on project. So any update not allowed.                            
                        </Typography>
                    }
                    <div style={{display:'flex'}}>
                        {appVariables.length === 0 && 
                            <Typography variant="body2" gutterBottom sx={{ ...helpTextBoxSx, marginRight:1 }}>
                                No variables yet.
                            </Typography>
                        }
                        {appVariables.length > 0 && 
                            <List component="nav" dense={true} style={dblist} >
                                {appVariables.map((item, index) =>  (
                                    <div key={index} style={{marginBottom:2}}>
                                        <ListItemButton style={dbtableitem} data-name={item.key} 
                                                onClick={handleExpandCollapseFields}>
                                            <ListItemText style={{margin:0}} primary={item.key +': '+item.value}></ListItemText>
                                            <ListItemIcon>
                                                <IconButton edge="end" aria-label="Edit" data-index={index} data-key={item.key}
                                                            onClick={handleCloseEditor}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton edge="end" aria-label="Delete" data-index={index} data-key={item.key} 
                                                            onClick={handleCloseEditor} >
                                                    <DeleteIcon/>
                                                </IconButton>
                                            </ListItemIcon> 
                                        </ListItemButton>
                                    </div>
                                ))}
                            </List>
                        }
                        <IconButton aria-label="Add" style={addicon} onClick={handleCloseEditor}>
                            <AddIcon />
                        </IconButton>
                    </div>
                </>
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


    function setCollapseDBTables(strTable:string, name:string){
        let _name = name +",";
        if(strTable.indexOf(name) > -1){
            strTable = strTable.replace(_name , "");
        }else{
            strTable += _name;
        }
    
        return strTable;
    }

};

export default ProjectVariable;