import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Paper,
  Button
} from '@mui/material';
import {
  PhoneAndroid as MobileIcon,
  Computer as DesktopIcon,
  Tablet as TabletIcon
} from '@mui/icons-material';
import ConfirmDialog from '../../components/ConfirmDialog';

export interface DeviceDimensions {
  width: number;
  height: number;
}

export interface DeviceConfig {
  type: 'mobile' | 'desktop' | 'tablet';
  selected: boolean;
  dimensions: DeviceDimensions;
  embed: boolean;
}

export interface DeviceSelectorProps {
  onSelectionChange?: (devices: DeviceConfig[]) => void;
  initialDevices?: DeviceConfig[];
  onCloseEditor?: () => void;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  onSelectionChange,
  initialDevices,
  onCloseEditor
}) => {

  const [devices, setDevices] = useState<DeviceConfig[]>(initialDevices || []);

  const [confirmUpdate, showConfirmUpdate] = useState(false);

  // Load from localStorage on component mount
  useEffect(() => {
    const savedDevices = localStorage.getItem('deviceSelector');
    if (savedDevices) {
      try {
        const parsedDevices = JSON.parse(savedDevices);
        setDevices(parsedDevices);
      } catch (error) {
        console.error('Error parsing saved devices:', error);
      }
    } else if (initialDevices) {
      setDevices(initialDevices);
    }
  }, [initialDevices]);

  // Save to localStorage whenever devices change
  useEffect(() => {
    //localStorage.setItem('deviceSelector', JSON.stringify(devices));
    onSelectionChange?.(devices);
  }, [devices, onSelectionChange]);

  const handleDeviceToggle = (deviceType: 'mobile' | 'desktop' | 'tablet') => {
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.type === deviceType
          ? { ...device, selected: !device.selected }
          : device
      )
    );
  };

  const handleDimensionChange = (
    deviceType: 'mobile' | 'desktop' | 'tablet',
    dimension: 'width' | 'height',
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    setDevices(prevDevices =>
      prevDevices.map(device =>
        device.type === deviceType
          ? {
              ...device,
              dimensions: {
                ...device.dimensions,
                [dimension]: numValue
              }
            }
          : device
      )
    );
  };

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

  const selectedDevices = devices.filter(device => device.selected); 

  const handleScreensUpdate = () => {
     console.log(devices, "selectedDevices>>>>>>>",selectedDevices);
     showConfirmUpdate(false);
     onCloseEditor?.();
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 0 }}>

      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Configure Screen
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {devices.map((device) => (
            <Card
              key={device.type}
              sx={{
                cursor: 'pointer',
                border: device.selected ? 2 : 1,
                borderColor: device.selected ? 'primary.main' : 'divider',
                minWidth: 200,
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: 4
                }
              }}
              onClick={() => handleDeviceToggle(device.type)}
            >
              <CardContent sx={{ textAlign: 'start', px: 2, py: '8px !important' }} >
                 <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}} >
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ m: 0 }}>{getDeviceIcon(device.type)}</Box>
                    <Typography>{getDeviceLabel(device.type)}</Typography>
                  </Box>
                  
                  <Box 
                    sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        opacity: !(device.selected) ? 0.3 : 1,          // dimmed when disabled
                        pointerEvents: !(device.selected) ? 'none' : 'auto', // block interaction
                      }}
                  >
                      <TextField
                        label="Width (px)"
                        type="number"
                        value={device.dimensions.width}
                        onChange={(e) =>
                          handleDimensionChange(device.type, 'width', e.target.value)
                        }
                        size="small"
                        sx={{ minWidth: 120 }}
                        inputProps={{ min: 1 }}
                      />
                      <TextField
                        label="Height (px)"
                        type="number"
                        value={device.dimensions.height}
                        onChange={(e) =>
                          handleDimensionChange(device.type, 'height', e.target.value)
                        }
                        size="small"
                        sx={{ minWidth: 120 }}
                        inputProps={{ min: 1 }}
                      />
                    </Box> 
                  </Box>             
              </CardContent>
            </Card>
          ))}
        </Box>
        
        <Paper elevation={0} sx={{ mt: 2, p: 1, textAlign: 'center', backgroundColor: 'transparent' }}>
            <Button sx={{textTransform:'none', mr:1}} variant='outlined'
                onClick={() => onCloseEditor?.()}
            >
                Cancel
            </Button>
            <Button sx={{textTransform:'none', ml:1}} variant='outlined'
                onClick={() => showConfirmUpdate(true)}
            >
                Update
            </Button>
        </Paper>
      </Paper>

      {confirmUpdate && (
        <ConfirmDialog 
          open={confirmUpdate}
          onClose={() => showConfirmUpdate(false)}
          onConfirm={handleScreensUpdate}
          title="Confirmation"
          message="Are you sure to set these configurations?"
        />
        
      )}
      
    </Box>
  );
};

export default DeviceSelector;