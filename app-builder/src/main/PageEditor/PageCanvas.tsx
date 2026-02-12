import React, { useRef, useState, useMemo } from "react";
import { Box, Checkbox, Divider, FormControlLabel, Paper, Popover, Tooltip } from "@mui/material";
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  Undo,
  Redo,
  ContentCut,
  ContentCopy,
  ContentPaste,
  List,
  UnfoldMore,
  UnfoldLess,
  FlipToFront,
  FlipToBack,
  AlignHorizontalLeft,
  AlignHorizontalCenter,
  AlignHorizontalRight,
  AlignVerticalTop,
  AlignVerticalCenter,
  AlignVerticalBottom,
  FormatLineSpacing
} from "@mui/icons-material";

import SendForward from '../../assets/send_forward.png';
import SendBackward from '../../assets/send_backward.png';
import ThemedToggleButton from "../../components/ThemedToggleButton";

import { usePageStore } from "../../store/appPageStore";
import { usePageChildren } from '../../hooks/usePageChildren';
import DesignCanvas from "../../components/DesignCanvas";
import type { CanvasChild, DesignCanvasHandle, CanvasChangeMeta } from "../../components/DesignCanvas";

interface PageCanvasProps {
  componentListOpen: boolean;
  selectedPage: Record<string, any>;
  pagewidth: number;
  pageheight: number;
  onSelectionChange?: (selected: CanvasChild[]) => void;
}

const TOOLBOX_HEIGHT = 390;

const PageCanvas: React.FC<PageCanvasProps> = ({componentListOpen, selectedPage, pagewidth, pageheight, onSelectionChange}) => {

    if(!selectedPage || !pagewidth || !pageheight) return null;
    
    const [anchorMenuEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null);
    const openMenu:boolean = Boolean(anchorMenuEl);

    const viewItem:string[] = ['Show All', 'Show Ruler', 'Show Guide', 'Show Grid'];
    const [checked, setChecked] = React.useState<string[]>(['']);
    const [snapguide, setSnapGuide] = React.useState<boolean>(false);
    const [snapgrid, setSnapGrid] = React.useState<boolean>(false);
    const [gridgap, setGridGap] = React.useState<number>(20);
    
    const [pageMoreOptionsOpen, setPageMoreOptionsOpen] = useState<boolean>(true);

    const handleViewMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        initLayoutState();
        setMenuAnchorEl(event.currentTarget);
    }

    function initLayoutState(pagestate?: any) {
        let _viewChecked:string[] = [''];
        let _snapguide:boolean = false;
        let _snapgrid:boolean = ref.current?.isSnapOn() || false;
        let _gridgap:number = 20;

        if(pagestate) {
            let _params = pagestate['params'];
            if(_params) {
                if(_params['showall'] && _params['showall'] === 'on') {
                    _viewChecked = viewItem;
                }else {
                    _viewChecked = [];
                    if(_params['showruler'] && _params['showruler'] === 'on')   _viewChecked.push('Show Ruler');
                    if(_params['showguide'] && _params['showguide'] === 'on')   _viewChecked.push('Show Guide');
                    if(_params['showgrid'] && _params['showgrid'] === 'on')     _viewChecked.push('Show Grid');
                }

                _snapguide = (_params['snapguide'] && _params['snapguide'] === 'on') ? true : false;
                _snapgrid = (_params['snapgrid'] && _params['snapgrid'] === 'on') ? true : false;
                _gridgap = (_params['gridgap']) ? Number(_params['gridgap']) : 20;
            }
        }

        setChecked(_viewChecked);
        setSnapGuide(_snapguide);
        setSnapGrid(_snapgrid);
        setGridGap(_gridgap);
    }

    const handleToggleViewOption = (value: string) => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            if(value === "Show All") {
                newChecked.push('Show All', 'Show Ruler', 'Show Guide', 'Show Grid');
            }else {
                newChecked.push(value);
                if(newChecked.indexOf('Show Ruler') > -1 && newChecked.indexOf('Show Guide') > -1 && newChecked.indexOf('Show Grid') > -1){
                    newChecked.push('Show All');
                }
            }

        }else {
            if(value === "Show All") {
                newChecked.splice(0);
            }else {
                newChecked.splice(currentIndex, 1);        
                const showallIndex = newChecked.indexOf('Show All');
                if(showallIndex > -1){
                    newChecked.splice(showallIndex, 1);
                }
            }           
        }

        setChecked(newChecked);
        
        let _param:string = '';
        if(value === 'Show All')  _param = 'showall';
        else if(value === 'Show Ruler')  _param = 'showruler';
        else if(value === 'Show Guide')  _param = 'showguide';
        else if(value === 'Show Grid')  _param = 'showgrid';

        let _val = (currentIndex > -1) ? 'off' : 'on';
        updatePagestateParam(_param, _val);
    };
    
    const handleSnapGridChange = () => {
        setSnapGrid(!ref.current?.isSnapOn());
        ref.current?.toggleSnap();

        const updatedSnapValue = ref.current?.isSnapOn() ? 'on' : 'off';
        updatePagestateParam('snapgrid', updatedSnapValue);
    };

    const handleGridGapValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        setGridGap(Number(event.currentTarget.value));  
    
        updatePagestateParam('gridgap', event.currentTarget.value);
    };

    function updatePagestateParam(parameter: string, value: any){
        let stateparams:any = {};//pagestate['params'];
        stateparams[parameter] = value;

        console.info("updatePagestateParam", parameter, value, stateparams);
    }

    ///////// Page related functionalities //////////

    const { activePageId, updateActivePageChildren } = usePageStore();

    const pageChildren = useMemo(
        () => selectedPage.Children[0]?.Children ?? [],
        [selectedPage]
    );

    const {
        items,
        addItem,
        updateItem,
        updateFrame,
    } = usePageChildren(activePageId, pageChildren, updateActivePageChildren);

    console.info(selectedPage.Title, ".... children ....", selectedPage.Children[0]['Children'], items.length);

    const bgColor = selectedPage.Children[0]['backgroundColor'];
    const bgGradient = selectedPage.Children[0]['backgroundGradient'];
    const background = (bgGradient.length > 0) ? bgGradient : getColorValue(bgColor);
    //console.info(selectedPage, ".. PageCanvas >>>", background);

    const ref = useRef<DesignCanvasHandle | null>(null);

    const handleSelectionChange = (ids: string[]) => {
        if (onSelectionChange) {
            const selected = items.filter(c => ids.includes(c.id));
            onSelectionChange(selected);
        }
    };

    const handleChildrenUpdate = (child: CanvasChild[], meta?: CanvasChangeMeta) => {
        // Optional: react to changes with updateItem/updateFrame if desired
        // Example: update the first changed item frame into store (if move/resize)
        if (meta?.ids?.length) {
            // For move: handle all affected ids
            if (meta.op === "move") {
                meta.ids.forEach(id => {
                    const target = child.find(c => c.id === id);
                    if (!target) return;
                    updateFrame(id, {
                        x: target.x,
                        y: target.y,
                        width: target.w,
                        height: target.h
                    });
                });
                return;
            }

            // For other ops, keep existing single-target handling (first id)
            const targetId = meta.ids[0];
            const target = child.find(c => c.id === targetId);
            if (target && meta.op === "resize") {
                updateFrame(targetId, {
                    x: target.x,
                    y: target.y,
                    width: target.w,
                    height: target.h
                });
            }
            if (meta.op === "add" && target) {
                addItem(target.childdef);
                updateItem(targetId, {
                    name: target.id,
                });
                updateFrame(targetId, {
                    x: target.x,
                    y: target.y,
                    width: target.w,
                    height: target.h
                });
            }
        }
    }

    return (
        <Paper elevation={3} 
            sx={{
                    m:0, width:'100%', height:'100%', overflow:'hidden',
                    display:'flex', flexDirection:'column', justifySelf:'center',
                    position: "relative",
                    padding: 0,
                    background: (theme) =>
                        `linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box,
                        linear-gradient(90deg,
                            ${theme.palette.primary.light},
                            ${theme.palette.primary.main},
                            ${theme.palette.primary.dark}
                        ) border-box`,
                    
                    borderRadius: "4px",
                    borderStyle: "solid",
                    borderColor: "transparent",
                    borderWidth: "2px",
                }}
        >
            <Paper elevation={1} 
                sx={{
                    zIndex: 99, position: "fixed", top: 150, left: componentListOpen ? 240 : 60, 
                    display:'flex', flexDirection:'row', justifyContent:'flex-start', alignItems:'center', gap:0.5, marginLeft:0.5,
                    border:'1px solid #888', borderRadius:2, height:TOOLBOX_HEIGHT, width: pageMoreOptionsOpen ? '40px' : '92px'
                }}
            >
                <Box 
                    sx={{
                        display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:1,
                        px:1, py:0.5, height:TOOLBOX_HEIGHT, width:40
                    }}
                >
                    <Tooltip title="View Menu">
                        <ThemedToggleButton value="View" sx={{ width: 28, height: 28, display: 'none' }} onClick={handleViewMenuOpen} >
                            <List />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Tooltip title="Zoom In">
                        <ThemedToggleButton value="ZoomIn" sx={{ width: 28, height: 28, display: 'none' }} onClick={() => ref.current?.zoomIn()} >
                            <ZoomIn />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Tooltip title="Zoom Out">
                        <ThemedToggleButton value="ZoomOut" sx={{ width: 28, height: 28, display: 'none' }} onClick={() => ref.current?.zoomOut()} >
                            <ZoomOut />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Tooltip title="Reset">
                        <ThemedToggleButton value="Reset" sx={{ width: 28, height: 28, display: 'none' }} onClick={() => ref.current?.resetView()} >
                            <CenterFocusStrong />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Divider flexItem sx={{mx:0, display: 'none'}} />
                    <Tooltip title="Undo Changes">
                        <ThemedToggleButton value="Undo" sx={{ width: 28, height: 28 }} >
                            <Undo />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Tooltip title="Redo Changes">
                        <ThemedToggleButton value="Redo" sx={{ width: 28, height: 28 }} >
                            <Redo />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Divider flexItem sx={{mx:0}} />
                    <Tooltip title="Cut Selected Component(s)">
                        <ThemedToggleButton value="Cut" sx={{ width: 28, height: 28 }} >
                            <ContentCut />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Tooltip title="Copy Selected Component(s)">
                        <ThemedToggleButton value="Copy" sx={{ width: 28, height: 28 }} >
                            <ContentCopy />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Tooltip title="Paste Selected Component(s)">
                        <ThemedToggleButton value="Paste" sx={{ width: 28, height: 28 }} >
                            <ContentPaste />
                        </ThemedToggleButton>   
                    </Tooltip>
                    <Divider flexItem sx={{mx:0}} /> 
                    <Tooltip title="Send Front">
                        <ThemedToggleButton value="Front" sx={{ width: 28, height: 28 }} >
                            <FlipToFront />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Send Back">
                        <ThemedToggleButton value="Back" sx={{ width: 28, height: 28 }} >
                            <FlipToBack />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Send Forward">
                        <ThemedToggleButton value="Forward" sx={{ width: 28, height: 28 }} >
                            <img src={SendForward} alt="send forward" width={24} height={24} />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Send Backward">
                        <ThemedToggleButton value="Backward" sx={{ width: 28, height: 28 }} >
                            <img src={SendBackward} alt="send backward" width={24} height={24} />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Divider flexItem sx={{mx:0}} />     
                    <Tooltip title="More Options">
                        <ThemedToggleButton value="More" sx={{ width: 28, height: 28, transform: 'rotate(90deg)' }} 
                            onClick={() => setPageMoreOptionsOpen(!pageMoreOptionsOpen)}
                        >
                            {pageMoreOptionsOpen ? <UnfoldMore /> : <UnfoldLess />}
                        </ThemedToggleButton>   
                    </Tooltip>
                </Box>
                <Divider orientation="vertical" flexItem sx={{mx:0}} />
                <Box 
                    sx={{ 
                        display: !pageMoreOptionsOpen ? 'flex' : 'none', flexDirection:'column', justifyContent:'flex-end', alignItems:'center', gap:1,
                        px:1, py:0.5, height:TOOLBOX_HEIGHT, width:40
                    }}
                >
                    <Tooltip title="Horizontal Align Left">
                        <ThemedToggleButton value="AlignHorizontalLeft" sx={{ width: 28, height: 28 }} >
                            <AlignHorizontalLeft />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Horizontal Align Center">
                        <ThemedToggleButton value="AlignHorizontalCenter" sx={{ width: 28, height: 28 }} >
                            <AlignHorizontalCenter />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Horizontal Align Right">
                        <ThemedToggleButton value="AlignHorizontalRight" sx={{ width: 28, height: 28 }} >
                            <AlignHorizontalRight />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Horizontal Equal Spacing">
                        <ThemedToggleButton value="FormatHorizontalSpacing" sx={{ width: 28, height: 28, transform: 'rotate(270deg)' }} >
                            <FormatLineSpacing />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Vertical Align Top">
                        <ThemedToggleButton value="AlignVerticalTop" sx={{ width: 28, height: 28 }} >
                            <AlignVerticalTop />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Vertical Align Center">
                        <ThemedToggleButton value="AlignVerticalCenter" sx={{ width: 28, height: 28 }} >
                            <AlignVerticalCenter />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Vertical Align Bottom">
                        <ThemedToggleButton value="AlignVerticalBottom" sx={{ width: 28, height: 28 }} >
                            <AlignVerticalBottom />
                        </ThemedToggleButton>
                    </Tooltip>
                    <Tooltip title="Vertical Equal Spacing">
                        <ThemedToggleButton value="FormatVerticalSpacing" sx={{ width: 28, height: 28 }} >
                            <FormatLineSpacing />
                        </ThemedToggleButton>
                    </Tooltip>
                </Box>
                
                <Popover
                    open={openMenu}
                    anchorEl={anchorMenuEl}
                    onClose={() => setMenuAnchorEl(null)}
                    anchorOrigin={{
                        vertical: 'center',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    slotProps={{
                        paper: {sx:{ borderRadius:1, ml:1 } }
                    }}
                >
                    {viewItem.map((value, index) => (
                        <Box key={index} >
                            <FormControlLabel
                                sx={{ height: 36, width: 180, justifyContent: 'space-between', ml: 0, px: 1, 
                                    '& .MuiFormControlLabel-label': { fontSize: '0.825rem' }, 
                                }}
                                control={<Checkbox sx={{p:0.5, mr:1}} checked={checked.indexOf(value) !== -1} onChange={() => handleToggleViewOption(value)} />}
                                labelPlacement="start" label={value}
                            />
                            <Divider />
                        </Box>
                    ))}
                    <FormControlLabel
                        sx={{ display: 'none', height: 36, width: 180, justifyContent: 'space-between', ml: 0, px: 1, 
                                '& .MuiFormControlLabel-label': { fontSize: '0.825rem' }, 
                            }}
                        control={<Checkbox sx={{p:0.5, mr:1}} checked={snapguide} />}
                        labelPlacement="start" label="Snap Guide"
                    />
                    <Divider />
                    <FormControlLabel
                        sx={{ height: 36, width: 180, justifyContent: 'space-between', ml: 0, px: 1, 
                                '& .MuiFormControlLabel-label': { fontSize: '0.825rem' }, 
                            }}
                        control={<Checkbox sx={{p:0.5, mr:1}} checked={snapgrid} onChange={() => handleSnapGridChange()} />}
                        labelPlacement="start" label="Snap Grid"
                    />
                    <Divider />
                    <FormControlLabel
                        sx={{ height: 36, width: 180, justifyContent: 'space-between', ml: 0, px: 1, 
                                '& .MuiFormControlLabel-label': { fontSize: '0.825rem' }, 
                            }}
                        labelPlacement="start" label="Set Grid Gap"
                        control={            
                            <input id="numinput" style={{border:'2px solid #676767', borderRadius:'4px', width:48, height:24, marginRight:'10px'}}
                                type="number" value={gridgap} min="5" max="100" step="5"
                                onChange={handleGridGapValue}
                            />
                        }
                    />
                </Popover>
            </Paper>

            <DesignCanvas
                ref={ref}
                childrenItems={items}
                onChildrenChange={(next, meta) => handleChildrenUpdate(next, meta)}
                onSelectionChange={handleSelectionChange}
                width={pagewidth}
                height={pageheight}
                background={background}
                initialSnap={snapgrid}
                gridSize={gridgap}
            />

        </Paper>
    )
};

function getColorValue(colorObj:any) {
  const _red = Math.ceil(colorObj.red * 255);
  const _green = Math.ceil(colorObj.green * 255);
  const _blue = Math.ceil(colorObj.blue * 255);

  const colorRGBA = "rgba(" + _red +','+ _green +','+ _blue +','+ colorObj.alpha +  ")";
  return colorRGBA;
}

export default PageCanvas;