import React from 'react';
import './App.css';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { useThemeStore } from './store/appThemeStore';
import { darkThemeOptions, lightThemeOptions } from './theme';

import AppBuilder from './main/AppBuilder';

const App: React.FC = () => {
  const mode = useThemeStore((state) => state.mode);
  const theme = createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBuilder />
      </div>
    </ThemeProvider>
  );
};

export default App;
