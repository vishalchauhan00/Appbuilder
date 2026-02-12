import React, { useState } from 'react';
import { Box, Button, Checkbox, Divider, FormControlLabel, FormGroup, Paper, Popover, Radio, Stack, Tab, Tabs, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {  
  Settings,
  Save
} from "@mui/icons-material";

import { useAppStore } from '../../store/appDataStore';
import { usePageStore } from '../../store/appPageStore';
import EditorView from './EditorView';
import ThemedToggleButton from '../../components/ThemedToggleButton';

interface PagesViewProps {
  onClosePagesView: (id: string) => void;
}

const PagesView: React.FC<PagesViewProps> = ({onClosePagesView}) => {
    const { projectData } = useAppStore();    
    const screenData:any[] = projectData?.['availableScreens'];

    const { pagelistData, openedPages, activePageId, setActivePage } = usePageStore();
    //console.info(activePageId, ">>>>>>>>", openedPages, ".....pagelistData >>>", pagelistData);
    
    const [screenindex, setScreenIndex] = useState<number>(0);    
    const [masterslave, setPageMasterSlave] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState(0);

    /*const handleCloseLayout = (event: React.MouseEvent<HTMLButtonElement>) => {
        const currentPageId = event.currentTarget.dataset?.id || selectedPageId;
        onClosePagesView(currentPageId);
    };*/        

    const handleCloseTab = (pageid: string, index: number) => {
        //removeOpenedPage(pageid);
        onClosePagesView(pageid);

        if (index === activeTab && activeTab > 0) {
            setActiveTab(activeTab - 1);
        }
    };

    const [anchorSettingsEl, setSettingsAnchorEl] = React.useState<HTMLElement | null>(null);
    const openSettings:boolean = Boolean(anchorSettingsEl);

    const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
        const activePageData = pagelistData?.[activePageId];
        const pageScreenIndex = activePageData['_selectedScreenIndex']; 
        setScreenIndex(pageScreenIndex);
        const pagemasterslave = activePageData['_pagemasterslave'];
        setPageMasterSlave(pagemasterslave);

        setSettingsAnchorEl(event.currentTarget);
    };

    const handleScreenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedIndex = Number(event.target.value);
        setScreenIndex(selectedIndex);

        const activePageData = pagelistData?.[activePageId];
        activePageData['_selectedScreenIndex'] = selectedIndex;        
    };

    const handleMasterSlaveChange = () => {
        setPageMasterSlave(!masterslave);

        const activePageData = pagelistData?.[activePageId];
        activePageData['_pagemasterslave'] = !masterslave;
    };

    return (
        <Paper elevation={3} 
            sx={{
                    p:0, width:'calc(100% - 60px)', height:'calc(100% - 48px)', overflow:'hidden', 
                    display:'flex', flexDirection:'column', bgcolor:'background.paper',
                    position:'absolute', top:48, left:60,
                }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: 44, mt: 0.25 }}>
                <Tabs
                    value={activePageId}
                    onChange={(_, v) => setActivePage(v)}
                    variant="scrollable"
                    scrollButtons="auto"                
                    sx={{
                        minHeight: 40,
                        width: '90%',
                    }}
                >
                    {openedPages.map((pageid, index) => (
                        <Tab
                            key={pageid}
                            value={pageid}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    {getPageTitle(pageid, pagelistData)}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CloseIcon
                                            fontSize="small"
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevent switching tab on close click
                                                handleCloseTab(pageid, index);
                                            }}
                                        />
                                        <Divider key={`divider-${pageid}`} orientation="vertical" flexItem 
                                            sx={{
                                                borderColor: 'primary.main',     // changes color
                                                borderRightWidth: 2,                     // vertical spacing
                                            }}
                                        />
                                    </Box>
                                </Box>
                            }
                            sx={{ 
                                    minHeight: 40, minWidth: 120, p: 0, textTransform:'none', paddingLeft: '8px', 
                                    bgcolor: 'background.paper', 
                                }}
                        />
                        
                    ))}
                </Tabs>
                <Stack direction='row' spacing={1.5} sx={{ mr: 4, border: '1px solid #ccc', borderRadius: 4, px: 1.5, py: 0.5 }}>
                    <Tooltip title="Save current page">
                        <ThemedToggleButton value="Save" sx={{ width: 28, height: 28 }} >
                            <Save />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Tooltip title="Settings">
                        <ThemedToggleButton value="Settings" sx={{ width: 28, height: 28 }} onClick={handleSettingsOpen} >
                            <Settings />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Popover
                        open={openSettings}
                        anchorEl={anchorSettingsEl}
                        onClose={() => setSettingsAnchorEl(null)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'center',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        slotProps={{
                            paper: {sx:{ borderRadius:1, mt:0.5, width: 250 } }
                        }}
                    >
                        {screenData.length > 1 &&
                            <Stack sx={{ p: 0.5, m: 0.5, display: 'flex', flexDirection: 'column', border: '1px solid #90caf9', borderRadius: 1 }} spacing={0.5}>
                                <FormGroup sx={{ p: 0.5, display: 'flex', flexDirection: 'column', gap: 0 }}>
                                    {screenData.map((screen:any, index:number) => (
                                        <FormControlLabel
                                            key={screen.Platform}
                                            sx={{ height: 32, ml: 0 }}
                                            control={<Radio size='small' sx={{ p: 0.5 }} checked={index === screenindex} value={index} onChange={handleScreenChange} />}
                                            label={getScreenDetail(screen)}
                                        />
                                    ))}
                                </FormGroup>
                                <FormControlLabel
                                    sx={{ height: 32, ml: 0 }}
                                    control={<Checkbox size='small' sx={{ p: 0.5 }} checked={masterslave} onChange={handleMasterSlaveChange} />}
                                    label="Keep Master-Slave relation"
                                />
                            </Stack>
                        }
                        <Button variant='outlined'
                                sx={{ width: '-webkit-fill-available', minWidth: 100, textTransform: 'none', m:0.5}}
                                onClick={() => setSettingsAnchorEl(null)}
                        >
                            Validate Page
                        </Button>
                        <Button variant='outlined'
                                sx={{ width: '-webkit-fill-available', minWidth: 100, textTransform: 'none', m:0.5}}
                                onClick={() => setSettingsAnchorEl(null)}
                        >
                            Copy Page-Parts
                        </Button>
                    </Popover>
                </Stack>
            </Box>
            <EditorView/>
        </Paper>
    )
};

function getPageTitle(pageid:string, pagelist:any) {
    if(pagelist[pageid] === undefined) return '';
    return pagelist[pageid]['Title']; 
}

function getScreenDetail(screen:any) {
    const screenMap: Record<string, string> = {
        iOS: 'Mobile',
        Android: 'Mobile'
    };

    const platform = screenMap[screen.Platform] || screen.Platform;
    const dimensions = `${screen.width} x ${screen.height}`;

    return platform + ' (' + dimensions + ')';
}

export default PagesView;