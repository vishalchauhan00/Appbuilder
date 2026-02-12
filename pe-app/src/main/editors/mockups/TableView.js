import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Paper, IconButton, Fab } from '@material-ui/core';
import AccessoryIndicator from '@material-ui/icons/NavigateNext';
import ExpandCircleDownIcon from '@material-ui/icons/ExpandMore';
import AccessoryButton from '../../../assets/pagetype/button.png';
import mainimage from '../../../assets/mobicon.png';
import accHeaderIcon from '../../../assets/accheader.png';
import UIContainer from '../UIContainer';


export default function TableView(props) {

  const appConfig = props.appconfig;
  const pagedata = props.data;
  
  const tablestyle = pagedata.TableStyle;
  const cellstyle = pagedata._tmpCellStyle;

  const isAccordion = (pagedata.isAccordian) ? pagedata.isAccordian : false;
  const accHeaderHeight = (pagedata.accHeaderHeight) ? pagedata.accHeaderHeight : 32;
  const accHeaderBGColor = (pagedata.accHeaderBGColor) ? pagedata.accHeaderBGColor : {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
  const accHeaderTextColor = (pagedata.accHeaderTextColor) ? pagedata.accHeaderTextColor : {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
  const accHeaderIconPosition = (pagedata.accHeaderIconPosition) ? pagedata.accHeaderIconPosition : "left";
  if(!pagedata.hasOwnProperty('accHeaderIconOpen')) {
    pagedata['accHeaderIconOpen'] = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
  }
  //const accHeaderIconOpen = getIconPath(pagedata.accHeaderIconOpen, appConfig.apiURL, appConfig.projectid);
  if(!pagedata.hasOwnProperty('accHeaderIconClose')) {
    pagedata['accHeaderIconClose'] = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
  }
  const accHeaderIconClose = getIconPath(pagedata.accHeaderIconClose, appConfig.apiURL, appConfig.projectid);
  let isAccHeaderIcon = false;
  if(isAccordion && pagedata.accHeaderIconClose.filename.length > 0){
    //console.log(isAccordion, "TableView accordion >>>> ", accHeaderIconClose);
    isAccHeaderIcon = true;
  }
  const accHeaderBorderWeight = (pagedata.accHeaderBorderWeight) ? pagedata.accHeaderBorderWeight : 1;
  
  const groupdata = pagedata.Group; 
  if(pagedata['viewType'].indexOf('TableViewList') > 0) {
    const groupObj = groupdata[0];
    if(!groupObj.hasOwnProperty('ServiceName')) {
      groupObj["ServiceName"] = "";
    }
  }

  if(!pagedata.hasOwnProperty('showDivider'))    pagedata['showDivider'] = true;
  
  //putting below check for Sampoorna project for now, that need to be remove later
  if(appConfig.apiURL.indexOf("tslsampoorna") > -1){
    if(props.pagedata['viewType'] === "DbTableViewNestedList"){
      pagedata['showDivider'] = true;
      pagedata.Group[0].RecordCellDef.backgroundColor['alpha'] = 1;
      pagedata.Group[0].rowarray[0].backgroundColor['alpha'] = 1;
    }else{
      pagedata['showDivider'] = false;
      pagedata.Group[0].RecordCellDef.backgroundColor['alpha'] = 0;
      pagedata.Group[0].rowarray[0].backgroundColor['alpha'] = 0;
    }
  }
  
  const cellBorderWeight = (pagedata['showDivider']) ? 1 : 0;

  if(!pagedata.hasOwnProperty('showScrollButtons')) {
    pagedata['showScrollButtons'] = false;
    pagedata['scrollButtonsBGColor'] = {"alpha": 1, "red": 0, "green": 0, "blue": 0, "colorName": ""};
    pagedata['scrollButtonsTextColor'] = {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
    pagedata['scrollButtonTitleBelow'] = "Scroll Below";
    pagedata['scrollButtonTitleTop'] = "Back to Top";
  }
  const isScrollButtons = pagedata['showScrollButtons'];

  let setMultiColumn = false;
  const screenObj = props['screenObj'];
  if(screenObj['width'] > 999 && screenObj['height'] >= 768){
    //console.log(".. seems desktop screen ..");
    setMultiColumn = pagedata['showMultiColumn'];
  }else{    
    if(pagedata['showMultiColumn']){
      console.log(".. Multiple columns not supported for non desktop screen ..");
    }
  }
  const columnGap = parseInt(pagedata.columnGap);

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    accheader:{
      width: '100%',
      height: accHeaderHeight +'px',
      backgroundColor: getColorValue(accHeaderBGColor),
      display: 'flex',
      flexDirection: 'row',
      boxSizing:'border-box',
      borderWidth : `calc(${accHeaderBorderWeight}px)`,      
      borderStyle: 'solid',
    },
    accicon:{
      padding: 4,
      width: (accHeaderHeight - 8) +'px',
    },
    accheaderleft:{
      textAlign: 'left',
      width: '100%',
      height: '100%',
      //lineHeight: accHeaderHeight +'px',
      color: getColorValue(accHeaderTextColor),
      fontWeight: theme.typography.fontWeightBold,
      display: 'flex',
      alignItems: 'center'
    },
    accheaderright:{
      textAlign: 'left',
      width: '100%',
      height: '100%',
      //lineHeight: accHeaderHeight +'px',
      paddingLeft: 12,
      color: getColorValue(accHeaderTextColor),
      fontWeight: theme.typography.fontWeightBold,
    },
    header:{
      textAlign: 'left',
      paddingLeft: 8,
      fontWeight: theme.typography.fontWeightBold,
    },
    footer:{
      textAlign: 'left',
      paddingLeft: 8,
    },
    groupplain: {
      borderTop: `calc(${cellBorderWeight}px) solid`,//'1px solid',
      borderBottom: `calc(${cellBorderWeight}px) solid`,
      boxSizing: 'border-box',
      backgroundColor: 'rgba(1,1,1,0)'
    },
    grouped: {
      border: `calc(${cellBorderWeight}px) solid`,
      borderRadius: 4,
      boxSizing: 'border-box',
      backgroundColor: 'rgba(1,1,1,0)'
    },
    flexdiv: {
      display: 'flex', flexDirection: 'row'
    },
    plainmulticol: {
      width: '100%',
      margin: 0,
      border: `calc(${cellBorderWeight}px) solid`,
      boxSizing: 'border-box',
      backgroundColor: 'rgba(1,1,1,0)'
    },
    groupedmulticol: {
      width: '100%',      
      margin: 0,
      border: `calc(${cellBorderWeight}px) solid`,
      borderRadius: 4,
      boxSizing: 'border-box',
      backgroundColor: 'rgba(1,1,1,0)'
    },
    scrollbuttondiv: {
      width: '100%',
      position: 'absolute',
      bottom: 10,
      pointerEvents: 'none'
    },
    scrollbutton: {
      backgroundColor: getColorValue(pagedata['scrollButtonsBGColor']),
      color: getColorValue(pagedata['scrollButtonsTextColor']),
      textTransform: 'none'
    }

  }));
  const classes = useStyles();

  return (
    <Box id="tableview" className={classes.root} >
      {groupdata.map((group, index) => (
        <div id="tablegroup" key={index}>
          {(isAccordion && accHeaderIconPosition === 'left') && 
            <Box className={classes.accheader}>
              {!isAccHeaderIcon && <img src={accHeaderIcon} alt="accheaderright" className={classes.accicon}/> }
              {isAccHeaderIcon && <img src={accHeaderIconClose} alt="accheaderright" className={classes.accicon}/> }
              <Typography variant="subtitle2" className={classes.accheaderleft} >{group.Groupby}</Typography>
            </Box>
          }
          {(isAccordion && accHeaderIconPosition === 'right') && 
            <Box className={classes.accheader}>
              <Typography variant="subtitle2" className={classes.accheaderright} >{group.Groupby}</Typography>
              {!isAccHeaderIcon && <img src={accHeaderIcon} alt="accheaderright" className={classes.accicon}/> }
              {isAccHeaderIcon && <img src={accHeaderIconClose} alt="accheaderright" className={classes.accicon}/> }
            </Box>
          }
          {!isAccordion && <Typography variant="subtitle2" className={classes.header} >{group.Title}</Typography>}
          {tablestyle === "Plain" && 
            <div>
              {setMultiColumn && 
                <div className={classes.flexdiv}>
                  {getColumnData(pagedata.columnCount).map((column,colId) => (                
                    <Paper key={colId} id="plain" square={true} elevation={0} className={classes.plainmulticol} style={{marginLeft: (colId===0) ? 0 : columnGap}} >
                      {groupRowsData(group, props.screenIndex).map((cell, cellid) => (
                        <TableCell key={cellid} stylename={cellstyle} appconfig={appConfig} pagedata={props.pagedata} data={cell} groupdata={group} screenIndex={props.screenIndex} screenData={props.screenObj} editorState={props.editorState}/>                
                      ))}              
                    </Paper>
                  ))}  
                </div>
              }
              {!setMultiColumn && 
                <Paper id="plain" square={true} elevation={0} className={classes.groupplain}>
                  {groupRowsData(group, props.screenIndex).map((cell, cellid) => (
                    <TableCell key={cellid} stylename={cellstyle} appconfig={appConfig} pagedata={props.pagedata} data={cell} groupdata={group} screenIndex={props.screenIndex} screenData={props.screenObj} editorState={props.editorState}/>                
                  ))}              
                </Paper>
              } 
            </div>             
          }
          {tablestyle !== "Plain" && 
            <div>
              {setMultiColumn && 
                <div className={classes.flexdiv}>
                  {getColumnData(pagedata.columnCount).map((column,colId) => (                
                    <Paper key={colId} id="grouped" elevation={3} className={classes.groupedmulticol} style={{marginLeft: (colId===0) ? 0 : columnGap}} >
                      {groupRowsData(group, props.screenIndex).map((cell, cellid) => (
                        <TableCell key={cellid} stylename={cellstyle} appconfig={appConfig} pagedata={props.pagedata} data={cell} groupdata={group} screenIndex={props.screenIndex} screenData={props.screenObj} editorState={props.editorState}/>                
                      ))}
                    </Paper>
                  ))}  
                </div>
              }
              {!setMultiColumn && 
                <Paper id="grouped" elevation={3} className={classes.grouped}>
                  {groupRowsData(group, props.screenIndex).map((cell, cellid) => (
                    <TableCell key={cellid} stylename={cellstyle} appconfig={appConfig} pagedata={props.pagedata} data={cell} groupdata={group} screenIndex={props.screenIndex} screenData={props.screenObj} editorState={props.editorState}/>                
                  ))}              
                </Paper>
              } 
           </div>
          }
          <Typography variant="body2" className={classes.footer} >{group.Footer}</Typography>
          {isScrollButtons && 
            <div className={classes.scrollbuttondiv}>
              <Fab color="default" size="small" variant='extended' className={classes.scrollbutton} >
                  Scroll Buttons
              </Fab>
            </div>
          }
        </div>        
      ))}
      
    </Box>
  );
}

function groupRowsData(group, scrIndex) {
  //console.log(scrIndex, "TableView groupRowsData >>>> ", group);
  /* if(group.hasOwnProperty('RecordCells')) {
    const celldata = group['RecordCells'][scrIndex];
    if(celldata) {
      return [celldata];
    }
  } */

  //return group.rowarray;

  let recordArr = [];
  recordArr.push(group.RecordCellDef);
  return recordArr;
}

function getColumnData(columnCount) {
  let colArr = Array.from('C'.repeat(parseInt(columnCount)));
  return colArr;
}


function TableCell(props) {
  const appConfig = props.appconfig;
  const celldata = props.data;
  const cellstyle = props.stylename;
  //console.log(cellstyle, "TableView cell >>>> ", celldata);

  let cellbgColor = (celldata.alternatingRowStyle) ? getColorValue(celldata.alternatingRowColors1) : getColorValue(celldata.backgroundColor);
  let cellBackground = (celldata.backgroundGradient && celldata.backgroundGradient.length > 0) ? celldata.backgroundGradient : cellbgColor;

  const accessoryType = celldata['editingAccessoryType'];
  let showAccessory = (accessoryType === 'none') ? false : true;

  let showCollapsible = false;
  let collapsibleHeight = 0;
  if(props.pagedata['viewType'] === "DbTableViewNestedList"){
    const subCellDef = props.groupdata['SubRecordCellDef'];
    if(subCellDef){
      showCollapsible = true;
      showAccessory = false;
      collapsibleHeight = (subCellDef.height) ? subCellDef.height : 50;
    }
  }
  
  const useStyles = makeStyles(theme => ({
    cell: {        
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
      height: (celldata.height+collapsibleHeight) + 'px',
      backgroundColor: cellbgColor,
      background: cellBackground,
    },
    cellaccessory: {
      width:36,
      height:'100%',
      display: 'flex',
      alignItems: 'center',
    },
    collapsible: {
      width: 24,
      height: celldata.height + 'px',
      display: 'flex',
      alignItems: 'end',
      padding: 0
    },
  }));
  const classes = useStyles();

  let cellMockup;  
  switch (cellstyle) {
    case "contact-form":
      cellMockup = <ContactformCell data={celldata} groupdata={props.groupdata} />;;
      break;
    case "default":
      cellMockup = <DefaultCell data={celldata} groupdata={props.groupdata} />;;
      break;
    case "right-aligned":
      cellMockup = <RightalignedCell data={celldata} groupdata={props.groupdata} />;;
      break;
    case "subtitle":
      cellMockup = <SubtitleCell data={celldata} groupdata={props.groupdata} />;
      break;
    case "simple-grid":
      cellMockup = <SimpleGridCell data={celldata} />;
      break;
    case "tabular-grid":
      cellMockup = <TabularGridCell data={celldata} />;
      break; 
    case "custom":
      cellMockup = <CustomCell appconfig={appConfig} pagedata={props.pagedata} data={celldata} groupdata={props.groupdata} screenIndex={props.screenIndex} screenObj={props.screenData} editorState={props.editorState} />;
      break;   
  
    default:
      cellMockup = [<div key={cellstyle} className={classes.celllayout}><Typography>{celldata.mainText}</Typography><Typography>{celldata.detailText}</Typography></div>];
      break;
  }
  
  return ( 
    <Box id="tablecell" className={classes.cell} >
      {cellMockup}      
      {showCollapsible && 
        <IconButton disabled className={classes.collapsible} style={{'color':'black'}}>
          <ExpandCircleDownIcon/>
        </IconButton>
      }
      {showAccessory && 
        <IconButton disabled className={classes.cellaccessory}>
          {accessoryType === 'indicator' && <AccessoryIndicator/> }
          {accessoryType === 'button' && <img src={AccessoryButton} alt="button" /> }
        </IconButton>
      }
    </Box>   
  );
}

function ContactformCell(props) {
  const useStyles = makeStyles(theme => ({    
    contactformlayout: {
      width:'100%',
      height:'100%',
      display: 'flex',
      alignItems: 'center',
    },
    maintext:{
      width: '40%',
      textAlign: 'left',
      paddingLeft: 4,
      fontSize: 20,
      fontWeight: theme.typography.fontWeightBold,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    detailtext: {
      width: '60%',
      textAlign: 'left',
      paddingLeft: 4,
      fontSize: 13,
      color: 'rgba(55, 81, 130, 1)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }));
  const classes = useStyles();

  const celldata = props.data;
  const recordCellDef = props.groupdata['RecordCellDef'];
  if(recordCellDef) {
    if(recordCellDef.hasOwnProperty('mainText')) {
      celldata['mainText'] = recordCellDef['mainText'];
    }
    if(recordCellDef.hasOwnProperty('detailText')) {
      celldata['detailText'] = recordCellDef['detailText'];
    }
  }

  return ( 
    <Box id="contactform" className={classes.contactformlayout} >
        <Typography className={classes.maintext}>{celldata.mainText}</Typography>
        <Typography className={classes.detailtext}>{celldata.detailText}</Typography>
    </Box>   
  );
}

function DefaultCell(props) {
  const useStyles = makeStyles(theme => ({    
    defaultlayout: {
      width:'100%',
      height:'100%',
      display: 'flex',
      alignItems: 'center',
    },
    mainimage: {
      position: 'absolute',
      width: 32,
      height:'auto',
      top: 4,
      left: 4,
      display:'inline-block'
    },
    maintext:{
      textAlign: 'left',
      paddingLeft: 40,
      fontSize: 20,
      fontWeight: theme.typography.fontWeightBold,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }));
  const classes = useStyles();

  const celldata = props.data;
  const mainimg = celldata['mainImage']['filename'];
  const isMainimgSet = (mainimg.length === 0) ? false : true;

  const recordCellDef = props.groupdata['RecordCellDef'];
  if(recordCellDef) {
    if(recordCellDef.hasOwnProperty('mainText')) {
      celldata['mainText'] = recordCellDef['mainText'];
    }
  }

  return ( 
    <Box id="default" className={classes.defaultlayout} >
        {isMainimgSet && <img src={mainimage} alt="mainimage" className={classes.mainimage} /> }
        <Typography className={classes.maintext}>{celldata.mainText}</Typography>
    </Box>   
  );
}

function SubtitleCell(props) {
  const useStyles = makeStyles(theme => ({    
    subtitlelayout: {
      width:'100%',
      height:'100%',
      display: 'flex',
      flexDirection: 'column',
    },
    mainimage: {
      position: 'absolute',
      width: 32,
      height:'auto',
      top: 4,
      left: 4,
      display:'inline-block'
    },
    maintext:{
      textAlign: 'left',
      paddingLeft: 40,
      fontSize: 20,
      fontWeight: theme.typography.fontWeightBold,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    detailtext: {
      textAlign: 'left',
      paddingLeft: 40,
      fontSize: 13,
      color: 'rgba(135, 135, 135, 1)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

  }));
  const classes = useStyles();

  const celldata = props.data;
  //console.log("SubtitleCell >>>", celldata);
  const mainimg = celldata['mainImage']['filename'];
  const isMainimgSet = (mainimg && mainimg.length === 0) ? false : true;

  const recordCellDef = props.groupdata['RecordCellDef'];
  if(recordCellDef) {
    if(recordCellDef.hasOwnProperty('mainText')) {
      celldata['mainText'] = recordCellDef['mainText'];
    }
    if(recordCellDef.hasOwnProperty('detailText')) {
      celldata['detailText'] = recordCellDef['detailText'];
    }
  }

  return ( 
    <Box id="subtitle" className={classes.subtitlelayout} >
        {isMainimgSet && <img src={mainimage} alt="mainimage" className={classes.mainimage} /> }
        <Typography className={classes.maintext}>{celldata.mainText}</Typography>
        <Typography className={classes.detailtext}>{celldata.detailText}</Typography>
    </Box>   
  );
}

function RightalignedCell(props) {
  const useStyles = makeStyles(theme => ({    
    rightalignedlayout: {
      width:'100%',
      height:'100%',
      display: 'flex',
      alignItems: 'center',
    },
    maintext:{
      width: '50%',
      textAlign: 'left',
      paddingLeft: 4,
      fontSize: 20,
      fontWeight: theme.typography.fontWeightBold,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    detailtext: {
      width: '50%',
      textAlign: 'right',
      paddingLeft: 4,
      fontSize: 13,
      color: 'rgba(55, 81, 130, 1)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }));
  const classes = useStyles();

  const celldata = props.data;
  const recordCellDef = props.groupdata['RecordCellDef'];
  if(recordCellDef) {
    if(recordCellDef.hasOwnProperty('mainText')) {
      celldata['mainText'] = recordCellDef['mainText'];
    }
    if(recordCellDef.hasOwnProperty('detailText')) {
      celldata['detailText'] = recordCellDef['detailText'];
    }
  }

  return ( 
    <Box id="rightaligned" className={classes.rightalignedlayout} >
        <Typography className={classes.maintext}>{celldata.mainText}</Typography>
        <Typography className={classes.detailtext}>{celldata.detailText}</Typography>
    </Box>   
  );
}

function SimpleGridCell(props) {
  const useStyles = makeStyles(theme => ({    
    simplegridlayout: {
      width:'100%',
      height:'100%',
      display: 'flex',
      alignItems: 'center',
    },    
    
  }));
  const classes = useStyles();

  const celldata = props.data;
  const gridFields = celldata.gridFields;  

  return ( 
    <Box id="simplegrid" className={classes.simplegridlayout} >
      {gridFields.map(field => (
        <GridCell key={field.id} data={field}/>
      ))}
    </Box>   
  );
}

function TabularGridCell(props) {
  const useStyles = makeStyles(theme => ({    
    tabularlayout: {
      width:'100%',
      height:'100%',
      display: 'flex',
      alignItems: 'center',
    },
    maintext:{
      width: '50%',
      textAlign: 'left',
      paddingLeft: 4,
      fontSize: 20,
      fontWeight: theme.typography.fontWeightBold,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    detailtext: {
      width: '50%',
      textAlign: 'right',
      paddingLeft: 4,
      fontSize: 13,
      color: 'rgba(55, 81, 130, 1)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  }));
  const classes = useStyles();

  const celldata = props.data;
  const gridFields = celldata.tabularGridFields;

  return ( 
    <Box id="tabulargrid" className={classes.tabularlayout} >
      {gridFields.map(field => (
        <GridCell key={field.id} data={field}/>
      ))}
    </Box>   
  );
}

function GridCell(props) {
  const fielddata = props.data;

  const useStyles = makeStyles(theme => ({
    gridcontainer:{
      height: '100%',
      overflow: 'hidden',
      borderRight: '1px solid',
    },    
    gridfield:{
      height: '100%',
      width: fielddata.width +'px',
    },
  }));
  const classes = useStyles();

  return (
    <Box className={classes.gridcontainer} >
      <Typography className={classes.gridfield}>[{fielddata.fieldname}]</Typography>
    </Box>
  );
}

function CustomCell(props) {
  const appConfig = props.appconfig;
  const celldata = props.data;
  const fields = celldata.Fields;

  const recordCellDef = props.groupdata['RecordCellDef'];
  if(recordCellDef && recordCellDef.hasOwnProperty('Fields')) {
    if(recordCellDef['Fields'] !== fields) {
      console.log(recordCellDef['Fields'], "****** NOT EQUAL TO ******", fields);
      recordCellDef['Fields'] = fields;
    }
  }
  const frame = {x:0, y:0, width: getCellWidth(props.pagedata, props.screenObj['width'], props.screenIndex), height:recordCellDef['height']};
  //console.log(frame, "****** CustomCell ******", props.groupdata, recordCellDef, fields);

  let showCollapsible = false;
  let collapsibleHeight = 0;
  let subfields = [];
  let subframe = {x:0, y:recordCellDef['height'], width: getCellWidth(props.pagedata, props.screenObj['width'], props.screenIndex), height:0};
  let subcellBGColor = {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
  if(props.pagedata['viewType'] === "DbTableViewNestedList"){
    const subCellDef = props.groupdata['SubRecordCellDef'];
    if(subCellDef){
      showCollapsible = true;
      collapsibleHeight = (subCellDef.height) ? subCellDef.height : 50;
      subfields = subCellDef['Fields'];
      subframe['height'] = collapsibleHeight;
      subcellBGColor = subCellDef['backgroundColor'];     
    }
  }
  
  const useStyles = makeStyles(theme => ({    
    customlayout: {
      width:'100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    },
    collapsiblebox: {      
      width: '100%',
      height: collapsibleHeight + 'px',
      position: 'absolute',
      top: celldata.height + 'px',
      backgroundColor: getColorValue(subcellBGColor),
      boxSizing: 'border-box',
      borderTop: '1px solid black',
      //borderBottom: '1px solid black',
    },
  }));
  const classes = useStyles();

  const _layoutState = filterState_byPageid(props.pagedata.pageid, props.editorState);
  let _stateParams = (_layoutState) ? _layoutState['params'] : _layoutState;

  return ( 
    <Box id="custom" className={classes.customlayout}>
      <GridCanvas screenIndex={props.screenIndex} data={props.pagedata} stateParams={_stateParams} frame={frame} />        
      <UIContainer appconfig={appConfig} pagedata={props.pagedata} data={fields} source="tablecell" screenIndex={props.screenIndex} containerFrame={frame} />
      {showCollapsible && 
        <div id="collapsiblebox" className={classes.collapsiblebox}>
          <UIContainer appconfig={appConfig} pagedata={props.pagedata} data={subfields} source="subtablecell" screenIndex={props.screenIndex} containerFrame={subframe} />
        </div>
      }
    </Box>   
  );
}

function getCellWidth(pagedata, scrwidth, scrIndex) {
  //console.log(pagedata, ".... getCellWidth >>", scrwidth);
  if(pagedata['_toolBarLeft'][scrIndex]) {
    if(!pagedata['_toolBarLeft'][scrIndex]['hidden'] &&  pagedata['_toolBarLeft'][scrIndex]['fixed']) {
      scrwidth = scrwidth - pagedata['_toolBarLeft'][scrIndex]['frame']['width'];
    }
  }
  if(pagedata['_toolBarRight'][scrIndex]) {
    if(!pagedata['_toolBarRight'][scrIndex]['hidden'] &&  pagedata['_toolBarRight'][scrIndex]['fixed']) {
      scrwidth = scrwidth - pagedata['_toolBarRight'][scrIndex]['frame']['width'];
    }
  }
  return scrwidth;
}
    
function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

function getIconPath(imageObj, _url, _pid) {
  let imagepath = "";
  
  if (imageObj) {
    if(imageObj['srcLocation'] === 'bundle')
      imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];
    else if(imageObj['srcLocation'] === 'url')
      imagepath = imageObj['url'];
    else if(imageObj['srcLocation'] === 'remoteFile')
      imagepath = imageObj['url'] + imageObj['filename'];
    else
      imagepath = imageObj['filename'];
  }

  return imagepath;
}

function filterState_byPageid(openedpageid, editorstates) {
  let pagestates = (editorstates.hasOwnProperty('_pagestates')) ? editorstates._pagestates : [];  
  let pagestate = pagestates.filter(function(node) {
    if(node[openedpageid]){
      return true;
    }
    return false;
  });  
  if(pagestate.length > 0) {
    return pagestate[0][openedpageid];
  }

  return null;
}
function GridCanvas(props) {

  //console.log(" ## GridCanvas >> ", props.frame);
  let screenIndex = props.screenIndex;
  if(!screenIndex) screenIndex = 0;
  
  const pageData = props.data;
  const layoutWidth = (props.frame) ? props.frame['width'] : (pageData.viewType === "ScrollView") ? pageData.Children[0]._frames[screenIndex].width : pageData.frame.width;
  const layoutHeight = (props.frame) ? props.frame['height'] : (pageData.viewType === "ScrollView") ? pageData.Children[0]._frames[screenIndex].height : pageData.frame.height;
 
  let showgrid = false;
  let gridgap = 10;
  if(props.stateParams) {
    let _params = props.stateParams;
    if(_params) {
      if(_params['showall'] && _params['showall'] === 'on') {        
        showgrid = true;
      }else {
        showgrid = (_params['showgrid'] && _params['showgrid'] === 'on') ? true : false;
      }
      gridgap = (_params['gridgap']) ? _params['gridgap'] : 10;
    }
  }

 
  const gridRows = Math.floor(layoutHeight/gridgap);
  const gridColumns = Math.floor(layoutWidth/gridgap);
  let gridRC = [];
  if(showgrid) {
    for (let i = 0; i < gridRows; i++) {
      let _gridCol = [];
      for (let j = 0; j < gridColumns; j++) {
        _gridCol.push(j);      
      }
      gridRC.push(_gridCol);    
    }
  }
  
  const useStyles = makeStyles(theme => ({
    root: {
      padding: 0,
    },    
    gridcanvas: {
      position: 'absolute',
      width: layoutWidth,
      height: '100%',//`calc(${layoutHeight - contentheight}px)`,
      borderCollapse: 'collapse', 
      borderSpacing: 0,
    },
    gridcell: {
      width: `calc(${gridgap}px)`,
      height: `calc(${gridgap}px)`,
      boxSizing: 'border-box', 
      //border: '1px solid red',
      borderRight: '1px solid red',
      borderBottom: '1px solid red',
      padding: 0,
    },
  }));

  const classes = useStyles();

  return ( 
    <div id="gridcanvas" className={classes.gridcanvas}> 
      <table id="grid" className={classes.gridcanvas}>
        <tbody>
          {gridRC.map((item, index) => (
            <tr key={index} >
              {item.map((item1, index1) => (
                  <td key={index1} className={classes.gridcell} ></td>
              ))}                      
            </tr>
          ))}
        </tbody>
      </table>
    </div>       
  );
}

