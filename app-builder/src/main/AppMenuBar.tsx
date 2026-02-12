import React from 'react';

import { useAppStore } from '../store/appDataStore';
import { useAppComponentStore } from '../store/appComponentStore';

import ThemedToggleButton from '../components/ThemedToggleButton';
import { AppBar, SvgIcon, Toolbar, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/ListAlt';

const AppMenuBar: React.FC = () => {
    const appMenubar: React.CSSProperties = {
        position: 'absolute',
        top: '48px',
        left: '0px'
    };
    const appBar: React.CSSProperties = {
        width: '60px',
        boxShadow: 'none',
        borderRight: '1px solid #cccccc'
    };
    const optionDiv: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '60px',
        height: 'calc(100vh - 96px)', 
    };
    const topIcon: React.CSSProperties = {
        width: 36, height: 36,
        padding: '2px',
        //border: '1px solid lightblue',
        borderRadius: '4px',
        marginBottom: '24px'
    };
    const bottomIcon: React.CSSProperties = {
        width: 36, height: 36,
        padding: '2px',
        borderRadius: '4px',
        marginTop: '24px'
    };
    
    const { projectData } = useAppStore();
    const isFigmaExist = (projectData && projectData.hasOwnProperty('figmaData')) ? true : false;
    const figmaIcon: React.CSSProperties = {
        ...topIcon,
        display: (isFigmaExist) ? 'block' : 'none'
    };
    const { openComponents, addComponent } = useAppComponentStore();

    const handleOpenPagelist = () => {
        toggleAppComponent('pagelist')
    }  

    const handleImportFigma = () => {
        console.info("Figma Click Handler .......");
        toggleAppComponent('importfigma')  
    }

    const handleStyleEditor = () => {
        console.info("Style Click Handler .......");
        toggleAppComponent('styleeditor')   
    }

    const handleShowAppSettings = () => {
        toggleAppComponent('appdetails')     
    }

    const toggleAppComponent = (panel: string) => {
        //setOpenComponent(openComponent === panel ? null : panel);
        addComponent(openComponents.includes(panel) ? '' : panel);
    };

  return (
    <div id="appMenuBar" style={appMenubar}>
      <AppBar position="static" color="default" style={appBar}>
        <Toolbar variant="dense" sx={{ 
            minWidth: 40,  
            py: '24px', // paddingY = paddingTop + paddingBottom
            px: { xs: 1, sm: '8px' }, // paddingX = left + right, applies from xs up
        }}>          
            <div style={optionDiv}>
                <div>
                    <Tooltip title="Open Page List">
                        <ThemedToggleButton aria-label="Open List" value="open" selected={openComponents.includes('pagelist')}
                            onChange={handleOpenPagelist} style={topIcon} >
                            <MenuIcon/>                            
                        </ThemedToggleButton >
                    </Tooltip>
                    <Tooltip title="Import Figma Pages">
                        <ThemedToggleButton aria-label="Import Figma Pages" value="importfigma" selected={openComponents.includes('importfigma')}
                            onChange={handleImportFigma} style={figmaIcon} >
                            <img alt="Import Figma" src="/src/assets/figma.png"                            
                                style={{ width: 24, height: 24 }}
                            />         
                        </ThemedToggleButton >
                    </Tooltip>
                    <Tooltip title="Style Editor">
                        <ThemedToggleButton aria-label="Style Editor" value="styleeditor" selected={openComponents.includes('styleeditor')}
                            onChange={handleStyleEditor} style={topIcon} >
                            <SvgIcon>
                                <path d="M16.24,11.51l1.57-1.57l-3.75-3.75l-1.57,1.57L8.35,3.63c-0.78-0.78-2.05-0.78-2.83,0l-1.9,1.9 c-0.78,0.78-0.78,2.05,0,2.83l4.13,4.13L3.15,17.1C3.05,17.2,3,17.32,3,17.46v3.04C3,20.78,3.22,21,3.5,21h3.04 c0.13,0,0.26-0.05,0.35-0.15l4.62-4.62l4.13,4.13c1.32,1.32,2.76,0.07,2.83,0l1.9-1.9c0.78-0.78,0.78-2.05,0-2.83L16.24,11.51z M9.18,11.07L5.04,6.94l1.89-1.9c0,0,0,0,0,0l1.27,1.27L7.73,6.8c-0.39,0.39-0.39,1.02,0,1.41c0.39,0.39,1.02,0.39,1.41,0 l0.48-0.48l1.45,1.45L9.18,11.07z M17.06,18.96l-4.13-4.13l1.9-1.9l1.45,1.45l-0.48,0.48c-0.39,0.39-0.39,1.02,0,1.41 c0.39,0.39,1.02,0.39,1.41,0l0.48-0.48l1.27,1.27L17.06,18.96z"/><path d="M20.71,7.04c0.39-0.39,0.39-1.02,0-1.41l-2.34-2.34c-0.47-0.47-1.12-0.29-1.41,0l-1.83,1.83l3.75,3.75L20.71,7.04z"/>
                            </SvgIcon>         
                        </ThemedToggleButton >
                    </Tooltip>
                </div>
                <div>
                    <Tooltip title="App Settings">
                        <ThemedToggleButton aria-label="Setting" value="settings" selected={openComponents.includes('appdetails')} 
                            onChange={handleShowAppSettings} style={bottomIcon} >
                            <SvgIcon>
                                <path transform="scale(1.2, 1.2)" fill="none" d="M0 0h20v20H0V0z"></path><path transform="scale(1.2, 1.2)" d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"></path>
                            </SvgIcon>                
                        </ThemedToggleButton >
                    </Tooltip>
                </div>
            </div>          
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default AppMenuBar;