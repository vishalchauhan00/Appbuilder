import React, { useState } from 'react';

import { Box, Button, ButtonGroup, Typography } from "@mui/material";
import PageAddIcon from '@mui/icons-material/PostAdd';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import PopupDialog from "../../components/PopupDialog";
import AddPageWindow from './AddPageWindow';

export interface PageNode {
  id: string | '';
  title: string;
  parent: string;
  type?: string;
  childcount: number;
  children: PageNode[];
  level: number;
  page?: any;
}

export interface OptionsProps {
  node: PageNode;
  pagelist: Record<string, any>;
}

const PageListOptions: React.FC<OptionsProps> = ({ node, pagelist }) => {
  const optionstyle: React.CSSProperties = {
      height: '32px',
      textTransform: 'none',
      textAlign: 'start',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
  };

  const [openAddPage, setAddPage] = useState<boolean>(false);

  const handleOptionClick = (type: string) => {
      console.log(type, "*******", node, pagelist);
      switch (type) {
        case 'addpage':
          setAddPage(true);
          break;
      
        default:
          break;
      }
  }

  const handleAddChildPage = (pagename: string) => {
    console.log(pagename, "** handleAddChildPage *****", node.id);
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        '& > *': {
          m: 1,
        },
      }}
    >
      <Typography variant="button" sx={{ px: 2, py: 0.5 }}>Id: {node.id}</Typography>
      <ButtonGroup orientation="vertical" aria-label="page options">
          <Button style={optionstyle} startIcon={<PageAddIcon />} onClick={() => handleOptionClick('addpage')}>Add Child Page</Button>
          <Button style={optionstyle} startIcon={<ContentCopyIcon />} onClick={() => handleOptionClick('copypage')}>Copy Page</Button>
          <Button style={optionstyle} startIcon={<ContentCutIcon />} onClick={() => handleOptionClick('cutpage')}>Cut Page</Button>
          <Button style={{...optionstyle, display:'none'}} startIcon={<ContentPasteIcon />} onClick={() => handleOptionClick('pastepage')}>Paste Page</Button>
          <Button style={optionstyle} startIcon={<DeleteIcon />} onClick={() => handleOptionClick('deletepage')}>Delete Page</Button>
          <Button style={optionstyle} startIcon={<ClearAllIcon />} onClick={() => handleOptionClick('clearpage')}>Clear Page</Button>
      </ButtonGroup>
      <PopupDialog 
        disableEscapeKeyDown hideBackdrop
        open={openAddPage}
        onClose={() => {}}
        dialogTitle={
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <Typography variant="body1">Add Child Page</Typography>      
          </div>
        }
        children={
          <>
            <AddPageWindow onSubmit={handleAddChildPage} onClose={() => setAddPage(false)} />
          </>
        }
      >
      </PopupDialog>
    </Box>
  );
   
};

export default PageListOptions;