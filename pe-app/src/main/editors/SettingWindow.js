import React from 'react';
//import { connect } from 'react-redux';
import { useSelector, shallowEqual } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Box, Paper, AppBar, Tabs, Tab, Typography, Badge, IconButton, Popover, Tooltip, Snackbar } from '@material-ui/core';
import { Button, FormGroup, FormControlLabel, Checkbox, RadioGroup, Radio, Select, Fab } from '@material-ui/core';
import { List, ListSubheader, ListItem, ListItemText, ListItemSecondaryAction, ListItemIcon } from '@material-ui/core';
import MuiAccordion from '@material-ui/core/Accordion';
import MuiAccordionDetails from '@material-ui/core/AccordionDetails';
import MuiAccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import NotesIcon from '@material-ui/icons/Notes';
import EditIcon from '@material-ui/icons/Edit'
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import HelpIcon from '@material-ui/icons/Help';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LocationIcon from '@material-ui/icons/MyLocation';
import DownloadIcon from '@material-ui/icons/GetApp';

import PropertyValueEditor from './PropertyValueEditor';
import CheckBoxForm from '../forms/CheckBoxForm';
import ColorPickerForm from '../forms/ColorPickerForm';
import NumericStepperForm from '../forms/NumericStepperForm';

const SettingWindow = (props) => {

  const { show, appconfig, currentScreenIndex } = props;    
  const appConfig = {apiURL: appconfig.apiURL, userid: appconfig.userid, sessionid: appconfig.sessionid, projectid: appconfig.projectid};
  const currentScrIndex = (currentScreenIndex) ? currentScreenIndex : 0;

  let appData = useSelector(state => state.appData.data);
  let pageLocale = useSelector(state => state.appParam.pagelocale, shallowEqual);
  let pageConfig = useSelector(state => state.appParam.pageconfig, shallowEqual);
  let uiLocale = useSelector(state => state.appParam.uilocale, shallowEqual);
  let uiConfig = useSelector(state => state.appParam.uiconfig, shallowEqual);
  let currentPage = useSelector(state => state.selectedData.pagedata);
  let currentUI = useSelector(state => state.selectedData.uidata);
  let selectedUIs = useSelector(state => state.selectedData.uiparts);
  let targetEditor = useSelector(state => state.selectedData.editor);
  let contentEditorParent = useSelector(state => state.selectedData.editorParent);

  const type = (currentUI && currentUI.hasOwnProperty('viewType')) ? "uipart" : "page";  
  const _pagetype = currentPage['viewType'];
  const _pagelocale = filterLocale_byPageType(_pagetype, pageLocale);
  const _uitype = getUIViewtype(currentUI);
  const _uilocale = filterLocale_byUIType(_uitype, uiLocale);

  const akshay = "kumar";

  //////////////////////

  const handleUpdatePropertyValue = (key, value, source) => {
    props.onPropertyValueChange(props['currentPage'], source);
  };

  //////////////////////
    

    if(!show) {
      return null;
    }
    if(akshay === "" && selectedUIs['length'] > 1) {
      return (
        <div id="multiuisetting" className="vertical-align" style={{minWidth: 368, height:'100%'}}>
          <MultiUISetting appdata={appData} pagedata={currentPage} currentScreenIndex={currentScrIndex}
                          selectedUIparts={selectedUIs} editorContainer={targetEditor} editorParent={contentEditorParent}
                          onSetPropertyValue={handleUpdatePropertyValue} />
        </div>
      );
    }
    //console.log("...... SettingWindow >>>>", currentUI);
  
    return ( 
      <div id="settingwindow" className="vertical-align">
        <SettingPallete source={type} appconfig={appConfig} appdata={appData} currentScreenIndex={currentScrIndex} editorContainer={targetEditor}
                        pageconfig={pageConfig} pagelocale={_pagelocale} pagedata={currentPage} pagetype={_pagetype}
                        uiconfig={uiConfig} uilocale={_uilocale} uidata={currentUI} uitype={_uitype} editorParent={contentEditorParent}
                        onUpdatePropertyValue={handleUpdatePropertyValue} />          
      </div>              
    );

};

function filterLocale_byPageType(pagetype, pagelocale) {
  let pageproperties = pagelocale.filter(function(page) {
    return page['viewType'] === pagetype;
  });  
  if(pageproperties.length > 0) {
    //console.log(openedpage['viewType'], "....Page-Locale >>>", pageproperties[0]);
    return pageproperties[0]['properties'];
  }
  return null;
}

function getUIViewtype(uichild) {
  let uitype = uichild['viewType'];
  if(uitype === 'Button'){
    if(uichild.type === "System"){
      uitype = "SystemButton";
    }else if(uichild.type === "CheckBox"){
      uitype = "CheckBox";
    }else {
      uitype = getButtontype(uichild.buttonType) + 'Button';
    }
  }
  return uitype;
}
function getButtontype(btnType) {
  return btnType.charAt(0).toUpperCase() + btnType.substr(1).toLowerCase();
}

function filterLocale_byUIType(uitype, uilocale) {
  const uicategoryLocale = [(uilocale[0])];
  //console.log(uitype, "....UI-Locale >>>", uilocale);
  let uiproperties = uilocale.filter(function(uipart) {
    return uipart['viewType'] === uitype;
  });  
  if(uiproperties.length > 0) {
    const uipropertiesLocale = uiproperties[0]['properties'];
    let _uiLocale = mergeUILocale(uicategoryLocale, uipropertiesLocale);
    return _uiLocale;//uiproperties[0]['properties'];
  }else {
    return uicategoryLocale;
  }
  //return null;
}
function mergeUILocale(uicategory, uiproperties) {
  if(!uiproperties) return [];
  const _locale = Object.assign({}, uiproperties[0], uicategory[0]);
  return [_locale];
}

 
function SettingPallete(props) {

  const data = (props.source === "page") ? props.pagedata : props.uidata;
  const currentScreenIndex = props.currentScreenIndex;
  if(data.viewType === "ScrollView") {
    data.Children[0].frame = data.Children[0]._frames[props.currentScreenIndex];
  }
  const config = (props.source === "page") ? props.pageconfig : props.uiconfig;
  const locale = (props.source === "page") ? props.pagelocale : props.uilocale;
  //console.log(props.currentScreenIndex, "*******", config, " : SettingPallete >>>> ", data);
  //console.log(props.source, " : SettingPallete >>>> ", data);   
  
  const disableTab = (props.source === "page") ? false : true;

  const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
    },
    settingpallete: {      
      position: 'absolute',
      top: 7,
      maxWidth: 320,
      width: '100%',
      height: `calc(100vh - 105px)`,
      display: 'flex',
      flexDirection: 'column',
      border: '2px solid rgba(189, 189, 189, 1)',
      borderRadius: 8,
      backgroundColor: theme.palette.grey[100],
      boxSizing: 'border-box',
    }, 
    header: {
      display: 'flex',
      height: 32,
      background: theme.palette.background.paper,
      textAlign: 'left',
    },
    heading: {
      width: '100%',
      height: '100%',      
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightMedium,
      paddingTop: theme.spacing(0),
      paddingLeft: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      //borderRight : '1px solid',
      //borderRightColor: theme.palette.grey[500],   
    },
    headericon: {
      padding: theme.spacing(0, 0.5),
    },
    iconbtn: {
      padding: theme.spacing(0.25),
      marginRight: theme.spacing(1),
    },
    popover: {
      marginTop: theme.spacing(0.5),
    },
    popaper: {
      padding: theme.spacing(1),
      backgroundColor: theme.palette.grey[300],
      //width: 360,
    },  
    appbar: {
      position: "absolute", 
      bottom: 1, 
      height: 36,
      zIndex: 0,
    },
    tab: {
      textTransform:'none',
      minWidth:44, 
      width:120,
      backgroundColor: theme.palette.grey[400],
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: theme.typography.pxToRem(15),
    },
    tabpage: {
      textTransform: 'none',
      width: '50%',
      minWidth: 44, 
      minHeight: 36,
      background: theme.palette.background.paper,
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: theme.typography.pxToRem(14),
    },
    tabui: {
      textTransform: 'none',
      width: '100%',
      minWidth: 44,
      maxWidth: 320,
      minHeight: 36,
      background: theme.palette.background.paper,
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: theme.typography.pxToRem(14),
    },
    paper: {
      height: '100%',//680,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      background: theme.palette.background.default
    },
    badge: {
      display: 'flex',
      justifyContent: 'space-between',
      position:'inherit',
    },
    enableuititle: {
      fontSize: theme.typography.pxToRem(12),
      fontWeight: theme.typography.fontWeightBold,
    },
    fab: {
      maxHeight: 32,
      maxWidth: 36,
      margin: theme.spacing(0, 0.25),
      backgroundColor: theme.palette.grey[300],
    },
  }));

  const classes = useStyles(); 

  function getSettingWindowTitle(pageType, pagelocale) {
    let pageTitle;
    if(pagelocale.length > 0) {
      pageTitle = pagelocale[0]['setting'];
      return pageTitle;
    }

    return pageType + "Setting";
  }

  const [anchorDocument, setAnchorDocument] = React.useState(null);
  const openDocument = Boolean(anchorDocument);

  function handleDocumentOpen(event) {
    setAnchorDocument(event.currentTarget);    
  }
  function handleDocumentClose() {
    setAnchorDocument(null);
  }

  const [tabvalue, setTabValue] = React.useState(0);
  React.useEffect(() => {
    setTabValue(0);
  }, [props.source]);

  function handleTabChange(event, newValue) {
    setTabValue(newValue);
  }

  const [expanded, setExpanded] = React.useState('uipanel0'); 
  const handleExpansion = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  /* const getNestedObject = (nestedObj, pathArr, _value) => {
    const nreducer = (acc, _key) => {
      const nobj = nestedObj[acc];
      if(nobj && nobj[_key]) {
        //console.log(nestedObj, nobj, ">> nreducer >>", nobj[_key]);
        nobj[_key] = _value;
      }
      return JSON.parse(JSON.stringify(nestedObj));
    };
    pathArr.reduce(nreducer);
  } */
  function handlePropertyUpdate(property, value) {
    /* if(props.source === "uipart") {

      let targetData = (props.pagedata) ? props.pagedata : data;
      let editorChildrenArr = getChildrenArray(props.editorContainer, props.editorParent, targetData, currentScreenIndex);
      editorChildrenArr.forEach(uichild => {
        let uipart = uichild.uiParts[currentScreenIndex];
        if(uipart['name'] === data['name']+'_akshay') {
          if(property.indexOf(".") > -1 || property.indexOf("[") > -1) {
            property = property.toString().replace(/\[/g,'.').replace(/\]/g,'');
            const _proparr = property.split(".");
            getNestedObject(uipart, _proparr, value);
          }else {
            uipart[property] = JSON.parse(JSON.stringify(data[property]));
          }          
        }
      });
    } */
    props.onUpdatePropertyValue(property, value, props.source);
  }

  function handleEnableUIs(value, dataset) {
    let _container = dataset['container'];
    let _uiname = dataset['name'];    
    
    const uiChildren = getChildrenbyContainer(_container);

    if(uiChildren) {
      uiChildren.forEach(uichild => {
        let uipart = uichild.uiParts[currentScreenIndex];
        if(uipart['name'] === _uiname) {
          uipart['_enabledOnScreen'] = value;
          uipart['hidden'] = !value;
        }
      });
    }

    props.onUpdatePropertyValue("_enabledOnScreen", value, "uipart");
  }

  /************** Show UI Position *******************/

  const [uiposition, setUIPosition] = React.useState('');
  const [anchorPosition, setAnchorPosition] = React.useState(null);
  const showPosition = Boolean(anchorPosition);

  const popoverRef = React.useRef(); // Reference to track the Popover

  // Close Popover if clicked outside
  const handleClickOutside = (event) => {
    if (popoverRef.current && popoverRef.current.contains(event.target)) {
      handlePositionClose();
    }
  };
  
  // Attach click listener to the document when Popover is open
  React.useEffect(() => {
    if (showPosition) {
      document.addEventListener('mousemove', handleClickOutside);
    } else {
      document.removeEventListener('mousemove', handleClickOutside);
    }
    return () => document.removeEventListener('mousemove', handleClickOutside);
  });
  
  function handleUIPosition(event){
    const _dataset = event.currentTarget.dataset;
    
    const uiChildren = getChildrenbyContainer(_dataset['container']);    
    if(uiChildren) {
      const _uiname = _dataset['name'];

      uiChildren.forEach(uichild => {
        let uipart = uichild.uiParts[currentScreenIndex];
        if(uipart['name'] === _uiname) {
          const framePos = "x: " + uipart['frame']['x'] + ", y: " + uipart['frame']['y'];
          setUIPosition(framePos);

          setAnchorPosition(event.currentTarget); 
        }
      });
    }
  }

  function handlePositionClose() {
    setAnchorPosition(null);
  }

  /************** Download UI data *******************/

  function handleUIDownload(event) {
    const _dataset = event.currentTarget.dataset;
    const uiChildren = getChildrenbyContainer(_dataset['container']);    
    if(uiChildren) {
      const _uiname = _dataset['name'];

      uiChildren.forEach(uichild => {
        let uipart = uichild.uiParts[currentScreenIndex];
        if(uipart['name'] === _uiname) {
          console.info(_uiname, " .... handleUIDownload >>>", uipart);

          const fileName = (props.pagedata) ? props.pagedata['Title'] +'_'+ _uiname + '.json' : _uiname + '.json';
          const jsonStr = JSON.stringify(uipart);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();

          URL.revokeObjectURL(url); 
        }
      });
    }
  }

  /*********************************/

  function getChildrenbyContainer(container){
    let uiChildren = [];

    if(container === "toolBarTop"){
      uiChildren = data._toolBarTop[currentScreenIndex].Children;
    }else if(container === "toolBarBottom"){
      uiChildren = data._toolBarBottom[currentScreenIndex].Children;
    }else if(container === "toolBarLeft"){
      uiChildren = data._toolBarLeft[currentScreenIndex].Children;
    }else if(container === "toolBarRight"){
      uiChildren = data._toolBarRight[currentScreenIndex].Children;
    }else if(container === "pageOverlay"){
      uiChildren = data.pageOverlay.Children;
    }
    else {
      if(data.viewType === "BaseView") {
        uiChildren = data.Children;
      }else if(data.viewType === "ScrollView") {
        uiChildren = data.Children[0].Children;
      }else if(data.viewType.indexOf("TableViewList") > -1){
        if(data.Children[0]['_tmpCellStyle'] === "custom") {
          uiChildren = data.Children[0].Group[0]['RecordCellDef']['Fields'];
        }    
      }else if(data['viewType'].indexOf('TableViewNestedList') > -1) {
        if(data.Children[0]['_tmpCellStyle'] === "custom") {
          const mainFields = data.Children[0].Group[0].RecordCellDef.Fields;
          const subFields = data.Children[0].Group[0].SubRecordCellDef.Fields;
          uiChildren = mainFields.concat(subFields);
        }
      }
    }

    return uiChildren;
  }

  function handlePageContainerData(containerData) {
    //console.log(props.source, data, "... containerData >>>>", containerData);
    data['Containers'] = containerData;
  }

  function handleUpdatePageContainerState(containerData) {
    //console.log(data, "... containerData >>>>", containerData);    
    props.onUpdatePropertyValue("Containers", containerData, props.source);
  }

  function handleUIGrouping(groupData) {
    data['parent'] = groupData;

    /* let _container = props.editorContainer;
    let _uiname = data['name'];
    
    let uiChildren = [];
    //console.log(currentScreenIndex, "******", data, "...handle EnableUIs >>> ", _container, _uiname, value);
    if(_container === "toolBarTop"){
      uiChildren = data._toolBarTop[currentScreenIndex].Children;
    }else if(_container === "toolBarBottom"){
      uiChildren = data._toolBarBottom[currentScreenIndex].Children;
    }else if(_container === "toolBarLeft"){
      uiChildren = data._toolBarLeft[currentScreenIndex].Children;
    }else if(_container === "toolBarRight"){
      uiChildren = data._toolBarRight[currentScreenIndex].Children;
    }else if(_container === "pageOverlay"){
      uiChildren = data.pageOverlay.Children;
    }
    else {
      if(data.viewType === "BaseView") {
        uiChildren = data.Children;
      }else if(data.viewType === "ScrollView") {
        uiChildren = data.Children[0].Children;
      }else if(data.viewType.indexOf("TableViewList") > -1){
        if(data.Children[0]['_tmpCellStyle'] === "custom") {
          uiChildren = data.Children[0].Group[0]['RecordCellDef']['Fields'];
        }    
      }
    }

    if(uiChildren) {
      uiChildren.forEach(uichild => {
        let uipart = uichild.uiParts[currentScreenIndex];
        if(uipart['name'] === _uiname) {
          uipart['_enabledOnScreen'] = value;
        }
      });
    } */

    let changeforAllScreen = false;
    let screens = props.appdata['availableScreens'];
    if(screens.length > 1) {      
      const isMasterScreenSet = props.appdata['isMasterScreenSet'];
      let masterScreenIndex = 0;
      screens.forEach((element, i) => {
        if(element['embed']) {
          masterScreenIndex = i;          
        }
      });
      
      if(isMasterScreenSet && currentScreenIndex === masterScreenIndex) {
        changeforAllScreen = true;
      }

      if(changeforAllScreen){
        for(let index=0; index < screens.length; index++) {
          //if(index === currentScreenIndex)  continue;

          let editorChildrenArr = getChildrenArray(props.editorContainer, props.editorParent, props.pagedata, index);
          editorChildrenArr.forEach(uichild => {            
            let uipart = uichild.uiParts[index];
            if(uipart['name'] === data['name']) {
              for(let j=0; j < uichild.uiParts.length; j++) {
                uichild.uiParts[j]['parent'] = groupData;
              }
            }
          });
        }
      }
    }    

    //console.log(currentScreenIndex, props.editorContainer, data, "... groupData >>>>", groupData);
    props.onUpdatePropertyValue("parent", groupData, "uipart");
  }

  if(props.source === "uipart"){
    if(!data.hasOwnProperty('_lockedUI')){
      data['_lockedUI'] = false;
    }
  } 
  let _lockedUI = data['_lockedUI'];
  const [locked, setLocked] = React.useState(_lockedUI);
  React.useEffect(() => {
    setLocked(_lockedUI);
  }, [_lockedUI])
  const handleToggle = () => {
    setLocked((prev) => !prev);

    data['_lockedUI'] = !locked;
    props.onUpdatePropertyValue("_lockedUI", !locked, "uipart");
  };

  const handleDeleteAllUIs = () => {
    const _screenId = props.currentScreenIndex;
    const _pagedata = props.pagedata;

    let containerUIs = [];

    let pageChildren;
    if(_pagedata.viewType === "BaseView"){
      pageChildren = _pagedata.Children;
    }else if(_pagedata.viewType === "ScrollView" || _pagedata.viewType === "PageScrollView"){
      pageChildren = _pagedata.Children[0].Children;
    }else if(_pagedata.viewType.indexOf("TableViewList") > -1){
      if(_pagedata.Children[0]['_tmpCellStyle'] === "custom") {
        pageChildren = _pagedata.Children[0].Group[0]['RecordCellDef']['Fields'];
        //pageChildren = _pagedata.Children[0].Group[0]['rowarray'][0]['Fields'];
      }    
    }

    const containerUIparts = ['TileList', 'ExpansionPanel', 'DataGrid', 'Popover', 'SwipeableView'];    

    pageChildren.forEach(uiContainerDic => {
      let targetUI = uiContainerDic['uiParts'][_screenId];
      const containerIndex = containerUIparts.indexOf(targetUI['viewType']);
      if(containerIndex > -1){
        containerUIs.push(targetUI);
      }
      targetUI['_enabledOnScreen'] = false;
      targetUI = {};
    });
    
    let ttopChildren = _pagedata._toolBarTop[_screenId].Children;
    ttopChildren.forEach(uiContainerDic => {
      let targetUI = uiContainerDic['uiParts'][_screenId];
      const containerIndex = containerUIparts.indexOf(targetUI['viewType']);
      if(containerIndex > -1){
        containerUIs.push(targetUI);
      }
      targetUI['_enabledOnScreen'] = false;
      targetUI = {};
    });
    let tbottomChildren = _pagedata._toolBarBottom[_screenId].Children;
    tbottomChildren.forEach(uiContainerDic => {
      let targetUI = uiContainerDic['uiParts'][_screenId];
      const containerIndex = containerUIparts.indexOf(targetUI['viewType']);
      if(containerIndex > -1){
        containerUIs.push(targetUI);
      }
      targetUI['_enabledOnScreen'] = false;
      targetUI = {};
    });
    let tleftChildren = _pagedata._toolBarLeft[_screenId].Children;
    tleftChildren.forEach(uiContainerDic => {
      let targetUI = uiContainerDic['uiParts'][_screenId];
      const containerIndex = containerUIparts.indexOf(targetUI['viewType']);
      if(containerIndex > -1){
        containerUIs.push(targetUI);
      }
      targetUI['_enabledOnScreen'] = false;
      targetUI = {};
    });
    let trightChildren = _pagedata._toolBarRight[_screenId].Children;
    trightChildren.forEach(uiContainerDic => {
      let targetUI = uiContainerDic['uiParts'][_screenId];
      const containerIndex = containerUIparts.indexOf(targetUI['viewType']);
      if(containerIndex > -1){
        containerUIs.push(targetUI);
      }
      targetUI['_enabledOnScreen'] = false;
      targetUI = {};
    });

    let overlayChildren =  _pagedata.pageOverlay.Children;
    overlayChildren.forEach(uiContainerDic => {
      let overlayUI = uiContainerDic['uiParts'][_screenId];
      overlayUI['_enabledOnScreen'] = false;
      if( overlayUI['viewType'] === "Dialog"){        
        overlayUI['dataarray'] = [{"id":0, "name":"Dialog-1", "columns": 1, "rows":1, "gap":1, "height":400, "CellStyle": "custom", "Fields":[]}];
      }else {
        overlayUI['dataarray'] = [{"columns": 1, "rows":1, "gap":1, "height":300, "CellStyle": "custom", "Fields":[]}];
      }
      /*let overlayUIChildren = overlayUI['dataarray'];
      for (let i = 0; i < overlayUIChildren.length; i++) {
        const overlayFields = overlayUIChildren[i]['Fields'];
        overlayFields.forEach(uiDic => {
          let targetUI = uiDic['uiParts'][_screenId];
          const containerIndex = containerUIparts.indexOf(targetUI['viewType']);
          if(containerIndex > -1){
            containerUIs.push(targetUI);
          }
          targetUI['_enabledOnScreen'] = false;
          targetUI = {};
        });        
      }*/
      
      overlayUI = {};
    });

    for (let index = 0; index < containerUIs.length; index++) {
      const element = containerUIs[index];
      if(element['viewType'] === "TileList"){
        element['dataarray'] = [{"columns": 1, "rows":1, "gap":4, "CellStyle": "custom", "Fields":[], "width":300, "height":110}];
      }
      else if(element['viewType'] === "ExpansionPanel"){
        element['panelItems'] = [{
          "id":0,
          "expanded": true,
          "showheader": true,
          "heading": "Heading",
          "subheading": "",
          "headerimage": {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""},
          "Fields": [],
          "height": 260
        }];
      }
      else if(element['viewType'] === "SwipeableView"){
        element['swipeableItems'] = [{"id":0, "Fields":[]}];
      }
      else if(element['viewType'] === "DataGrid"){
        element['dataCols'] = [{
          "id": 0,
          "fieldname": "",
          "heading": "",
          "width": 100,
          "isSortable": false,
          "isCollapsible": false,
          "isCustom": false,
          "Fields": [],
          "isCustomHeader": false,
          "headerFields": [],
          "isInclude": true                  
        }];
      }else if(element['viewType'] === "Popover"){
        element['dataarray'] = [{"columns": 1, "rows":1, "gap":1, "height":300, "CellStyle": "custom", "Fields":[]}];
      }
      
    }

    console.log(_screenId, containerUIs, "..... handleDeleteAllUIs >>>>>>.", _pagedata);
    props.onUpdatePropertyValue("", "", "page");
  };


  return (
      
    <Box id="settingpallete" className={classes.settingpallete} >
      <div className={classes.header}>
        <strong className={classes.heading}>{getSettingWindowTitle(data.viewType, locale)}</strong> 
        {props.source === "uipart" &&  
          <Tooltip title="On lock, will disable move & resizing of UI on page layout area">
            <IconButton onClick={handleToggle} color={locked ? 'primary' : 'default'}>
              {locked ? <LockIcon /> : <LockOpenIcon />}
            </IconButton>
          </Tooltip> 
        }
        <Tooltip title="Document">
          <IconButton edge="end" color="inherit" className={classes.iconbtn} aria-label="Help" onClick={handleDocumentOpen}>
            <NotesIcon />
          </IconButton>
        </Tooltip>
        <Popover id="document-popover" className={classes.popover} classes={{paper: classes.popaper}}
                open={openDocument} anchorEl={anchorDocument} onClose={handleDocumentClose}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right',}}
                transformOrigin={{vertical: 'top', horizontal: 'right',}}
        >
          <Paper id="pagedocs" className={classes.paper} elevation={0}>
            <table className="tg">
              <thead>
                <tr>
                    <th width="120px">Key</th>
                    <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {data.Document.map((docs, index) => (
                    <tr key={index}>
                        <td > {docs.key} </td>
                        <td > {docs.value} </td>
                    </tr>
                ))}
              </tbody>
            </table>              
          </Paper>
        </Popover>
      </div>       
      <div className={classes.root}>       
        {props.source === "page" &&    
          <AppBar position="static" color="default" className={classes.appbar}>
            <Tabs value={tabvalue} onChange={handleTabChange} indicatorColor="primary" style={{minHeight:36}} >
              <Tab wrapped label="Properties" className={classes.tabpage} />
              <Tab wrapped label="UI Parts" className={classes.tabpage} disabled={disableTab} />
              <Tab wrapped label="Group(s)" className={classes.tabpage} style={{'display':'none'}} />
            </Tabs>
          </AppBar>
        }
        {props.source === "uipart" &&  
          <AppBar position="static" color="default" className={classes.appbar}>
            <Tabs value={tabvalue} onChange={handleTabChange} indicatorColor="primary" >
              <Tab wrapped label="Properties" className={classes.tabui} />
              <Tab wrapped label="Group(s)" className={classes.tabui} style={{'display':'none'}} />
            </Tabs>
          </AppBar>
        }
        {tabvalue === 0 && 
          <TabContainer>
            <Paper id="pageproperties" className={classes.paper}>
              {props.source === "page" &&               
                <PropertyValueEditor show={true} editor={props.source}
                                    data={data} viewType={data.viewType} config={config} locale={locale} screenIndex={currentScreenIndex}
                                    onPropertyEdit={handlePropertyUpdate} />
              }
              {props.source === "uipart" &&               
                <PropertyValueEditor show={true} editor={props.source}
                                    data={props.uidata} viewType={props.uitype} config={config} locale={locale} screenIndex={currentScreenIndex}
                                    onPropertyEdit={handlePropertyUpdate} />
              }
            </Paper>                  
          </TabContainer>
        }
        {(tabvalue === 1 && props.source === "page") &&
          <TabContainer style={{height: `calc(100% - 90px)`}}>
            <div className='horizontal-align' style={{justifyContent:'space-between'}}>
              <Typography variant='caption' style={{padding:'0px 8px'}} >Uncheck to remove UI-part(s) from page data</Typography>
              <Tooltip title="Remove/ Disable all UI-parts from page for current screen">
                <IconButton style={{border:'1px solid', marginBottom:1}} size='small' color='primary' onClick={handleDeleteAllUIs}>
                  <DeleteIcon/>
                </IconButton>
              </Tooltip>
            </div>
            <Paper id="pageuis" className={classes.paper} style={{height: `calc(100% - 36px)`}}>
              {getUIEnabledState(data, currentScreenIndex).map((item, index) => 
                <Accordion key={'uipanel'+index} expanded={expanded === 'uipanel'+index} onChange={handleExpansion('uipanel'+index)}>
                  <AccordionSummary id="panela-header" aria-controls="panela-content" expandIcon={<ExpandMoreIcon />} >
                    <StyledBadge color="primary" invisible={false} badgeContent={item.data.length} className={classes.badge} >
                      <Typography className={classes.enableuititle} >{item.title}</Typography>
                    </StyledBadge>                          
                  </AccordionSummary>
                  <AccordionDetails>                                                               
                    {item.data.map((uis, _index) => (
                      <div key={_index} className="vertical-align">                        
                        <div  className="horizontal-align" style={{maxHeight: 28}}>
                          <CheckBoxForm value={uis.enabled} label={uis.name + ' (' + uis.type + ')'}
                                        source="enableui" dependentActions={uis} onValueChange={handleEnableUIs} />
                          <Typography variant="caption" gutterBottom >{uis.name + ' (' + uis.type + ')'}</Typography>
                          <IconButton style={{padding:4, marginLeft:'auto'}} color="default" data-container={uis.container} data-name={uis['name']}
                                      onClick={handleUIPosition}>
                            <LocationIcon />
                          </IconButton>
                          <Popover id="position-popover" elevation={2} className={classes.popover} classes={{paper: classes.popaper}}
                                  open={showPosition} anchorEl={anchorPosition} onClose={handlePositionClose}
                                  anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                                  transformOrigin={{vertical: 'top', horizontal: 'right'}}
                                  ref={popoverRef}
                          >
                            <Typography variant='subtitle2' id="uiposition">{uiposition}</Typography>
                          </Popover>
                          <IconButton style={{padding:4, marginLeft:8}} color="default" data-container={uis.container} data-name={uis['name']}
                                      onClick={handleUIDownload}>
                            <DownloadIcon />
                          </IconButton>
                        </div>
                        {(uis.children.length > 0)  && 
                          <table className="tg" style={{width:280, tableLayout:'fixed'}}> 
                            <thead>
                              <tr>
                                <th width="16px">#</th>
                                <th>UI Name (Type)</th>
                                <th width="60px">Enabled</th>
                              </tr>
                            </thead>               
                            <tbody>
                              {uis.children.map((vobj, index) => (
                                <tr key={index}>
                                  <td> {(index+1)} </td>
                                  <td style={{textAlign:'start', wordBreak:'break-all', fontSize:12}} > {vobj.name +' ('+ vobj.type +')'} </td>
                                  <td> {vobj.enabled.toString()} </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        }
                      </div>                          
                    ))}    
                  </AccordionDetails>
                </Accordion>    
              )}
            </Paper>
          </TabContainer>                
        }                                
        {tabvalue === 2 && 
          <TabContainer >
            <Paper id="pagecontainers" className={classes.paper}>
              {props.source === "page" && 
                <PageGroupSetting pagedata={data} data={data.Containers} 
                                  onUpdateContainers={handlePageContainerData} onUpdatePageContainerState={handleUpdatePageContainerState}/>
              }
              {props.source === "uipart" &&
                <UIGroupSetting pagedata={props.pagedata} data={data} onUpdateUIGrouping={handleUIGrouping}/>
              }
            </Paper>            
          </TabContainer>
        }
      </div>   
        
    </Box>   
  );
}

function PageGroupSetting(props) {
  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      //margin: 8
    },
    forrmgroup: {
      width: '100%', 
      flexDirection: 'row', 
      //border: '1px solid #ced4da', 
      borderRadius: 4
    },
    listheader: {
      backgroundColor: 'rgb(224,224,224)',
      fontWeight: 'bold',
      textAlign: 'start'
    },
    grouplist: {
      width: '100%',
      minHeight: 160,
      maxHeight: 250,
      overflow: 'hidden auto', 
      margin: 8,
      border: '1px solid #ced4da',
    },
    btnadd:{
      width: '100%', 
      height: 40, 
      margin: 8,
      textTransform: 'none'
    },    
    customactiontitlediv: {
      width:'100%',
      height: 40,
      backgroundColor: theme.palette.grey[400],
      padding: '0px 4px', 
      margin: 8,
      borderRadius: 4,
      display:'flex',
      alignItems: 'center',
      //justifyContent: 'space-around'
    },
    fabbtn: {
      maxWidth: 32,
      minHeight: 20, maxHeight: 32,
      margin: theme.spacing(0.125),
      marginLeft: theme.spacing(0.5),
      padding: 2
    },
    customactiondiv: {
      width:'100%',
      padding:2, 
      display:'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    applycustombtn: {
      minWidth: 48,
      height: 20,
      textTransform: 'none',
      padding: 4,
      borderRadius: 12,
    },
    helptext: {
      textAlign: 'start',
      margin: theme.spacing(0, 6),
      padding: theme.spacing(0.5),
      color: theme.palette.common.white,
      backgroundColor: theme.palette.grey[600],
      border: '2px solid rgb(227,227,227)',
      borderRadius: 8,
      position: 'absolute',
      top: 16,
      right: 0,
      zIndex: 1
    },
    iconbtn: {
      position: 'absolute',
      top: 8,
      right: 24,
      zIndex: 1
    },
    titletext: {
      marginRight: 8,
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }));

  const classes = useStyles(); 
  const [containerData, setPageContainerData] = React.useState(props.data);
  React.useEffect(() => {
    setPageContainerData(props.data);
  }, [props.data])
  const [checked, setChecked] = React.useState(getPageContainerState(containerData));
  //console.log(props.pagedata['Title'], "containerData >>>>", props.data, containerData);  

  const [showHelp, setShowHelp] = React.useState(false);
  function handleHelpText(event) {     
    setShowHelp(!showHelp);
  }

  const [isPageContainerTitle, showPageContainerTitle] = React.useState(false);
  const [containerItemTitle, setPageContainerTitle] = React.useState('');
  const [customTitleError, setContainerTitleError] = React.useState('');
  const [pageTitle, setpageTitle] = React.useState('');
  React.useEffect(() => {
    //console.log(props.pagedata['Title'], "...pageTitle >>>", pageTitle);
    if(pageTitle !== props.pagedata['Title']) {
      showPageContainerTitle(false);
      setPageContainerTitle('');
    }
  }, [pageTitle, props.pagedata]) 

  function handleAddPageContainerObject() {
    setpageTitle(props.pagedata['Title']);
    showPageContainerTitle(true);
  } 

  function handlePageContainerTitle(event) {
    const val = event.target.value;
    
    const isValid = validatePageContainerTitle(val);
    if(isValid) {
      setPageContainerTitle(val);
      setContainerTitleError('');
    }
  }
  function validatePageContainerTitle(title) {
    if(title.length > 0) {
      const allowedChars = /\w/g;
      let allowedTitle = title.match(allowedChars);
      if(!allowedTitle) {
        setContainerTitleError("Only alphabets, numbers & underscore allowed.");
        return false;
      }
      if(allowedTitle && (title.length !== allowedTitle.length)) {
        setContainerTitleError("Only alphabets, numbers & underscore allowed.");
        return false;
      }        
    }
    return true;
  }

  function handleSetPageContainerObject() {  
    if(containerItemTitle.length === 0){
      setContainerTitleError("Title is required");
      return;
    }   
    let containerItems = JSON.parse(JSON.stringify(containerData));
    if(containerItems && containerItems.length > 0) {
      for (let i = 0; i < containerItems.length; i++) {
        const itemObj = containerItems[i];
        if(itemObj['title'] === containerItemTitle) {
          setContainerTitleError("Title already exist");
          return;
        } 
      }
    }
    
    if(!editTitle) {
      /* const itemName = 'container'+ (containerItems.length + 1);
      const containerItem = {name:itemName, title:containerItemTitle, selected:true};
      containerItems.push(containerItem);

      let checkedArr = checked;
      checkedArr.push(true);
      setChecked(checkedArr); */

      const lastIndex = containerItems.length - 1;
      const lastObjName = containerItems[lastIndex]['name'];
      const lastObjIndex = parseInt(lastObjName.replace("container",""));
      const itemName = 'container'+ (lastObjIndex + 1);
      const containerItem = {name:itemName, title:containerItemTitle, selected:true};
      containerItems.push(containerItem);

      let checkedArr = [];
      for (let i = 0; i < containerItems.length; i++) {
        checkedArr.push(containerItems[i]['selected']);
      }
      setChecked(checkedArr);

    }else {
      //console.log(editItemIndex, "..editTitle..", containerData[editItemIndex]['title'], "*****", containerItemTitle);
      if(containerData[editItemIndex]) {
        const editItem = {name:containerData[editItemIndex]['name'], title:containerItemTitle, selected:containerData[editItemIndex]['selected']};
        containerItems.splice(editItemIndex, 1, editItem);
      }

      setEditItemIndex(-1);
      setEditTitle(false);
    }
    //console.log( "**add***", containerItems);
    setPageContainerData(containerItems);
    props.onUpdateContainers(containerItems);

    setContainerTitleError('');
    showPageContainerTitle(false);
    setPageContainerTitle('');
  }

  function handleCancelPageContainerObject() {
    showPageContainerTitle(false);
    setPageContainerTitle('');
    setContainerTitleError('');
    if(editTitle) {
      setEditItemIndex(-1);
      setEditTitle(false);
    }
  }

  function handleCloseContainerTitleError() {
    setContainerTitleError('');
  }
  
  const handleToggle = (value, index) => () => {
    const newChecked = [...checked];
    /* const currentIndex = checked.indexOf(value);
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    } */
        
    let currentval = newChecked[index];
    newChecked[index] = !currentval;
    containerData[index]['selected'] = !currentval;

    console.log(index, value, "handleToggle>>>", newChecked);
    setChecked(newChecked);
    props.onUpdatePageContainerState(containerData);
  };

  const [editItemIndex, setEditItemIndex] = React.useState(-1);
  const [editTitle, setEditTitle] = React.useState(false);
  function handleEditContainerItem(event) {
    const _dataset = event.currentTarget.dataset;

    const _editIndex = parseInt(_dataset['index']);
    setEditItemIndex(_editIndex);
    
    const _editTitle = containerData[_editIndex]['title'];
    setPageContainerTitle(_editTitle);

    showPageContainerTitle(true);
    setEditTitle(true);
  }

  function handleDeleteContainerItem(event) {
    const _dataset = event.currentTarget.dataset;
    //console.log(containerData, "... Delete ContainerItem ...", _dataset);
    const _delIndex = parseInt(_dataset['index']);

    let containerItems = JSON.parse(JSON.stringify(containerData));
    if(containerItems && containerItems.length > 0) {
      for (let i = 0; i < containerItems.length; i++) {
        let itemObj = containerItems[i];
        /* if(i === _delIndex && itemObj['name'] === _dataset['name']) {
          containerItems.splice(i,1);
          //console.log("reomve itemObj ...", i);
          i--;
        }else if(i >= _delIndex) {
          const itemName = 'container'+ (i+1);
          itemObj['name'] = itemName;
        } */

        if(i === _delIndex && itemObj['name'] === _dataset['name']) {
          containerItems.splice(i,1);
        }
      }
    }

    //console.log("delete ....", containerItems);
    let checkedArr = [];
    for (let j = 0; j < containerItems.length; j++) {
      checkedArr.push(containerItems[j]['selected']);
    }
    setChecked(checkedArr);

    setPageContainerData(containerItems);
    props.onUpdateContainers(containerItems);
  }

  return (
      
    <Box className={classes.root} >
      <FormGroup className={classes.forrmgroup}>        
        <List component="nav" dense={true} className={classes.grouplist}
          subheader={
              <ListSubheader component="div" className={classes.listheader}>
                Group Items
              </ListSubheader>
          }
        >
          {containerData.map((item, index) => (            
            <ListItem key={index} button dense style={{height:32}}>
              <ListItemIcon style={{minWidth:30}}>
                <Checkbox edge="start" disableRipple tabIndex={-1} color="default" style={{padding:4}}
                          checked={item['selected']} onChange={handleToggle(item['selected'], index)}
                />
              </ListItemIcon>              
              <ListItemText primary={item['title']} className={classes.titletext} />
              <ListItemSecondaryAction >
                <IconButton edge="end" style={{padding:4}} aria-label="Edit" data-index={index} data-name={item['name']}
                            onClick={handleEditContainerItem}>
                  <EditIcon />
                </IconButton>
                {index > 0 && 
                  <IconButton edge="end" style={{padding:4, marginLeft:6}} data-index={index} data-name={item['name']}
                              onClick={handleDeleteContainerItem}>
                    <DeleteIcon/>
                  </IconButton>           
                }
              </ListItemSecondaryAction>            
            </ListItem>          
          ))}        
        </List>
        {showHelp && 
          <Typography variant="caption" className={classes.helptext}>
            Un-check any item will hide ui-part(s) within that group
          </Typography>
        }
        <IconButton edge="end" color="inherit" className={classes.iconbtn} onClick={handleHelpText}>
          <HelpIcon />                  
        </IconButton>
        {!isPageContainerTitle && 
          <Button variant="contained" color="default" className={classes.btnadd} onClick={handleAddPageContainerObject} >
            Add Page Group Item
          </Button>
        }
        {isPageContainerTitle && 
          <div className={classes.customactiontitlediv}>
            <Typography variant="subtitle1" style={{color: 'white', fontWeight:'bold'}}>Title*:</Typography>
            <input name="custom-title" autoFocus type="text" required style={{width: '100%', height:24}} value={containerItemTitle} onChange={handlePageContainerTitle} />
            <Fab color="default" size="small" aria-label="Delete Container" className={classes.fabbtn}>
              <DoneIcon onClick={handleSetPageContainerObject}/>
            </Fab>
            <Fab color="default" size="small" aria-label="Delete Container" className={classes.fabbtn}>
              <CloseIcon onClick={handleCancelPageContainerObject}/>
            </Fab>                          
          </div>                      
        }
        {(customTitleError.length > 0) && 
          <Snackbar
              open={true} onClose={handleCloseContainerTitleError}
              anchorOrigin={{ vertical: 'bottom',  horizontal: 'right', }}
              message={customTitleError}
              action={
                <React.Fragment>
                  <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseContainerTitleError}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
          />
        }
      </FormGroup>
    </Box>
  );
}
function getPageContainerState(containerData) {
  let state = [];
  for (let i = 0; i < containerData.length; i++) {
    const element = containerData[i];
    state.push(element['selected']);    
  }
  return state;
}

function UIGroupSetting(props) {
  const useStyles = makeStyles(theme => ({
    root: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      //margin: 8
    },
    heading: {
      display: 'flex',
      alignItems: 'center',
      height: 48,
      padding: '0px 8px',
      margin: 8,
      marginBottom: 0,
      backgroundColor: 'rgb(224,224,224)',
      color: 'rgba(0, 0, 0, 0.54)',
      fontWeight: 'bold',
      textAlign: 'start',
    },
    formgroup: {
      //width: '100%', 
      //flexDirection: 'row',
      flexWrap: 'nowrap', 
      minHeight: 160,
      maxHeight: 250,
      overflow: 'hidden auto', 
      border: '1px solid #ced4da',      
      margin: 8,
      marginTop: 0,
      padding: '0px 16px',
    },
    helptext: {
      textAlign: 'start',
      margin: theme.spacing(0, 6),
      padding: theme.spacing(0.5),
      color: theme.palette.common.white,
      backgroundColor: theme.palette.grey[600],
      border: '2px solid rgb(227,227,227)',
      borderRadius: 8,
      position: 'absolute',
      top: 16,
      right: 0,
    },
    iconbtn: {
      position: 'absolute',
      top: 8,
      right: 24,
    },
    groupitem: {
      height: 32,
      overflow: 'hidden',
    }
  }));

  const classes = useStyles();

  const pageConatiners = props.pagedata['Containers'];
  const [containerData, setPageContainerData] = React.useState(pageConatiners);
  React.useEffect(() => {
    setPageContainerData(pageConatiners);
  }, [pageConatiners])  
  
  const uiParent = props.data['parent'];
  const _uiParent = ['container1'];
  const [checked, setChecked] = React.useState(_uiParent);
  
  const handleChangeValue = (value) => () => {
    const _checked = uiParent.split(",");
    const newChecked = [..._checked];
    const currentIndex = _checked.indexOf(value);
    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    if(newChecked.length === 0){
      newChecked.push(value);
    }
    const sortchecked = newChecked.sort(function(a, b){return parseInt(a.replace("container",""))-parseInt(b.replace("container",""))});
    console.log(checked, "handleToggle>>>", newChecked, sortchecked);
    setChecked(sortchecked);
    
    props.onUpdateUIGrouping(sortchecked.join());
  };

  const [showHelp, setShowHelp] = React.useState(false);
  function handleHelpText(event) {     
    setShowHelp(!showHelp);
  }

  return (
    <Box className={classes.root} >
      <Typography variant="subtitle2" className={classes.heading}>Set Group :</Typography>
      {showHelp && 
        <Typography variant="caption" className={classes.helptext}>
          One group need to be remain selected
        </Typography>
      }
      <IconButton edge="end" color="inherit" className={classes.iconbtn} onClick={handleHelpText}>
        <HelpIcon />                  
      </IconButton>
      <FormGroup className={classes.formgroup}>
        {uiParent && containerData.map((option,id) =>
          <FormControlLabel key={id} className={classes.groupitem}
                            label={<Typography variant="body2" noWrap={true} >{option['title']}</Typography>}
                            control={
                              <Checkbox disableRipple className={classes.radio} color="default" checked={uiParent.split(",").indexOf(option['name']) !== -1} 
                                        onChange={handleChangeValue(option['name'])} />
                            }
          />
        )}
      </FormGroup>
    </Box>
  );
}

function MultiUISetting(props) {

  const useStyles = makeStyles(theme => ({
    root: {
      display: 'flex',
    },
    settingpallete: {      
      position: 'absolute',
      top: 7, right: 10,
      width: 360,
      height: `calc(100vh - 105px)`, 
      //maxHeight:800, 
      display: 'flex',
      flexDirection: 'column',
      border: '2px solid rgba(189, 189, 189, 1)',
      borderRadius: 8,
      backgroundColor: theme.palette.grey[100],
    }, 
    header: {
      display: 'flex',
      height: 32,
      backgroundColor: 'rgba(189, 189, 189, 1)',
      textAlign: 'left',
    },    
    heading: {
      width: '100%',
      height: '100%',      
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
      paddingTop: theme.spacing(0),
      paddingLeft: theme.spacing(2),
      display: 'flex',
      alignItems: 'center',
      borderRight : '1px solid',
      borderRightColor: theme.palette.grey[500],   
    },
    headericon: {
      padding: theme.spacing(0, 0.5),
    },
    messagebox: {
      display: 'flex',
      //height: 64,
      backgroundColor: theme.palette.grey[300],
      textAlign: 'left',
      margin: theme.spacing(0.5),
      padding: theme.spacing(1),
      border: '1px solid',
      borderRadius: theme.spacing(0.5),
    },
    message: {
      width: '100%',
      height: '100%',      
      //fontSize: theme.typography.pxToRem(15),
      lineHeight: '1.4',
    },
    settingbox: {
     //height: '100%',
      height: `calc(100% - 125px)`,
      backgroundColor: theme.palette.common.white,
      margin: theme.spacing(0.5),
      marginTop: theme.spacing(0),
      padding: theme.spacing(1),
      border: '1px solid',
      borderRadius: theme.spacing(0.5),
    },
    buttonbox: {      
      height: 40,
      margin: theme.spacing(0.5),
      marginTop: theme.spacing(0),
      padding: theme.spacing(1),
      border: '1px solid',
      borderRadius: theme.spacing(0.5),
      display: 'none',
    },
    button: {
      width: '100%',
      height: 32,
      padding: theme.spacing(1),
      textTransform: 'none',
      fontSize: '0.9375rem',
    },
    appbar: {
      position: "absolute", 
      top: 'auto',
      bottom: 15, 
      height: 48,
      zIndex: 0,
      width: 333,
    },
    tab: {
      textTransform:'none',
      minWidth: 44, 
      width: '50%',
      backgroundColor: theme.palette.grey[400],
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: theme.typography.pxToRem(15),
    },
    paper: {
      height: `calc(100% - 48px)`,
      overflow: 'auto',
    },    
    propform: {
      width:'100%', 
      maxWidth: 335,
      height: 32, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'start', 
    },
    propset: {
      textAlign: 'start',
      marginBottom: theme.spacing(1),
    },
    propkey: {
      width: 150,
      maxHeight: 24,
      textAlign: 'start',
    },
    rbgroup: {
      width: 130,
      border: '1px solid #ced4da',
      borderRadius: 4,
      padding: theme.spacing(0,0.5),
    },
    rblabel: {
      height: 28,
    },
    select: {
      width: 143,
      height: 28,
      border: '1px solid',
      borderRadius: theme.spacing(0.5),
      fontSize: '0.9375rem'
    },
    uitable: {
      marginTop: theme.spacing(1),
    },
  }));

  const classes = useStyles(); 

  const selectedUIparts = props['selectedUIparts'];
  const currentScreenIndex = props['currentScreenIndex'];

  const [mtabvalue, setMTabValue] = React.useState(0);
  function handleMTabChange(event, newValue) {
    setMTabValue(newValue);
  }

  const predefinedFonts = ["system", "Amazon Ember", "Roboto", "Noto Sans"];
  const [fontname, setFontName] = React.useState('system');
  const [textalign, setTextAlign] = React.useState('');
  const [verticalalign, setVerticalAlign] = React.useState(''); 

  function handleChangePropertyValue(event, propkey) {
    let updatedValue = event.currentTarget.value;
    //console.log(updatedValue, event.currentTarget['type'], ".. handleChangePropertyValue >>", propkey);    

    const elemType = event.currentTarget['type'];
    if(elemType && elemType === "checkbox") {
      updatedValue = Boolean(event.currentTarget.checked);

    }else if(elemType && elemType === "radio") {
      const elemName = event.currentTarget['name'];
      if(elemName === "textalign") {
        setTextAlign(updatedValue);
      }else if(elemName === "verticalalign") {
        setVerticalAlign(updatedValue);
      }    
    }else if(elemType && elemType.indexOf("select") > -1) {
      setFontName(updatedValue);
    }

    updateSelectedUIProperties(propkey, updatedValue);
  }
  function handleChangeColorValue(newvalue, propkey) {
    updateSelectedUIProperties(propkey, newvalue);
  }
  function handleChangeNumValue(newvalue, propkey) {
    updateSelectedUIProperties(propkey, newvalue);
  }

  function updateSelectedUIProperties(propkey, propVal) {
    let editorChildrenArr = [];
    let changeforAllScreen = false;
    let screens = props.appdata['availableScreens'];
    if(screens.length > 1) {      
      const isMasterScreenSet = props.appdata['isMasterScreenSet'];
      let masterScreenIndex = 0;
      screens.forEach((element, i) => {
        if(element['embed']) {
          masterScreenIndex = i;          
        }
      });
      
      if(isMasterScreenSet && currentScreenIndex === masterScreenIndex) {
        changeforAllScreen = true;
      }
      editorChildrenArr = getChildrenArray(props.editorContainer, props.editorParent, props.pagedata, currentScreenIndex);      
    }

    selectedUIparts.forEach(element => {
      const uipart = element['UI'];
      let slaveuipartArr;
      let slaveuipart;
      if(changeforAllScreen && editorChildrenArr.length > 0){        
        slaveuipartArr = getSlaveUIpart(editorChildrenArr, uipart, 1);
        slaveuipart = slaveuipartArr[1];        
      }

      if(propkey.indexOf('-') > -1) {
        let propdic = propkey.split('-')[0];
        let property = propkey.split('-')[1];
        if(propdic === "font") {
          if(uipart.hasOwnProperty('normalFont')) {
            uipart['normalFont'][property] = propVal;
            if(slaveuipart) slaveuipart['normalFont'][property] = propVal;
          }else if(uipart.hasOwnProperty('font')) {
            uipart['font'][property] = propVal;
            if(slaveuipart) slaveuipart['font'][property] = propVal;
          }          
        }else {
          uipart[propdic][property] = propVal;
          if(slaveuipart) slaveuipart[propdic][property] = propVal;
        }

      }else {
        if(uipart.hasOwnProperty(propkey)) {
          if(propkey.indexOf('Color') > -1){
            uipart[propkey] = setColorDic(propVal);
            if(slaveuipart) slaveuipart[propkey] = setColorDic(propVal);
          }else {
            uipart[propkey] = propVal;
            if(slaveuipart) slaveuipart[propkey] = propVal;
          }
        }
      }   
      
      //console.log(props.editorContainer, editorChildrenArr, ".. handleChangePropertyValue >>", slaveuipart);
      if(slaveuipart) {
        updateSlaveScreenDef(props.editorContainer, props.pagedata, 1, props.editorParent, slaveuipartArr, slaveuipart);
      }
    });    
    
    //console.log(props, selectedUIparts, ".. handleChangePropertyValue >>", propkey, propVal);
    props.onSetPropertyValue(propkey, propVal, "uipart");
  }

  function updateSlaveScreenDef(targetEditor, currentPage, scrIndex, editorParent, updatedUIDef, dataObj) {
    if(targetEditor) {
          
      if(targetEditor === "tablecell") {
        const _pageObj  = currentPage;
        if(_pageObj.Children[0].Group[0]['RecordCellDef']['CellStyle'] === "custom") { 
          _pageObj.Children[0].Group[0]['rowarray'][0]['Fields'] = _pageObj.Children[0].Group[0]['RecordCellDef']['Fields'];          
        }
      
      }else if(targetEditor.indexOf("Toolbar") > -1) {
        let barType;
        if(targetEditor === "topToolbar")           barType = "_toolBarTop";
        else if(targetEditor === "bottomToolbar")   barType = "_toolBarBottom";
        else if(targetEditor === "leftToolbar")     barType = "_toolBarLeft";
        else if(targetEditor === "rightToolbar")    barType = "_toolBarRight";

        const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
        //const toolbarChildren = JSON.parse(JSON.stringify(sourceChildrenArr));        
          
        const i = scrIndex;
        let _slaveScreen_toolbarChildren = currentPage[barType][i]['Children'];
        for (let index = 0; index < _slaveScreen_toolbarChildren.length; index++) {
          const uidef = _slaveScreen_toolbarChildren[index];
          let uidefparts = uidef['uiParts'];
          //if(uidefparts && (uidefparts[i]['name'] === dataObj['name'])) {  
          if((uidefparts[i]['name'] === dataObj['name']) && (uidefparts[i]['viewType'] === dataObj['viewType'])) {            
            //console.log(_updatedUIDef, index, uidef, "........ _slaveScreen_toolbarChildren >>>>", uidefparts, _slaveScreen_toolbarChildren);
            uidef['uiParts'] = _updatedUIDef;
            if(uidef['uiParts'][i] && uidef['uiParts'][i]['frame']) {
              uidef['uiParts'][i]['frame'] = uidefparts[i]['frame'];
            }
            break;
          }                
        }        
        console.log(currentPage, barType, "........ updateAllScreensData >>>>", _updatedUIDef, _slaveScreen_toolbarChildren);

      }else if(targetEditor === "TileList") {

        const sourceUI = editorParent['ui'];
        let tilelistUI;
        let _pageUIs = getAllChildrenOnPage(currentPage, currentScreenIndex);
        _pageUIs.forEach(uipart => {
          if(uipart['viewType'] === "TileList" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
            tilelistUI = uipart;
          }
        });

        const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
        if(_updatedUIDef && _updatedUIDef.length > 0) {         
            
          const k = scrIndex;
          let _slaveScreen_tilelistChildren = tilelistUI['uiParts'][k]['dataarray'][0]['Fields'];              
          for (let index = 0; index < _slaveScreen_tilelistChildren.length; index++) {
            const uidef = _slaveScreen_tilelistChildren[index];
            let uidefparts = uidef['uiParts'];
            
            //if(uidefparts && (uidefparts[k]['name'] === dataObj['name'])) {
            if((uidefparts[k]['name'] === dataObj['name']) && (uidefparts[k]['viewType'] === dataObj['viewType'])) {              
              uidef['uiParts'] = _updatedUIDef;
              break;
            }                
          }          
        }

        if(tilelistUI['parent'] === "Dialog") {
          const _dialogUI = currentPage['pageOverlay']['Children'][0];
          const l = scrIndex;
          let _slaveScreen_dialogChildren = _dialogUI['uiParts'][l]['dataarray'][0]['Fields'];
          for (let index = 0; index < _slaveScreen_dialogChildren.length; index++) {
            const uidef = _slaveScreen_dialogChildren[index];
            let uidefparts = uidef['uiParts'];
            if(uidefparts[l]['name'] === tilelistUI['uiParts'][l]['name']) {             
              //console.log(propsData, dataObj, tilelistUI, "....TileList.... in Dialog >>>>", l, uidef);
              uidef['uiParts'] = JSON.parse(JSON.stringify(tilelistUI['uiParts']))
              break;
            }                
          }
        }else if(tilelistUI['parent'] === "topToolbar"){
          const t = scrIndex;
          let _slaveScreen_topBarChildren = currentPage["_toolBarTop"][t]['Children'];
          for (let index = 0; index < _slaveScreen_topBarChildren.length; index++) {
            const uidef = _slaveScreen_topBarChildren[index];
            let uidefparts = uidef['uiParts'];
            if(uidef['viewType'] === "TileList" && (uidefparts[t]['name'] === tilelistUI['uiParts'][t]['name'])) {             
              uidef['uiParts'] = JSON.parse(JSON.stringify(tilelistUI['uiParts']))
              break;
            }                
          }
        }

      }else if(targetEditor === "Dialog") {

        let dialogUI;
        const overlayChildren = currentPage['pageOverlay']['Children'];
        if(overlayChildren.length > 1) {
          const sourceUI = editorParent['ui']; 
          let overlayUI = overlayChildren.filter(function(uipart) {
            if(uipart['viewType'] === "Dialog" && (uipart['uiParts'][0]['name'] === sourceUI['name'])) {
              return uipart;
            }
            return uipart;
          });  
          if(overlayUI.length > 0) {
            dialogUI = overlayUI[0];
          }
        }else {
          dialogUI = overlayChildren[0];
        }        

        const _updatedUIDef = JSON.parse(JSON.stringify(updatedUIDef));
        let isfound = false;
        
        const l = scrIndex;
        let _slaveScreen_dialogChildren = dialogUI['uiParts'][l]['dataarray'][0]['Fields'];
        for (let index = 0; index < _slaveScreen_dialogChildren.length; index++) {
          const uidef = _slaveScreen_dialogChildren[index];
          let uidefparts = uidef['uiParts'];
          //if(uidefparts && (uidefparts[l]['name'] === dataObj['name'])) { 
          if((uidefparts[l]['name'] === dataObj['name']) && (uidefparts[l]['viewType'] === dataObj['viewType'])) {  
            if(uidefparts[l]['name'] !== dataObj['name']){
              isfound = false;
              delete uidef['selected'];
            }else {
              uidef['uiParts'] = _updatedUIDef;
              isfound = true;
              if(uidef['uiParts'][l] && uidef['uiParts'][l]['frame']) {
                uidef['uiParts'][l]['frame'] = uidefparts[l]['frame'];
              }
              break;
            }        
          }                
        }

        if(!isfound) {                
          let missingChild  = {_uid:"", viewType:dataObj['viewType'], uiParts:_updatedUIDef, selected:true};
          _slaveScreen_dialogChildren.push(missingChild);
        }
        

      }
      //console.log(currentPage, "......uipart.. updateAllScreensData >>>>", dataObj, updatedUIDef);
    }
  }
  
   

  return (
      
    <Box id="multiuipallete" className={classes.settingpallete} >
      <div className={classes.header}>
        <strong className={classes.heading}></strong>   
      </div>
      <div className={classes.messagebox}>
        <Typography variant="subtitle2" className={classes.message}>For selected UI-parts, below property - values will be set as per support.</Typography>   
      </div> 
      <div className={classes.settingbox}>  
        <AppBar position="static" color="default" className={classes.appbar}>
          <Tabs value={mtabvalue} onChange={handleMTabChange} indicatorColor="primary" >
            <Tab wrapped label="Properties" className={classes.tab} />
            <Tab wrapped label="Selected UIs" className={classes.tab} />
          </Tabs>
        </AppBar>   
        {mtabvalue === 0 && 
          <MTabContainer>
            <Paper id="multiuiproperties" className={classes.paper}>
              <fieldset className={classes.propset}>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Hidden :</Typography>
                  <Checkbox disableRipple color="default" data-key="hidden" onChange={(e) => handleChangePropertyValue(e, "hidden")}/>
                </FormGroup>
              </fieldset>
              <fieldset className={classes.propset}>
                <legend>UI Style</legend>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Background Color :</Typography>
                  <div style={{position:'relative', overflow:'hidden'}}>
                    <ColorPickerForm propkey="backgroundColor" value={{alpha: 1, colorName: "", red: 1, blue: 1, green: 1}} 
                                    onValueChange={handleChangeColorValue} />
                  </div>
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Transparency :</Typography>
                  <NumericStepperForm propkey="backgroundColor-alpha" path="backgroundColor-alpha" source="uipart" min="0.0" max="1.0" step="0.1"
                                      value="1.0" onValueChange={handleChangeNumValue} />
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Border Width :</Typography>
                  <NumericStepperForm propkey="borderWeight" path="borderWeight" source="uipart" min="0" max="10" step="1"
                                      value="0" onValueChange={handleChangeNumValue} />
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Border Radius :</Typography>
                  <NumericStepperForm propkey="cornerRadius" path="cornerRadius" source="uipart" min="0" max="25" step="1"
                                      value="0" onValueChange={handleChangeNumValue} />
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Border Color :</Typography>
                  <div style={{position:'relative', overflow:'hidden'}}>
                    <ColorPickerForm propkey="borderColor" value={{alpha: 1, colorName: "", red: 1, blue: 1, green: 1}} 
                                    onValueChange={handleChangeColorValue} />
                  </div>
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Border Transparency :</Typography>
                  <NumericStepperForm propkey="borderColor-alpha" path="borderColor-alpha" source="uipart" min="0.0" max="1.0" step="0.1"
                                      value="1.0" onValueChange={handleChangeNumValue} />
                </FormGroup>
              </fieldset>
              <fieldset className={classes.propset}>
                <legend>Text Font</legend>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Font Name :</Typography>
                  <Select native className={classes.select} value={fontname} onChange={(e) => handleChangePropertyValue(e, "font-fontName")} >
                    {predefinedFonts.map((option,id) =>
                      <option key={id} value={option}>{option}</option>            
                    )}
                  </Select>
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Font Size :</Typography>
                  <NumericStepperForm propkey="font-fontSize" path="font-fontsize" source="uipart" min="6" max="50" step="1"
                                      value="14" onValueChange={handleChangeNumValue} />
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Bold :</Typography>
                  <Checkbox disableRipple color="default" data-key="fontWeight" onChange={(e) => handleChangePropertyValue(e, "font-fontWeight")}/>
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Italic :</Typography>
                  <Checkbox disableRipple color="default" data-key="fontStyle" onChange={(e) => handleChangePropertyValue(e, "font-fontStyle")}/>
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Underline :</Typography>
                  <Checkbox disableRipple color="default" data-key="underline" onChange={(e) => handleChangePropertyValue(e, "underline")}/>
                </FormGroup>
                <FormGroup className={classes.propform}>
                  <Typography variant="body2" className={classes.propkey}>Text Color :</Typography>
                  <div style={{position:'relative', overflow:'hidden'}}>
                    <ColorPickerForm propkey="font-textColor" value={{alpha: 1, colorName: "", red: 1, blue: 1, green: 1}} 
                                     onValueChange={handleChangeColorValue} />
                  </div>
                </FormGroup>
                <FormGroup className={classes.propform} style={{height:100}}>
                  <Typography variant="body2" className={classes.propkey}>Text Alignment :</Typography>
                  <RadioGroup className={classes.rbgroup} aria-label="textalign" name="textalign" value={textalign} data-key="textAlignment" 
                              onChange={(e) => handleChangePropertyValue(e, "font-textAlignment")} >
                    <FormControlLabel className={classes.rblabel} value="left" control={<Radio disableRipple color="default"/>} label="left" />
                    <FormControlLabel className={classes.rblabel} value="center" control={<Radio disableRipple color="default"/>} label="center" />
                    <FormControlLabel className={classes.rblabel} value="right" control={<Radio disableRipple color="default"/>} label="right" />
                  </RadioGroup>
                </FormGroup>
                <FormGroup className={classes.propform} style={{height:100}}>
                  <Typography variant="body2" className={classes.propkey}>Vertical Alignment :</Typography>
                  <RadioGroup className={classes.rbgroup} aria-label="verticalalign" name="verticalalign" value={verticalalign} data-key="verticalAlignment" 
                              onChange={(e) => handleChangePropertyValue(e, "verticalAlignment")} >
                    <FormControlLabel className={classes.rblabel} value="top" control={<Radio disableRipple color="default"/>} label="top" />
                    <FormControlLabel className={classes.rblabel} value="middle" control={<Radio disableRipple color="default"/>} label="middle" />
                    <FormControlLabel className={classes.rblabel} value="bottom" control={<Radio disableRipple color="default"/>} label="bottom" />
                  </RadioGroup>
                </FormGroup>
              </fieldset>
            </Paper>
          </MTabContainer>
        }
        {mtabvalue === 1 && 
          <MTabContainer>
            <Paper id="selecteduis" className={classes.paper}>
              {(selectedUIparts.length > 0)  && 
                <table className="tg" style={{width:320, tableLayout:'fixed', marginTop:8}}>   
                  <thead>
                    <tr>
                      <th width="30px"></th>
                      <th>Name</th>
                      <th width="80px">Type</th>
                    </tr>
                  </thead>             
                  <tbody>
                    {getSelecteUIData(selectedUIparts, currentScreenIndex).map((vobj, index) => (
                      <tr key={index}>
                        <td > {(index+1)} </td>
                        <td style={{textAlign:'start', wordBreak:'break-all'}} > {vobj.name} </td>
                        <td style={{textAlign:'start'}} > {vobj.type} </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </Paper>
          </MTabContainer>
        }
      </div>
      <div className={classes.buttonbox}>
        <Button variant="contained" color="default" className={classes.button}>
          Set Setting
        </Button>
      </div>
    </Box>

  );
}

////////////////////// customized componenets //////////////////////

function TabContainer(props) {
  return (
    <Typography component="div" style={{ width:'100%', position:'absolute', top:36, bottom:36, backgroundColor:'rgba(244, 244, 244, 1)', textAlign:'start'}}>
      {props.children}
    </Typography>
  );
}
TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
function MTabContainer(props) {
  return (
    <Typography component="div" style={{ width:'100%', height:'100%', backgroundColor:'rgba(244, 244, 244, 1)'}}>
      {props.children}
    </Typography>
  );
}
MTabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const Accordion = withStyles({
  root: {
    width: '100%',    
    border: '1px solid',  
    marginBottom: 4, 
    boxShadow: 'none',
    /* '&:not(:last-child)': {
      borderBottom: 0,
    }, */
    '&:before': {
      display: 'none',
    },  
    '&$expanded': {
      height: '100%',    
      margin: 0,
      marginBottom: 4,
    },
  },
  expanded: {},
})(MuiAccordion);

const AccordionSummary = withStyles(theme => ({
  root: {
    height: 32, 
    minHeight: 32,   
    padding: '0 4px',
    borderBottom: '1px solid',
    background: theme.palette.background.paper,
    '&$expanded': {
      minHeight: 32,
    },
  },
  content: {
    alignItems: 'center',
    marginLeft: 24,
    fontSize: theme.typography.pxToRem(12),
    fontWeight: theme.typography.fontWeightBold,
    '&$expanded': {
      margin: '4px 0px 4px 24px',
    },
  },
  expandIcon: {
    position: 'absolute',
    left: 2, 
    padding : 1,
    color: 'inherit',
  },
  expanded: {},
}))(MuiAccordionSummary);

const AccordionDetails = withStyles(theme => ({
  root: {
    //display: 'inline-grid',
    //height: 580,
    height: '100%',
    maxHeight: '36vh',
    padding: theme.spacing(1),
    flexDirection: 'column',
    overflow: 'hidden auto',
    background: theme.palette.background.default
  },
}))(MuiAccordionDetails);

const StyledBadge = withStyles(theme => ({
  badge: {
    top: '50%',    
    height: 24, minWidth: 24,
    borderRadius: 12,
    right: 16,    
  },
}))(Badge);


////////////////////// helper functions //////////////////////

function getUIEnabledState(_pagedata, currentScrIndex) {

  if(currentScrIndex === undefined)   currentScrIndex = 0;

  let _UIs = [];

  let _uiChilds = [];
  let pageChildren = [];
  if(_pagedata.viewType === "BaseView"){
    pageChildren = _pagedata.Children;
  }else if(_pagedata.viewType === "ScrollView"){
    pageChildren = _pagedata.Children[0].Children;
  }else if(_pagedata.viewType.indexOf("TableViewList") > -1){
    if(_pagedata.Children[0]['_tmpCellStyle'] === "custom") {
      pageChildren = _pagedata.Children[0].Group[0]['RecordCellDef']['Fields'];
    }    
  }else if(_pagedata['viewType'].indexOf('TableViewNestedList') > -1) {
    if(_pagedata.Children[0]['_tmpCellStyle'] === "custom") {
      const mainFields = _pagedata.Children[0].Group[0]['RecordCellDef']['Fields'];
      const subFields = _pagedata.Children[0].Group[0]['SubRecordCellDef']['Fields'];
      pageChildren = mainFields.concat(subFields);
    }
  }

  pageChildren.forEach(child => {
    let pageuiObj = child.uiParts[currentScrIndex];
    let pageUIs = {container: "page", name: pageuiObj.name, type: getUIViewtype(pageuiObj), enabled: pageuiObj._enabledOnScreen, children:[]};        
    if(pageuiObj.viewType === "TileList") {
      let tileItems = pageUIs['children'];
      let tileChildren = pageuiObj.dataarray[0]['Fields'];
      tileChildren.forEach(fieldui => {
        let tileObj = fieldui.uiParts[currentScrIndex];
        let tileUIs = {container: "TileList", name: tileObj.name, type: getUIViewtype(tileObj), enabled: tileObj._enabledOnScreen, children:[]};        
        tileItems.push(tileUIs);
      });
    }
    else if(pageuiObj.viewType === "ExpansionPanel") {
      let panelItems = pageUIs['children'];
      for (let index = 0; index < pageuiObj.panelItems.length; index++) {
        let panelChildren = pageuiObj.panelItems[index]['Fields'];
        panelChildren.forEach(fieldui => {
          let uiObj = fieldui.uiParts[currentScrIndex];
          let panelUIs = {container: "ExpansionPanel", name: uiObj.name, type: getUIViewtype(uiObj), enabled: uiObj._enabledOnScreen, children:[]};        
          panelItems.push(panelUIs);
          if(uiObj['viewType'] === "DataGrid"){
            for (let index = 0; index < uiObj.dataCols.length; index++) {
              let colsChildren = (uiObj.dataCols[index]['isCustom']) ? uiObj.dataCols[index]['Fields'] : [];
              colsChildren.forEach(fieldui => {
                const _uiObj = fieldui.uiParts[currentScrIndex];
                if(_uiObj){
                  const colUIs = {container: "DataGrid", name: _uiObj.name, type: getUIViewtype(_uiObj), enabled: _uiObj._enabledOnScreen, children:[]};        
                  panelItems.push(colUIs);
                }
              });
              let headerChildren = (uiObj.dataCols[index]['isCustomHeader']) ? uiObj.dataCols[index]['headerFields'] : [];
              if(headerChildren){
                headerChildren.forEach(headerui => {
                  const _uiObj = headerui.uiParts[currentScrIndex];
                  if(_uiObj){
                    const headerUIs = {container: "DataGrid", name: _uiObj.name, type: getUIViewtype(_uiObj), enabled: _uiObj._enabledOnScreen, children:[]};        
                    panelItems.push(headerUIs);
                  }
                });
              }
            }
          }
        });        
      }
    }
    else if(pageuiObj.viewType === "SwipeableView") {
      let swipeItems = pageUIs['children'];
      for (let index = 0; index < pageuiObj.swipeableItems.length; index++) {
        let panelChildren = pageuiObj.swipeableItems[index]['Fields'];
        panelChildren.forEach(fieldui => {
          let uiObj = fieldui.uiParts[currentScrIndex];
          let panelUIs = {container: "SwipeableView", name: uiObj.name, type: getUIViewtype(uiObj), enabled: uiObj._enabledOnScreen, children:[]};        
          swipeItems.push(panelUIs);
        });        
      }
    }
    else if(pageuiObj.viewType === "DataGrid") {
      let customCols = pageUIs['children'];
      for (let index = 0; index < pageuiObj.dataCols.length; index++) {
        let colsChildren = (pageuiObj.dataCols[index]['isCustom']) ? pageuiObj.dataCols[index]['Fields'] : [];
        colsChildren.forEach(fieldui => {
          let uiObj = fieldui.uiParts[currentScrIndex];
          let colUIs = {container: "DataGrid", name: uiObj.name, type: getUIViewtype(uiObj), enabled: uiObj._enabledOnScreen, children:[]};        
          customCols.push(colUIs);
        });
        let headerChildren = (pageuiObj.dataCols[index]['isCustomHeader']) ? pageuiObj.dataCols[index]['headerFields'] : [];
        if(headerChildren){
          headerChildren.forEach(headerui => {
            let uiObj = headerui.uiParts[currentScrIndex];
            let headerUIs = {container: "DataGrid", name: uiObj.name, type: getUIViewtype(uiObj), enabled: uiObj._enabledOnScreen, children:[]};        
            customCols.push(headerUIs);
          });
        }       
      }
    }else if(pageuiObj.viewType === "Popover") {
      let popoverItems = pageUIs['children'];
      let popoverChildren = pageuiObj.dataarray[0]['Fields'];
      popoverChildren.forEach(fieldui => {
        let popoverObj = fieldui.uiParts[currentScrIndex];
        let popoverUIs = {container: "Popover", name: popoverObj.name, type: getUIViewtype(popoverObj), enabled: popoverObj._enabledOnScreen, children:[]};        
        popoverItems.push(popoverUIs);
      });

    }else if(pageuiObj.viewType === "FormView") {
      let formItems = pageUIs['children'];
      for (let index = 0; index < pageuiObj.formItems.length; index++) {
        let panelChildren = pageuiObj.formItems[index]['Fields'];
        panelChildren.forEach(fieldui => {
          let uiObj = fieldui.uiParts[currentScrIndex];
          let panelUIs = {container: "FormView", name: uiObj.name, type: getUIViewtype(uiObj), enabled: uiObj._enabledOnScreen, children:[]};        
          formItems.push(panelUIs);
          if(uiObj['viewType'] === "DataGrid"){
            for (let index = 0; index < uiObj.dataCols.length; index++) {
              let colsChildren = (uiObj.dataCols[index]['isCustom']) ? uiObj.dataCols[index]['Fields'] : [];
              colsChildren.forEach(fieldui => {
                const _uiObj = fieldui.uiParts[currentScrIndex];
                if(_uiObj){
                  const colUIs = {container: "DataGrid", name: _uiObj.name, type: getUIViewtype(_uiObj), enabled: _uiObj._enabledOnScreen, children:[]};        
                  formItems.push(colUIs);
                }
              });
              let headerChildren = (uiObj.dataCols[index]['isCustomHeader']) ? uiObj.dataCols[index]['headerFields'] : [];
              if(headerChildren){
                headerChildren.forEach(headerui => {
                  const _uiObj = headerui.uiParts[currentScrIndex];
                  if(_uiObj){
                    const headerUIs = {container: "DataGrid", name: _uiObj.name, type: getUIViewtype(_uiObj), enabled: _uiObj._enabledOnScreen, children:[]};        
                    formItems.push(headerUIs);
                  }
                });
              }
            }
          }
        });        
      }
    }else if(pageuiObj.viewType === "NestedList"){   
        const nestedlistUI = pageUIs['children'];
        const maincellFields = pageuiObj.mainCellDef.Fields;
        const subcellFields = pageuiObj.subCellDef.Fields;
        const nestedlistFields = maincellFields.concat(subcellFields); 
        nestedlistFields.forEach(fieldui => {
          let nestedlistObj = fieldui.uiParts[currentScrIndex];
          let nestedlistUIs = {container: "NesteList", name: nestedlistObj.name, type: getUIViewtype(nestedlistObj), enabled: nestedlistObj._enabledOnScreen, children:[]};        
          nestedlistUI.push(nestedlistUIs);
        });  
    }

    _uiChilds.push(pageUIs);
  });   
  _UIs.push({title:"Page Container", data:_uiChilds});

  let _ttopChilds = [];
  if(!_pagedata._toolBarTop[currentScrIndex].hidden){
    _pagedata._toolBarTop[currentScrIndex].Children.forEach(child => {
      let ttopObj = child.uiParts[currentScrIndex];
      let ttopUIs = {container: "toolBarTop", name: ttopObj.name, type: getUIViewtype(ttopObj), enabled: ttopObj._enabledOnScreen, children:[]};        
      _ttopChilds.push(ttopUIs);
    });   
  }
  _UIs.push({title:"Toolbar [Top]", data:_ttopChilds});
  
  let _tbotChilds = [];
  if(!_pagedata._toolBarBottom[currentScrIndex].hidden){
    _pagedata._toolBarBottom[currentScrIndex].Children.forEach(child => {
      let tbotObj = child.uiParts[currentScrIndex];
      let tbotUIs = {container: "toolBarBottom", name: tbotObj.name, type: getUIViewtype(tbotObj), enabled: tbotObj._enabledOnScreen, children:[]};        
      _tbotChilds.push(tbotUIs);
    });   
  }
  _UIs.push({title:"Toolbar [Bottom]", data:_tbotChilds});

  let _tleftChilds = [];
  if(!_pagedata._toolBarLeft[currentScrIndex].hidden){
    _pagedata._toolBarLeft[currentScrIndex].Children.forEach(child => {
      let tleftObj = child.uiParts[currentScrIndex];
      let tleftUIs = {container: "toolBarLeft", name: tleftObj.name, type: getUIViewtype(tleftObj), enabled: tleftObj._enabledOnScreen, children:[]};        
      _tleftChilds.push(tleftUIs);
    });   
  }
  /* if(_pagedata.viewType.indexOf("TableView") === -1){
    _UIs.push({title:"Sidebar", data:_tleftChilds});
  }else {
    if(_pagedata.viewType.indexOf("TableViewList") > -1){
      _UIs.push({title:"Sidebar [Left]", data:_tleftChilds});

      let _tRightChilds = [];
      if(!_pagedata._toolBarRight[currentScrIndex].hidden){
        _pagedata._toolBarRight[currentScrIndex].Children.forEach(child => {
          let trightObj = child.uiParts[currentScrIndex];
          let trightUIs = {container: "toolBarRight", name: trightObj.name, type: getUIViewtype(trightObj), enabled: trightObj._enabledOnScreen, children:[]};        
          _tRightChilds.push(trightUIs);
        });   
      }
      _UIs.push({title:"Sidebar [Right]", data:_tRightChilds});
    }
  } */

  if(_pagedata.viewType === "TableView"){
    _UIs.push({title:"Sidebar", data:_tleftChilds});
  }else {
    _UIs.push({title:"Sidebar [Left]", data:_tleftChilds});

    let _tRightChilds = [];
    if(!_pagedata._toolBarRight[currentScrIndex].hidden){
      _pagedata._toolBarRight[currentScrIndex].Children.forEach(child => {
        let trightObj = child.uiParts[currentScrIndex];
        let trightUIs = {container: "toolBarRight", name: trightObj.name, type: getUIViewtype(trightObj), enabled: trightObj._enabledOnScreen, children:[]};        
        _tRightChilds.push(trightUIs);
      });   
    }
    _UIs.push({title:"Sidebar [Right]", data:_tRightChilds});
  }

  let _overlayChilds = [];
  if(_pagedata.pageOverlay && _pagedata.pageOverlay.Children){
    _pagedata.pageOverlay.Children.forEach(child => {
      let overlayObj = child.uiParts[currentScrIndex];
      let overlayUIs = {container: "pageOverlay", name: overlayObj.name, type: getUIViewtype(overlayObj), enabled: overlayObj._enabledOnScreen, children:[]};        
      if(overlayObj.viewType === "Dialog" || overlayObj.viewType === "Drawer") {
        let dialogItems = overlayUIs['children'];

        for (let index = 0; index < overlayObj.dataarray.length; index++) {
          const element = overlayObj.dataarray[index];
          let dialogChildren = element['Fields'];
          dialogChildren.forEach(fieldui => {
            let dialogObj = fieldui.uiParts[currentScrIndex];
            let overlayUIs = {container: overlayObj.viewType, name: dialogObj.name, type: getUIViewtype(dialogObj), enabled: dialogObj._enabledOnScreen, children:[]};        
            dialogItems.push(overlayUIs);
            if(dialogObj['viewType'] === "DataGrid"){
              for (let index = 0; index < dialogObj.dataCols.length; index++) {
                let colsChildren = (dialogObj.dataCols[index]['isCustom']) ? dialogObj.dataCols[index]['Fields'] : [];
                colsChildren.forEach(fieldui => {
                  const _uiObj = fieldui.uiParts[currentScrIndex];
                  if(_uiObj) {
                    const colUIs = {container: "DataGrid", name: _uiObj.name, type: getUIViewtype(_uiObj), enabled: _uiObj._enabledOnScreen, children:[]};        
                    dialogItems.push(colUIs);
                  }
                });
                let headerChildren = (dialogObj.dataCols[index]['isCustomHeader']) ? dialogObj.dataCols[index]['headerFields'] : [];
                if(headerChildren){
                  headerChildren.forEach(headerui => {
                    let _uiObj = headerui.uiParts[currentScrIndex];
                    if(_uiObj) {
                      const headerUIs = {container: "DataGrid", name: _uiObj.name, type: getUIViewtype(_uiObj), enabled: _uiObj._enabledOnScreen, children:[]};        
                      dialogItems.push(headerUIs);
                    }
                  });
                }          
              }
            }
          });          
        }
      }
      _overlayChilds.push(overlayUIs);
    });   
  }
  _UIs.push({title:"Page Overlay", data:_overlayChilds});

  //console.log("Enabled UI list >>>>", _UIs);
  return _UIs;
};

function getChildrenArray(targetEditor, editorParent, targetData, scrIndex) {  
  const scrId = (scrIndex)  ? scrIndex : 0;

  switch (targetEditor) {
    case "page":
      if(targetData.viewType === "BaseView") {
        return targetData.Children;
      }else if(targetData.viewType === "ScrollView") {
        return targetData.Children[0].Children;
      }else if(targetData['viewType'].indexOf('TableViewList') > -1) {
        if(targetData.Children[0]['_tmpCellStyle'] === "custom") {
          const tableGroup = targetData.Children[0].Group;
          return tableGroup[0].RecordCellDef.Fields;
        }
      }
      return targetData.Children;
      
    case "topToolbar":
      return targetData._toolBarTop[scrId].Children;
    
    case "bottomToolbar":
      return targetData._toolBarBottom[scrId].Children;
    
    case "leftToolbar":
      return targetData._toolBarLeft[scrId].Children;

    case "rightToolbar":
      return targetData._toolBarRight[scrId].Children;

    case "tablecell":
      if(targetData['viewType'].indexOf('TableViewList') > -1) {
        if(targetData.Children[0]['_tmpCellStyle'] === "custom") {
          const tableGroup = targetData.Children[0].Group;
          return tableGroup[0].RecordCellDef.Fields;
        }
      }
      else if(targetData['viewType'].indexOf('TableViewNestedList') > -1) {
        if(targetData.Children[0]['_tmpCellStyle'] === "custom") {
          const tableGroup = targetData.Children[0].Group;
          const _mainFields = tableGroup[0].RecordCellDef.Fields;
          const _subFields = tableGroup[0].SubRecordCellDef.Fields;
          return _mainFields.concat(_subFields);
        }
      }
      return targetData.Children; 
    case "subtablecell":
      if(targetData['viewType'].indexOf('TableViewNestedList') > -1) {
        if(targetData.Children[0]['_tmpCellStyle'] === "custom") {
          const tableGroup = targetData.Children[0].Group;
          return tableGroup[0].SubRecordCellDef.Fields;
        }
      }
      return targetData.Children;
      
    case "overlay":
      if(targetData['pageOverlay']) {
        return targetData['pageOverlay'].Children
      }
      return targetData.Children;

    case "pageOverlay":
    case "Dialog":
      if(targetData['pageOverlay'] && targetData['pageOverlay'].Children[0]) {
        if(targetData['pageOverlay'].Children[0].uiParts[scrId]) {
          return targetData['pageOverlay'].Children[0].uiParts[scrId].dataarray[0].Fields;
        }
      }
      return targetData['pageOverlay'].Children;

    case "TileList":
      const _uidata = (editorParent) ? editorParent['ui'] : "";
      if(_uidata !== "" && _uidata['viewType'] === "TileList"){
        return _uidata.dataarray[0].Fields;
      }
      return targetData.Children;

    case "NestedList":
      const nestedlistUI = (editorParent) ? editorParent['ui'] : "";
      const maincellFields = nestedlistUI.mainCellDef.Fields;
      const subcellFields = nestedlistUI.subCellDef.Fields;
      return maincellFields.concat(subcellFields);
   
    default:
      return targetData.Children;
  }
};

function getSelecteUIData(selectedUIs, currentScrIndex) {
  if(!currentScrIndex)   currentScrIndex = 0;

  let _selectedUIs = [];
  selectedUIs.forEach(item => {
    let selectedObj = item['UI'];
    let pageUIs = {container: item['editor'], name: selectedObj.name, type: getUIViewtype(selectedObj)}; 
    _selectedUIs.push(pageUIs);
  });

  return _selectedUIs;
}

function setColorDic(colorValue) {
  let hex = parseInt(colorValue.substring(1), 16);
  let numRed = (hex & 0xff0000) >> 16;
  let numGreen = (hex & 0x00ff00) >> 8;
  let numBlue = hex & 0x0000ff;
  
  let objColor = { 
                    alpha: 1,
                    red: numRed/255,
                    green: numGreen/255,
                    blue: numBlue/255,
                    colorName: '',
                  };

  return objColor;
}

function getSlaveUIpart(uiArr, uiObj, screenindex) {
  const _uitype = getUIViewtype(uiObj);
  const _uiname = uiObj['name'];

  for (let index = 0; index < uiArr.length; index++) {
    const element = uiArr[index];
    if(element['viewType'] === _uitype){
      if(element['uiParts'][screenindex]['name'] === _uiname){
        return element['uiParts'];
      }
    }   
    //console.log("..index >>>", index);
  }
}

function getAllChildrenOnPage(_page, scrIndex, includeDisableUI)
{
  let arrChildren = [];
  if(_page.viewType.indexOf("TableView") > -1)
  {
    if(_page.viewType === "DbTableViewList" || _page.viewType === "RemoteTableViewList" || _page.viewType === "DbTableViewNestedList") {
      let arrFields0 = _page.Children[0].Group[0].RecordCellDef.Fields;
      for (let i0 = 0; i0 < arrFields0.length; i0++) {
        arrChildren.push(arrFields0[i0]);								
      }
      if(_page.viewType === "DbTableViewNestedList"){
        let arrSubFields0 = _page.Children[0].Group[0].SubRecordCellDef.Fields;
        for (let i1 = 0; i1 < arrSubFields0.length; i1++) {
          arrChildren.push(arrSubFields0[i1]);								
        }
      }
    }
    else {
      let arrGroup = _page.Children[0].Group;
      for (let i = 0; i < arrGroup.length; i++) 
      {
        let arrRow = arrGroup[i].rowarray;
        for (let j = 0; j < arrRow.length; j++) 
        {
          if(arrRow[j])
          {
            let arrFields = arrRow[j].Fields;
            for (let k = 0; k < arrFields.length; k++) 
            {
              arrChildren.push(arrFields[k]);								
            }
          }
        }
      }
    }
  }
  else
  {
    let pageChildren;
    if(_page.viewType === "ScrollView" || _page.viewType === "PageScrollView")
      pageChildren = _page.Children[0].Children;
    else
      pageChildren = _page.Children;
    
    pageChildren.forEach(uiContainerDic => {
      arrChildren.push(uiContainerDic);
      if(uiContainerDic['viewType'] === "TileList") {
        let arrTileItems = uiContainerDic['uiParts'][scrIndex].dataarray[0]['Fields'];
        for (let u = 0; u < arrTileItems.length; u++) 
        {
          arrChildren.push(arrTileItems[u]);								
        }
      }
    });
  }
    
  let cntTop = -1;
  if(_page._toolBarTop.length > 0) {		
    _page._toolBarTop.forEach(_topToolbar => {
      cntTop++;
      if(cntTop === 0) {
        if(!_topToolbar['hidden']) {
          for (let t = 0; t < _topToolbar.Children.length; t++) {
            let _topToolbarUIContainerDic = _topToolbar.Children[t];
            let _topToolbarChildPartDic = _topToolbarUIContainerDic['uiParts'][scrIndex];
            if(_topToolbarChildPartDic) {
              if(!_topToolbarChildPartDic['_enabledOnScreen'] && !includeDisableUI)
                continue;							
            }
            arrChildren.push(_topToolbar.Children[t]);
            if(_topToolbar.Children[t]['viewType'] === "TileList") {
              _topToolbar.Children[t]['parent'] = "topToolbar";
              let arrtTileItems = _topToolbar.Children[t]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let t0 = 0; t0 < arrtTileItems.length; t0++) 
              {
                arrChildren.push(arrtTileItems[t0]);								
              }
            }
          }
        }
      }
    });    
  }

  let cntBottom = -1;
  if(_page._toolBarBottom.length > 0) {				
    _page._toolBarBottom.forEach(_bottomToolbar => {
      cntBottom++;
      if(cntBottom === 0) {
        if(!_bottomToolbar['hidden']) {
          for (let b = 0; b < _bottomToolbar.Children.length; b++) {
            let _bottomToolbarUIContainerDic = _bottomToolbar.Children[b];
            let _bottomToolbarChildPartDic = _bottomToolbarUIContainerDic['uiParts'][scrIndex];
            if(_bottomToolbarChildPartDic) {
              if(!_bottomToolbarChildPartDic['_enabledOnScreen'] && !includeDisableUI)
                continue;							
            }
            arrChildren.push(_bottomToolbar.Children[b]);
            if(_bottomToolbar.Children[b]['viewType'] === "TileList") {
              let arrbTileItems = _bottomToolbar.Children[b]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let b0 = 0; b0 < arrbTileItems.length; b0++) 
              {
                arrChildren.push(arrbTileItems[b0]);								
              }
            }
          }
        }
      }
    });
  }

  let cntLeft = -1;
  if(_page.hasOwnProperty("_toolBarLeft") && _page._toolBarLeft.length > 0)
  {
    _page._toolBarLeft.forEach(_leftToolbar => {
      cntLeft++;
      if(cntLeft === scrIndex) {
        if(!_leftToolbar['hidden']) {
          for (let l = 0; l < _leftToolbar.Children.length; l++) {
            let _leftToolbarUIContainerDic = _leftToolbar.Children[l];
            let _leftToolbarChildPartDic = _leftToolbarUIContainerDic['uiParts'][scrIndex];
            if(_leftToolbarChildPartDic) {
              if(!_leftToolbarChildPartDic['_enabledOnScreen'] && !includeDisableUI)
                continue;							
            }
            arrChildren.push(_leftToolbar.Children[l]);
            if(_leftToolbar.Children[l]['viewType'] === "TileList") {
              let arrlTileItems = _leftToolbar.Children[l]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let l0 = 0; l0 < arrlTileItems.length; l0++) 
              {
                arrChildren.push(arrlTileItems[l0]);								
              }
            }
          }
        }
      }
    });
  }

  let cntRight = -1;
  if(_page.hasOwnProperty("_toolBarRight") && _page._toolBarRight.length > 0)
  {				
    _page._toolBarRight.forEach(_rightToolbar => {
      cntRight++;
      if(cntRight === scrIndex) {
        if(!_rightToolbar['hidden']) {
          for (let r = 0; r < _rightToolbar.Children.length; r++) {
            let _rightToolbarUIContainerDic = _rightToolbar.Children[r];
            let _rightToolbarChildPartDic = _rightToolbarUIContainerDic['uiParts'][scrIndex];
            if(_rightToolbarChildPartDic) {
              if(!_rightToolbarChildPartDic['_enabledOnScreen'] && !includeDisableUI)
                continue;							
            }
            arrChildren.push(_rightToolbar.Children[r]);
            if(_rightToolbar.Children[r]['viewType'] === "TileList") {
              let arrrTileItems = _rightToolbar.Children[r]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let r0 = 0; r0 < arrrTileItems.length; r0++) 
              {
                arrChildren.push(arrrTileItems[r0]);								
              }
            }
          }
        }
      }
    });
  }
  
  if(_page.hasOwnProperty('pageOverlay')) {
    let _objOverlay = _page.pageOverlay;
    let overlayChildren = _objOverlay.Children;
    if(overlayChildren) {
      for (let o = 0; o < overlayChildren.length; o++) 
      {
        arrChildren.push(overlayChildren[o]);
        if(overlayChildren[o]['viewType'] === "Dialog") {
          let arrDialogItems = overlayChildren[o]['uiParts'][scrIndex].dataarray[0]['Fields'];
          for (let o0 = 0; o0 < arrDialogItems.length; o0++) 
          {
            if(arrDialogItems[o0]['viewType'] === "TileList") {
              arrDialogItems[o0]['parent'] = "Dialog";
              let arrTileItems = arrDialogItems[o0]['uiParts'][scrIndex].dataarray[0]['Fields'];
              for (let u = 0; u < arrTileItems.length; u++) {
                arrChildren.push(arrTileItems[u]);								
              }
            }							
            arrChildren.push(arrDialogItems[o0]);	
          }
        }
      }
    }
  }
    
  return arrChildren;
}

export default SettingWindow;
/*function mapStateToProps(state) {
  return {
    apiParam: state.appParam.params,
    appData: state.appData.data,
    pageLocale: state.appParam.pagelocale,
    pageContainer: state.appParam.pagecontainer,
    pageConfig: state.appParam.pageconfig,
    uiLocale: state.appParam.uilocale,
    uiList: state.appParam.uilist,
    uiConfig: state.appParam.uiconfig,
    currentPage: state.selectedData.pagedata,
    currentUI: state.selectedData.uidata,
    selectedUIs: state.selectedData.uiparts,
    targetEditor: state.selectedData.editor,
    contentEditorParent: state.selectedData.editorParent,
  };
}
export default connect(mapStateToProps)(SettingWindow);*/