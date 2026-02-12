import React, { useState, useEffect } from "react";
import { Box, Divider, Drawer, IconButton, Tooltip } from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  ExpandLess,
  ExpandMore
} from "@mui/icons-material";

import { extractPageLocaleMap } from "../../utils/localeUtils";
import { usePageStore } from "../../store/appPageStore";
import { useAssetStore } from "../../store/appAssetsStore";
import PageCanvas from "./PageCanvas";
import type { CanvasChild } from "../../components/DesignCanvas";
import UIComponentView, { type UIPart as UIComponentPart } from "./ComponentListView";

import FormEngine from "../PropertyValueForm/FormEngine";
import { loadUIConfig } from "../../utils/uiInspectorUtils";
import { UIInspector } from "../PropertyValueForm/UIInspector";

const drawerMinWidth = 60;
const drawerWidth = 180;

const PageLayout: React.FC = () => {

  const { pagelistData, activePageId } = usePageStore();
  const { uiList } = useAssetStore();

  const activePageData = pagelistData?.[activePageId];
  const pageScreenIndex = activePageData['_selectedScreenIndex']
  const activePage = activePageData['screenData'][pageScreenIndex];  //openedPages.find(p => p.pageid === activePageId);

  //console.info(activePageId, "..... PageLayout >>>", activePage.Title);

  if (!activePage){

    return (
      <Box sx={{ p: 2 }}>
        Open a page to see its JSON data
      </Box>
    );
  }

  const [pageschema, setPageScema] = useState<any>(null);
  useEffect(() => {
    fetch("./config/components/ScrollView.json")
      .then(res => res.json())
      .then(data => setPageScema(data));
  }, []);

  const [pageLocaleMap, setPageLocaleMap] = useState<any>(null);
  useEffect(() => {
    fetch("./locale/en_US/pageproperties.json")
      .then(res => res.json())
      .then(data => {
        const localeMap = extractPageLocaleMap(data, "ScrollView");
        setPageLocaleMap(localeMap)
      });
  }, []);

  const [uiLocaleJson, setUiLocaleJson] = useState<any>(null);

  useEffect(() => {
    loadUIConfig().then(({ uiLocaleJson }) => {
      setUiLocaleJson(uiLocaleJson);
    });
  }, []);

  const [componentListOpen, setComponentListOpen] = useState<boolean>(false);
  const [pagePropertiesOpen, setPagePropertiesOpen] = useState<boolean>(true);
  const [uiPropertiesShow, setUIPropertiesShow] = useState<boolean>(false);
  const [uiPropertiesOpen, setUIPropertiesOpen] = useState<boolean>(false);
  const [selectedUIDef, setSelectedUIDef] = useState<any>(null);
  const [selectedUIType, setSelectedUIType] = useState<string>('');

  const handleUISelectionChange = (selected: CanvasChild[]) => {
    console.info("handleUISelectionChange >>>", selected);
    if(selected.length === 1) {
      setUIPropertiesShow(true);
      const childDef:any = selected[0]['childdef'];
      setSelectedUIDef(childDef);
      setSelectedUIType(childDef['viewType']);
      setUIPropertiesOpen(true);
    }else{
      setUIPropertiesShow(false);
    }
  }

  return (
    <Box
      sx={{
        mt: 0.5,
        p: 0,
        bgcolor: "background.default",
        borderRadius: 1,
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
        textAlign: "start",
        maxHeight: "100%",
        overflow: "auto",
        border: "1px solid",
        borderColor: "divider",
        display: "flex", height: "100vh"
      }}
    >

      {/* LEFT DRAWER */}
      <Drawer
        variant="persistent"
        open={componentListOpen}
        slotProps={{
          paper: {
            sx: {
              position: "absolute",
              top: 52, left: 2,
              height: "90%",
              width: componentListOpen ? drawerWidth : drawerMinWidth,
              transition: "width .25s",
              overflow: "hidden",
              border: "1px solid #ddd",
              borderColor: (theme) => `${theme.palette.primary.main}`, 
              boxShadow: 3,
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <Box 
          sx={{ 
            px: 2, py: 1, display: "none",
            background: "linear-gradient(rgba(255, 255, 255, 0.051), rgba(255, 255, 255, 0.51))",
            borderWidth: "2px", borderStyle: "solid", borderBottomWidth: "1px",
            borderColor: (theme) => `${theme.palette.primary.main}`, 
          }}
        >
          Components List
        </Box>
        <Divider />
        <Box 
          sx={{ 
              p: 1, bgcolor: "background.paper", height: "100%",
              borderWidth: "2px", borderStyle: "solid", borderTopWidth: 0,
              borderColor: (theme) => `${theme.palette.primary.main}`,
          }}
        >          
            {uiList &&
              <UIComponentView parts={uiList as UIComponentPart[]}/>
            }
          
        </Box>
      </Drawer> 

      <Tooltip title="Toogle Components List">
        <IconButton size="small" 
          sx={{ 
            zIndex: 99, position: "fixed", top: 104, left: componentListOpen ? 240 : drawerMinWidth, 
            border: "2px solid #888", borderRadius: 2, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
            borderColor: (theme) => `${theme.palette.primary.main}`, 
            boxShadow: "0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)",
            backgroundColor: "background.paper"
           }}
          onClick={() => setComponentListOpen(!componentListOpen)}
        >
          {componentListOpen ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Tooltip>

      {/* MAIN CONTENT */}
      <Box sx={{ flexGrow: 1, position: "relative", bgcolor: "background.paper", margin: "8px 48px" }}>
        <Box
            sx={{                
                width: componentListOpen ? 'calc(100% - 182px)' : 'calc(100%)', height: '100%', bgcolor: 'background.paper', 
                margin: '0 auto', p: 0, overflow: 'auto',
                position: 'absolute', left: componentListOpen ? drawerWidth : '0px',                
            }}
        >
          <PageCanvas 
            componentListOpen={componentListOpen} 
            selectedPage={activePage} 
            pagewidth={activePage.frame.width} 
            pageheight={activePage.frame.height}
            onSelectionChange={handleUISelectionChange} 
          />            
        </Box>
      </Box>

      {/* Page Properties Collapsible Panel */}
      <Box
        sx={{
          position: "absolute",
          top: 84, right: pagePropertiesOpen ? 45 : 20,
          width: pagePropertiesOpen ? 300 : 0,
          height: pagePropertiesOpen ? '78%' : 0,
          transition: "widtj .25s",
          bgcolor: "background.paper",
          border: "2px solid #ddd",
          borderColor: (theme) => `${theme.palette.primary.main}`,
          borderRadius: 0.25,
          borderTopWidth: 0,
          display: pagePropertiesOpen ? "flex" : "none",
          alignItems: "start", 
          flexDirection: "column",
          overflow: pagePropertiesOpen ? "hidden auto" : "hidden",
        }}
      >
        {pageschema && <FormEngine schema={pageschema as any} prefillData={activePage} localeMap={pageLocaleMap} />}
      </Box>

      {/* UI Properties Collapsible Panel */}
      {uiPropertiesShow &&
        <Box
          sx={{
            position: "absolute",
            top: 84, right: uiPropertiesOpen ? 45 : 20,
            width: uiPropertiesOpen ? 300 : 0,
            height: uiPropertiesOpen ? '78%' : 0,
            transition: "widtj .25s",
            bgcolor: "background.paper",
            border: "2px solid #ddd",
            borderColor: (theme) => `${theme.palette.primary.main}`,
            borderRadius: 0.25,
            borderTopWidth: 0,
            display: uiPropertiesOpen ? "flex" : "none",
            alignItems: "start", 
            flexDirection: "column",
            overflow: uiPropertiesOpen ? "hidden auto" : "hidden",
          }}
        >
          {selectedUIDef && <UIInspector selectedUI={selectedUIDef} uiLocaleJson={uiLocaleJson} />}
        </Box>
      }

      <Box 
          sx={{
            position: "absolute", 
            top: pagePropertiesOpen ? 52 : 42, 
            right: pagePropertiesOpen ? 45 : 20, 
            width: pagePropertiesOpen ? 300 : 200, 
            height: pagePropertiesOpen ? 32 : 40,
            bgcolor: "background.paper",
            border: "2px solid #ddd", borderColor: (theme) => `${theme.palette.primary.main}`, 
            borderBottomWidth: 1, borderRadius: 0,
            display: "flex", alignItems: "center", gap: 1, p: 1,
            flexDirection: pagePropertiesOpen ? "row" : "row-reverse",
            justifyContent: pagePropertiesOpen ? "flex-start" : "space-between",
            transform: pagePropertiesOpen ? 'rotate(0deg)' : 'rotate(270deg)',
            transformOrigin: pagePropertiesOpen ? 'left center' : 'right center',
          }}
        >
          <IconButton
            sx={{ border: "1px solid", borderRadius: 0, width: 24, height: 24 }}
            onClick={() => setPagePropertiesOpen(!pagePropertiesOpen)}
          >
            {pagePropertiesOpen ? <ExpandMore /> : <ExpandLess />}
          </IconButton>          
          Page Properties            
      </Box>

      {uiPropertiesShow &&
        <Box 
          sx={{
            position: "absolute", 
            top: uiPropertiesOpen ? 52 : 252, 
            right: uiPropertiesOpen ? 45 : 20, 
            width: 300, height: uiPropertiesOpen ? 32 : 40, 
            bgcolor: "background.paper",
            border: "2px solid #ddd", borderColor: (theme) => `${theme.palette.primary.main}`, 
            borderBottomWidth: 1, borderRadius: 0,
            display: "flex", alignItems: "center", gap: 1, p: 1,
            flexDirection: uiPropertiesOpen ? "row" : "row-reverse",
            justifyContent: uiPropertiesOpen ? "flex-start" : "space-between",
            transform: uiPropertiesOpen ? 'rotate(0deg)' : 'rotate(270deg)',
            transformOrigin: uiPropertiesOpen ? 'left center' : 'right center',
          }}
        >
          <IconButton
            sx={{ border: "1px solid", borderRadius: 0, width: 24, height: 24 }}
            onClick={() => setUIPropertiesOpen(!uiPropertiesOpen)}
          >
            {uiPropertiesOpen ? <ExpandMore /> : <ExpandLess />}
          </IconButton>          
          {selectedUIType} Properties            
        </Box>
      }

    </Box>
  );
};

export default PageLayout;
