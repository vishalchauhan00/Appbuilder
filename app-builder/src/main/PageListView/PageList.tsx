import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';

import { Switch, SvgIcon, Paper, ListSubheader, Tooltip, Popover, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import {
  List,
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PageAddIcon from '@mui/icons-material/PostAdd';
import FilterListIcon from '@mui/icons-material/FilterListAlt';

import { useAppStore } from '../../store/appDataStore';
import PageListBranch from './PageListBranch';
import PageFinder from './PageFinder';
import AddPageWindow from './AddPageWindow';
import PopupDialog from '../../components/PopupDialog';


// --- Types ---
export interface PageNode {
  id: string | number;
  title: string;
  parent: string;
  type?: string;
  childcount: number;
  children: PageNode[];
  level: number;
  page?: any;
}

interface PageListProps {
  open?: boolean;
  data: Record<string, any>;
  list: Record<string, any>;
  source?: string;
  resetmultiselection?: boolean;
  selectedtabs?: any[];
  onNodeSelection: (page: PageNode) => void;
  onMultiPageSelection: (page: PageNode) => void;
  updatePageList?: (page: PageNode) => void; 
  onClose: () => void;
}

const PageList: React.FC<PageListProps> = ({ data, list, source, selectedtabs, onNodeSelection, onMultiPageSelection, updatePageList, onClose }) => {
  const theme = useTheme();

  const root: React.CSSProperties = { height: '100%' };
  const pagelist: React.CSSProperties = {
    width: '100%',
    height: `calc(100% - 36px)`,
    overflow: 'auto',
    padding: 0,
    marginTop: 2,
  };
  const rootnode: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '32px',
    paddingRight: '16px',
    backgroundColor: theme.palette.background.paper,
    position: 'sticky', top: 0, zIndex: 100,
  };
  const findbutton: React.CSSProperties = { width: 24, height: 24 };

  const { projectData } = useAppStore();
  const screens = projectData?.['availableScreens'];
  const screenMap: Record<string, string> = {
    iOS: 'Mobile',
    Android: 'Mobile'
  };

  const [selected, setSelected] = useState<Record<string, boolean>>(
    () => Object.fromEntries(screens.map((s:any) => [s.Platform, true]))
  );

  const records = list;

  useEffect(() => {
    const _pagelisttop = sessionStorage.getItem("pageListTop");
    const el = document.getElementById('pagelist');
    if (el) {
      el.scrollLeft = 0;
      el.scrollTop = (_pagelisttop ? Number(_pagelisttop) : 0);
    }
  }, []);


  const [openAddPage, setAddPage] = useState<boolean>(false);
  
  const [selectedId, setSelectedId] = useState<string | number>(-1);
  const [multiChecked, setMultiChecked] = useState<boolean>(false);
  const [multiSelectedPages, setMultiSelectedPages] = useState<(string | number)[]>([]);
  //const resetMS = resetmultiselection;

  const [showFinder, setShowFinder] = useState<boolean>(false);
  const [findpageId, setFindPageId] = useState<number>(-1);
  const [anchorFinderEl, setAnchorFinderEl] = React.useState<HTMLButtonElement | null>(null);
  const openFinder:boolean = Boolean(anchorFinderEl);

  const [anchorFilterEl, setAnchorFilterEl] = React.useState<HTMLButtonElement | null>(null);
  const openFilters:boolean = Boolean(anchorFilterEl);


  const handleOpenAddPageWindow = () => {
    setAddPage(true);
  };

  const handleCloseAddPageWindow = () => {
    setAddPage(false);
  };

  const handleAddTabPage = (pagename: string) => {
    console.log("handleAddTabPage >>", pagename);
  };

  const handleMultiPageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMultiChecked(event.target.checked);
  };

  const handleOpenFinder = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowFinder(true);
    setAnchorFinderEl(event.currentTarget);
    setFindPageId(-1);
  }

  const handleCloseFinder = () => {
    setShowFinder(false);
    setAnchorFinderEl(null);
    setFindPageId(-1);
  }

  function handlePageSelection(pageid: string | number) {
    if (showFinder && multiChecked) {
      setMultiSelectedPages([]);
    }
    setSelectedId(pageid);
    setFindPageId(Number(pageid));
    const node = (source === "manage") ? document.getElementById("m_" + pageid) : document.getElementById(pageid.toString());
    if (node) {
      node.scrollIntoView(false);
    }
  }

  function handlePageFinder(pageid: string | number) {
    getSelectedPage({ id: pageid } as PageNode);
  }

  function handleOpenFilter(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorFilterEl(event.currentTarget);
  }

  function handleCloseFilter() {
    setAnchorFilterEl(null);
  }
  
  const handleFilterbyScreen = (platform: string) => {
    setSelected((prev) => {
      const selectedCount = Object.values(prev).filter(Boolean).length;

      if (selectedCount === 1 && prev[platform]) {
        return prev; // no change
      }

      return {
        ...prev,
        [platform]: !prev[platform],
      };
    });
  };

  function getSelectedPage(_page: PageNode) {
    const el = document.getElementById('pagelist');
    if (el) {
      sessionStorage.setItem("pageListTop", el.scrollTop.toString());
    }
    setFindPageId(Number(_page.id));
    setSelectedId(_page.id);
    if (!multiChecked) {
      onNodeSelection(_page);
      setMultiSelectedPages([]);
    } else {
      if (_page.id !== -1) {
        onMultiPageSelection(_page);
        if (showFinder) {
          setMultiSelectedPages([]);
        } else {
          setMultiSelectedPages(prev => [...prev, _page.id]);
        }
      }
    }
  }

  function handlePageAdd(_page: any) {
    if (updatePageList) {
      updatePageList(_page);
    }
  }

  return (
    <Drawer anchor="left" open={true} onClose={onClose}>
      <Box sx={{ width: 360, px: 0, py: 0.75, overflow: 'hidden' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{marginLeft: 2}}>Page List</Typography>
          <IconButton onClick={onClose}>
              <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 0, backgroundColor:'#1976d2' }} />
        <Paper elevation={9} style={root}>
          <List id="pagelist"
              component="nav" dense={true}
              aria-labelledby="nested-list-subheader"
              style={pagelist} sx={{ width: '100%', bgcolor: 'background.paper' }}
          >
            <div style={rootnode}>
              <ListSubheader id={records[0].id} sx={{height:'32px', lineHeight:'32px', fontSize:'1rem', fontWeight:'600'}}>
                {records[0].title} {data && `(${Object.keys(data).length})`}
              </ListSubheader>
              <Paper elevation={1} 
                sx={{
                    display:'flex', justifyContent:'flex-end', alignItems:'center', gap:0.5, 
                    border:'1px solid #888', borderRadius:4, px:1, py:0.25
                  }}
                >
                <Tooltip title="Add Tab Page">
                  <IconButton aria-label="add page" sx={{padding:0}} onClick={handleOpenAddPageWindow}>
                    <PageAddIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Enable Multiple Selection" sx={{display:'none'}}>
                  <Switch color="primary" size="small" checked={multiChecked} onChange={handleMultiPageSelect} />
                </Tooltip>
                <Tooltip title="Find a Page">
                  <IconButton aria-label="find page" sx={{padding:0}} style={findbutton} onClick={handleOpenFinder}>
                      <SvgIcon>
                        <path d="M0 0h24v24H0z" fill="none" /><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </SvgIcon>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Filter by Screens">
                  <IconButton aria-label="Filter" sx={{padding:0, display:'none'}} style={findbutton} onClick={handleOpenFilter}>
                    <FilterListIcon/>
                  </IconButton>
                </Tooltip>
              </Paper>
              <PopupDialog 
                disableEscapeKeyDown hideBackdrop
                open={openAddPage}
                onClose={() => {}}
                dialogTitle={
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <Typography variant="body1">Add Tab Page</Typography>      
                  </div>
                }
                children={
                  <>
                    <AddPageWindow onSubmit={handleAddTabPage} onClose={handleCloseAddPageWindow} />
                  </>
                }
              >
              </PopupDialog>
              <Popover
                    open={openFinder}
                    anchorEl={anchorFinderEl}
                    onClose={handleCloseFinder}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                    slotProps={{
                      paper: {sx:{ borderRadius:4 } }
                    }}
              >
                  <PageFinder data={data} listData={records} source={source}
                      onSelectPage={handlePageSelection} onFindPage={handlePageFinder} onClose={handleCloseFinder} />
              </Popover>
              <Popover
                    open={openFilters}
                    anchorEl={anchorFilterEl}
                    onClose={handleCloseFilter}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                  {(screens && screens.length === 1) &&
                    <FormGroup sx={{ p: 1 }}>
                      <FormControlLabel sx={{ height: 36, ml: 0 }} disabled control={<Checkbox defaultChecked />} label="All" />
                    </FormGroup> 
                  }
                  {(screens && screens.length > 1) &&
                    <FormGroup sx={{ p: 1 }}>
                      {screens.map((screen:any) => (
                        <FormControlLabel
                          key={screen.Platform}
                          sx={{ height: 36, ml: 0 }}
                          control={<Checkbox checked={!!selected[screen.Platform]} onChange={() => handleFilterbyScreen(screen.Platform)} />}
                          label={screenMap[screen.Platform] || screen.Platform}
                        />
                      ))}
                    </FormGroup>                  
                  }
                </Popover>
            </div>
            {records.map((item:any) => (
              <div key={item.id}>
                {item.level > 0 &&
                  <PageListBranch selected={selectedId === item.id} source={source}
                    node={item} pagelist={data} selectedtabs={selectedtabs}
                    onSelection={getSelectedPage} onPageAdd={handlePageAdd} isMultiSelect={multiChecked} multiSelectedPages={multiSelectedPages} findpageId={findpageId} />
                }
              </div>
            ))}
          </List>
        </Paper>
      </Box>
    </Drawer>
  );
};

export default PageList;