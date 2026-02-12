import React from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';

interface WebViewerProps {
  url: string;
  title?: string;
  height?: string | number;
  width?: string | number;
}

const WebViewer: React.FC<WebViewerProps> = ({
  url,
  title = 'Web Viewer',
  height = '80vh',
  width = '100%',

}) => {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(true);

  return (
    <Box
      sx={{
        position: 'relative',
        bgcolor: theme.palette.background.default,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
      }}
    >

      {/* Content Area */}
      <Box sx={{ position: 'relative', flexGrow: 1 }}>
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.background.paper,
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <iframe
          src={url}
          title={title}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          onLoad={() => setLoading(false)}
        />
      </Box>
    </Box>
  );
};

export default WebViewer;