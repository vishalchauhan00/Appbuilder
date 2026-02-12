import React, { useState } from 'react';

import { useAppStore } from '../../store/appDataStore';
import { getTabModuleAccess, checkProjectRole } from '../../utils/appUtils';

import { List, ListItemButton, ListItemText, Collapse, ListItemIcon, IconButton, Popover } from '@mui/material';

import { ExpandLess, ExpandMore } from '@mui/icons-material';
import MoreIcon from '@mui/icons-material/MoreHoriz';

import AlertDialog from '../../components/AlertDialog';
import PageListOptions from './PageListOptions';

// --- Types ---
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

export interface ListBranchProps {
  node: PageNode;
  pagelist: Record<string, any>;
  findpageId: number;
  selectedtabs?: any[];
  source?: string;
  selected?: boolean;
  isMultiSelect: boolean;
  multiSelectedPages: (string | number)[];
  onSelection: (page: any) => void;
  onPageAdd: (page: any) => void;
}

const PageListBranch: React.FC<ListBranchProps> = ({ node, pagelist, findpageId, selectedtabs, source, selected, isMultiSelect, multiSelectedPages, onSelection, onPageAdd }) => {
    const halign: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    };
    const hspacer: React.CSSProperties = { width: '24px' };
    //const nested: React.CSSProperties = { paddingLeft: 32 };

    //const { credentials, config, projectData } = useAppStore();    
    //const appConfig = Object.assign({}, credentials, config);
    const { projectData } = useAppStore();    
    const projectdata = projectData;
    const _child = node.children;
    const _level = node.level;
    const _arrlevel = Array.from({ length: _level }, (_, i) => i);
    const _text = node.title;

    let _pointerEvent: React.CSSProperties['pointerEvents'] = "auto";
    let _color = "";

    if (_level === 1 && selectedtabs?.includes(node.id)) {
        _color = "blue";
    }

    const [openAlert, setOpenAlert] = useState<boolean>(false);
    const [alertTitle, setAlertTitle] = useState<string>('');
    const [alertMessage, setAlertMessage] = useState<string>('');
    
    const [open, setOpen] = useState<boolean>(true);
    const [selectedNodeId, setSelectedNodeId] = useState<string>('');
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleStatus = () => {
        setOpen(prev => !prev);
    };

    const handleListItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const dataset = e.currentTarget.dataset;
        if (_level > 1) setSelectedNodeId(node.id);
        onSelection(dataset);
    };

    const handleDropAllow = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handlePageDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        const droppedNodeId = e.currentTarget.dataset['id'];        
        const isAccess = checkModuleAccess(parseInt(droppedNodeId || '-1'));
        if (!isAccess) {
          setAlertTitle('');
          setAlertMessage("Not authorized to 'Add' page here");
          setOpenAlert(true);
          return;
        }

        //const draggedNodeData = e.dataTransfer.getData("text/plain");
        //createPageData(droppedNodeId || "-1", draggedNodeData);
    };

    const checkModuleAccess = (pageid:number) => {    
      if(pageid > -1) {
          const _selectedtabs = selectedtabs;
          if(_selectedtabs && _selectedtabs.length > 0) {
              const _pageobj = node['page'];
              const isAccess = getTabModuleAccess(_pageobj, _selectedtabs, pagelist);
              return isAccess;
          }
      }else {
          const _projectRole = checkProjectRole(projectdata);
          if(_projectRole === "contributor") {
              return false;
          }
          return true;
      }
      return true;
    };

    const handleChildSelection = (_child: PageNode) => {       
      onSelection(_child);
    }; 

    const handlePageAdd_onchildNode = (_page: any) => {   
      onPageAdd(_page);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
    }

     
    const handleOptionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);

        /*const dataset = event.currentTarget.dataset;
        if (_level > 1) setSelectedNodeId(node.id);
        onSelection(dataset);*/
    };

    const handleOptionsClose = () => {
        setAnchorEl(null);
        setShowOptions(false);

        setSelectedNodeId('');
    };

    const openOptions = Boolean(anchorEl);

    return (
        <div id={(source === "manage") ? "m_" + node.id : node.id} style={{ color: _color, pointerEvents: _pointerEvent }}>
            <div style={halign}
                onMouseOver={() => setShowOptions(true)} onMouseOut={() => setShowOptions(false)} >
                {(_level !== undefined && _level > -1) &&
                    <div style={halign}>                    
                        {_arrlevel.map(index => (                                            
                            <div key={index} style={hspacer}/>
                        ))} 
                        {(_child !== undefined && node.childcount > 0) && 
                            (open ? <ExpandLess onClick={handleStatus}/> : <ExpandMore onClick={handleStatus}/>) 
                        }
                    </div>
                }              
                <ListItemButton dense selected={(isMultiSelect && multiSelectedPages.length>0) ? (multiSelectedPages.indexOf(node.id) > -1) : ((findpageId > -1) ? (findpageId === Number(node.id)) : selected)} 
                                data-id={node.id} data-count={node.childcount} sx={{height:28}}
                                onClick={handleListItemClick} onDoubleClick={handleDoubleClick}
                                onDragOver={handleDropAllow} onDrop={handlePageDrop}>
                    {(node.childcount === 0) && 
                        <div style={hspacer}/>
                    }
                    <ListItemText primary={_text}/>
                </ListItemButton>
                <ListItemIcon sx={{minWidth: '32px', visibility: showOptions ? 'visible' : 'hidden'}}>
                    <IconButton edge="end" aria-label="more" sx={{padding:0}} data-id={node.id} data-count={node.childcount}
                                onClick={handleOptionsClick}>
                        <MoreIcon />
                    </IconButton>
                </ListItemIcon>
                <Popover
                    open={openOptions}
                    anchorEl={anchorEl}
                    onClose={handleOptionsClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    <PageListOptions node={node} pagelist={pagelist} />
                </Popover>
            </div>
            {(_level !== undefined && _level > -1) &&
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List dense={true} component="div" disablePadding>
                    {_child.map(child => (                                            
                        <PageListBranch key={child.id} selected={selectedNodeId === child.id} source={source}
                                    node={child} pagelist={pagelist} selectedtabs={selectedtabs}
                                    onSelection={handleChildSelection} onPageAdd={handlePageAdd_onchildNode} isMultiSelect={isMultiSelect} multiSelectedPages={multiSelectedPages} findpageId={findpageId} >                            
                        </PageListBranch>
                    ))}  
                    </List>
                </Collapse>                                
            }
            {openAlert === true && 
                <AlertDialog open={true} 
                            title={alertTitle} message={alertMessage}
                            onClose={() => setOpenAlert(false)}
                />
            }  
            
        </div>
    );

};

export default PageListBranch;
