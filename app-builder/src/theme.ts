import type { ThemeOptions } from '@mui/material/styles';

export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#ffffff', // white for light mode
          color: '#000000',
          margin: 0,
          padding: 0,
          transition: 'background-color 0.3s ease',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginInline: 8,
          paddingInline: 12,
          '&:hover': {
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
          },
          '&.Mui-selected': {
            backgroundColor: '#1976d2',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
          },
        },
      },
    },
  },
};

export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#000000', // black for dark mode
          color: '#ffffff',
          margin: 0,
          padding: 0,
          transition: 'background-color 0.3s ease',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginInline: 8,
          paddingInline: 12,
          '&:hover': {
            backgroundColor: '#2a3b4c',
            color: '#90caf9',
          },
          '&.Mui-selected': {
            backgroundColor: '#90caf9',
            color: '#000',
            '&:hover': {
              backgroundColor: '#64b5f6',
            },
          },
        },
      },
    },
  },
};
