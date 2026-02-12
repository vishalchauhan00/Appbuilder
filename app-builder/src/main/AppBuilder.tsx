import React from 'react';
import { useState, useEffect } from 'react';
import { useAppStore } from '../store/appDataStore';
import { useInitConfig, useInitProject } from '../hooks/useAppInit';
import { useThemeStore } from '../store/appThemeStore';
import type { ThemeState } from '../store/appThemeStore';
import { AppBar, Button, IconButton, SvgIcon, Toolbar, Tooltip } from '@mui/material';
import PreviewIcon from '@mui/icons-material/Preview';
import LocaleIcon from '@mui/icons-material/Language';
import HelpIcon from '@mui/icons-material/Help';

import logo from '../assets/mobicon.png';
import AppData from './AppData';
import AlertDialog from '../components/AlertDialog';
import AppEditor from './AppEditor';

const AppBuilder: React.FC = () => {
  sessionStorage.clear();

  const { isConfigReady } = useInitConfig();   
  const { credentials, config, error, loadProject } = useAppStore();

  useInitProject(isConfigReady, config, credentials);

  const [showAlert, setShowAlert] = useState(false);
  useEffect(() => {
    if (error) {
      setShowAlert(true);
    }
  }, [error]);

  if (error) { 
    return (
      <>
        <AppHeader />
        <div className="backdropStyle">
          <AlertDialog
            open={showAlert}
            onClose={() => setShowAlert(false)}
            title="App Loading Error"
            message={error?.message || 'Something went wrong.'}
          />
        </div>
      </>
    );
  }

  if (!credentials?.projectid) {
    return (
      <>
        <AppHeader />
      </>
    );
  }

  if (loadProject) {
    return (
      <div className="no-selection">
        <AppHeader />
        <AppData />
        <AppEditor />
      </div>
    );
  }

  return <AppHeader />;
};


const AppHeader: React.FC = () => {
  const appBar: React.CSSProperties = {
    height: 48, 
    width: '100vw', 
    boxShadow: 'none',
    borderBottom: '2px solid #cccccc'
  };
  const outerDiv: React.CSSProperties = {
    flexGrow: 1, 
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48
  };
  const optionDiv: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
  };
  const squareIcon: React.CSSProperties = {
    padding: '2px',
    marginRight: '8px',
    border: '1px solid lightblue',
    borderRadius: '2px',
  };

  const mode = useThemeStore((state: ThemeState) => state.mode);
  const toggleTheme = useThemeStore((state: ThemeState) => state.toggleTheme);
  
  const handleThemeClick = () => {
    toggleTheme();
  }  
  const handleLocaleClick = () => {
    console.info("Locale Click Handler .......");
  }
  const handleHelpClick = () => {
    window.open("https://newhelp.mobilous.com/index.html");
  }

  return (
    <div id="AppHeader" className='defaultAppbar'>
      <AppBar position="static" color="default" style={appBar}>
        <Toolbar variant="dense" sx={{ minHeight: 40, paddingLeft: { xs: '8px', sm: '8px' }, }}>
          <div style={outerDiv}>
            <img className="App-logo" src={logo} alt="logo" width="40px" height="40px" />
            <div style={optionDiv}>
              <Button variant='outlined' startIcon={<PreviewIcon />}
                  sx={{ minWidth: 100, height: 30, textTransform: 'none', m:0, mr: 1}}
              >
                  Preview
              </Button>
              <Tooltip title={`Toggle theme (Current: ${mode})`}>
                <IconButton edge="end" color="primary" style={squareIcon} aria-label="Theme" 
                    onClick={handleThemeClick}>
                  <SvgIcon>
                    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path>
                  </SvgIcon>                            
                </IconButton>
              </Tooltip>
              <Tooltip title="Change Language" sx={{display:'none'}}>
                <IconButton edge="end" color="primary" style={squareIcon} aria-label="Locale" 
                    onClick={handleLocaleClick}>
                  <LocaleIcon />                
                </IconButton>
              </Tooltip>
              <Tooltip title="Help Me !">
                <IconButton edge="end" color="primary" style={squareIcon} aria-label="Help" 
                    onClick={handleHelpClick}>
                  <HelpIcon />                
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default AppBuilder;
