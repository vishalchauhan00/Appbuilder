import { styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';

const ThemedToggleButton = styled(ToggleButton)(({ theme }) => ({
  border: 'none',
  color: theme.palette.mode === 'dark' ? '#fff' : '#1976d2',
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
  '&.Mui-selected': {
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
}));

export default ThemedToggleButton;
