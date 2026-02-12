import React, { useState, useEffect } from 'react';
import { Box, Button, FormControlLabel, IconButton, Paper, Radio, Switch, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
  PhoneAndroid as MobileIcon,
  Computer as DesktopIcon,
  Tablet as TabletIcon
} from '@mui/icons-material';

import PopupDialog from '../../components/PopupDialog';
import { useAppStore } from '../../store/appDataStore';
import DeviceSelector from './DeviceSelector';
import type { DeviceConfig }  from './DeviceSelector';


interface ScreenManagerProps {
  show: boolean;
  onCloseEditor: () => void;
}

const ScreenManager: React.FC<ScreenManagerProps> = ({show, onCloseEditor}) => {

    const [editMode, setEditMode] = useState(false);
    const [selectedScreen, setSelectedScreen] = useState<DeviceConfig[]>([]);
 
    const [initialScreens, setScreens] = useState<DeviceConfig[]>([
        { type: 'mobile', selected: false, dimensions: { width: 375, height: 667 }, embed: false },
        { type: 'desktop', selected: false, dimensions: { width: 1366, height: 768 }, embed: false },
        { type: 'tablet', selected: false, dimensions: { width: 768, height: 1024 }, embed: false },
    ]);

    const { projectData } = useAppStore();    
    const isMasterScreenSet:boolean = (projectData && projectData['isMasterScreenSet']) ? projectData['isMasterScreenSet'] : false;
    const [masterslaveEnabled, setMasterSlaveEnabled] = useState(isMasterScreenSet);
 

    const availableScreens:any[] = (projectData && projectData['availableScreens']) ? projectData['availableScreens'] : [];

    useEffect(() => {
        if (!availableScreens.length) return;

        const updatedScreens = initialScreens.map((scr) => {
            const match = availableScreens.find((screen: any) =>
                (screen.Platform === 'Desktop' && scr.type === 'desktop') ||
                ((screen.Platform === 'iOS' || screen.Platform === 'Android') && scr.type === 'mobile')
            );

            return match
                ? {
                    ...scr,
                    selected: true,
                    dimensions: { width: match.width, height: match.height },
                    embed: match.embed
                }
                : scr;
        });

        const filteredScr:DeviceConfig[] = updatedScreens.filter((screen: any) => screen.selected === true);
        setSelectedScreen(filteredScr); 

        setScreens(updatedScreens);
        //console.info('Updated Screens >>>', updatedScreens);
      }, [availableScreens]);


    const getDeviceIcon = (type: 'mobile' | 'desktop' | 'tablet') => {
        const iconProps = { sx: { fontSize: 64 } };
        switch (type) {
          case 'mobile':
            return <MobileIcon {...iconProps} />;
          case 'desktop':
            return <DesktopIcon {...iconProps} />;
          case 'tablet':
            return <TabletIcon {...iconProps} />;
          default:
            return null;
        }
    };
    
    const getDeviceLabel = (type: 'mobile' | 'desktop' | 'tablet') => {
        switch (type) {
          case 'mobile':
            return 'Mobile';
          case 'desktop':
            return 'Desktop';
          case 'tablet':
            return 'Tablet';
          default:
            return '';
        }
    };

    const handleMasterSlaveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Master-Slave enabled', event.target.checked);
        setMasterSlaveEnabled(event.target.checked);
    }

    const handleMasterScreenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedType = event.target.value; // e.g. "mobile"

        // Update which device is "embed" true
        const updated = selectedScreen.map((device) => ({
                ...device,
                embed: device.type === selectedType,
            })
        );

        setSelectedScreen(updated);
        console.info('Selected screen type:', selectedType);
    };

    const handleCloseEditor = () => {
        onCloseEditor();
    };

     const handleSelectionChange = (devices: DeviceConfig[]) => {
        console.log('Selected devices:', devices);
    };


    return (
        <PopupDialog
            open={show}
            onClose={handleCloseEditor}
            dialogTitle={
                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <Typography variant="h6">Screen Manager</Typography>
                    <IconButton aria-label="Close" onClick={handleCloseEditor}>
                        <CloseIcon />
                    </IconButton>
                </div>
            }
            children={
                <>
                    {!editMode && (
                        <Box sx={{ minWidth: 400}}>        
                            {selectedScreen.length > 0 && (
                                <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                                    <FormControlLabel style={{margin:0}} label="Master-Slave enabled" disabled={false}
                                        control={<Switch color="primary" checked={masterslaveEnabled} onChange={(e) => handleMasterSlaveChange(e)} />}  
                                    /> 
                                </Paper>                           
                            )}
                            {selectedScreen.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Selected Screen(s)
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, flexDirection: 'column' }}>
                                        {selectedScreen.map((device) => (
                                            <Box
                                                key={device.type}
                                                sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    p: 1,
                                                    border: 1,
                                                    borderColor: 'primary.main',
                                                    borderRadius: 1,
                                                    bgcolor: 'primary.50'
                                                }}
                                            >
                                                <Radio
                                                    name="deviceSelector" // same group
                                                    value={device.type}    // identifies the clicked one
                                                    checked={device.embed}
                                                    onChange={handleMasterScreenChange}
                                                />
                                                {getDeviceIcon(device.type)}
                                                <Typography variant="body2">
                                                    {getDeviceLabel(device.type)} ({device.dimensions.width}×{device.dimensions.height})
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}                        
                            
                            <Paper elevation={0} sx={{ p: 2, mb: 2, textAlign: 'center', backgroundColor:'transparent' }}>
                                <Button sx={{textTransform:'none'}} variant='outlined'
                                    onClick={() => setEditMode(true)}
                                >
                                    Configure
                                </Button>
                            </Paper>
                        </Box>
                
                    )}
                    {editMode && (
                        <DeviceSelector initialDevices={initialScreens} onSelectionChange={handleSelectionChange} onCloseEditor={handleCloseEditor} />
                    )}
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
};

export default ScreenManager;