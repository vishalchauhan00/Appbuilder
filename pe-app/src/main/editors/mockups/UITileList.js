import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, List, GridList, GridListTile, Typography } from '@material-ui/core';
import UIContainer from '../UIContainer';
import accHeaderIcon from '../../../assets/accheader.png';


export default function UITileList(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;
  if(!uiData.hasOwnProperty('ServiceName')){
    uiData['ServiceName'] = "";
  }
  if(!uiData.hasOwnProperty('limit')){
    uiData['limit'] = 25;
  }

  const paddingTop = (uiData.padding) ? uiData.padding.top : 0;
  const paddingBottom = (uiData.padding) ? uiData.padding.bottom : 0;
  const paddingLeft = (uiData.padding) ? uiData.padding.left : 0;
  const paddingRight = (uiData.padding) ? uiData.padding.right : 0;

  const dataArray = uiData.dataarray[0];
  const itemColumns = parseInt(dataArray.columns);
  const itemRows = parseInt(dataArray.rows);
  const itemGap = (itemRows > 1 || itemColumns > 1) ? parseInt(dataArray.gap) : 0;

  if(!uiData.hasOwnProperty('showarrow')){
    uiData['showarrow'] = false;
  }
  if(!uiData.hasOwnProperty('shownext')){
    uiData['shownext'] = false;
  }
  let displayHnext = (uiData.shownext && uiData.direction === 'Horizontal') ? true : false;
  let nextItemWid = (displayHnext) ? (10+itemGap) : 0;
  let displayVnext = (uiData.shownext && uiData.direction === 'Vertical') ? true : false;
  let nextItemHie = (displayVnext) ? (10+itemGap) : 0;
  
  const containerWidth = uiData.frame.width - (paddingLeft+paddingRight) + 1;
  const containerHeight = uiData.frame.height - (paddingTop+paddingBottom) + 1;
  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';
  const showPaging = (uiData.paging) ? 'visible' : 'hidden';
  let pagingHeight = 0;
  if(uiData.paging){
    if(uiData.direction === 'Vertical'){
      pagingHeight = 30;
    }else{
      pagingHeight = 20;
    }
  }
  
  const itemHeight = ((containerHeight - nextItemHie) - pagingHeight - ((itemRows-1)*itemGap))/itemRows;
  const itemWidth = (containerWidth - nextItemWid - ((itemColumns-1)*itemGap))/itemColumns;
  
  dataArray['height'] = itemHeight;
  dataArray['width'] = itemWidth;
  //console.log(scrIndex, uiData, ".... UITileList ....", dataArray);

  let tileListData = [];
  const itemArray = dataArray.Fields;
  if(itemArray.length > 0) {
    let tileData = new Array(itemColumns).fill(itemArray);
    for (let i = 0; i < itemRows; i++) {
      tileListData.push(tileData);    
    }
    //console.log(itemArray, tileData, ".... UITileList ....", tileListData);
  }

  if(!uiData.hasOwnProperty('isAccordian')) {
    uiData['isAccordian'] = false;
    uiData['accHeaderHeight'] = 32;
    uiData['accHeaderBGColor'] = {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
    uiData['accHeaderTextColor'] = {"alpha": 1, "red": 0, "green": 0, "blue": 0, "colorName": ""};
    uiData['accHeaderIconOpen'] = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
    uiData['accHeaderIconClose'] = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
    uiData['accHeaderIconPosition'] = "left";
    uiData['accRecordsCount'] = true;
    uiData['accHeaderBorderWeight'] = 1;
    uiData['Groupby'] = "";
  }
  const isAccordion = (uiData.direction === "Vertical" && uiData.isAccordian) ? uiData.isAccordian : false;
  const accHeaderHeight = (isAccordion && uiData.hasOwnProperty('accHeaderHeight')) ? ((uiData.accHeaderHeight) ? uiData.accHeaderHeight : 32) : 0;
  const accHeaderBGColor = (uiData.accHeaderBGColor) ? uiData.accHeaderBGColor : {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
  const accHeaderTextColor = (uiData.accHeaderTextColor) ? uiData.accHeaderTextColor : {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
  const accHeaderIconPosition = (uiData.accHeaderIconPosition) ? uiData.accHeaderIconPosition : "left";
  const accHeaderIconClose = getIconPath(uiData.accHeaderIconClose, appConfig.apiURL, appConfig.projectid);
  let isAccHeaderIcon = false;
  if(isAccordion && uiData.accHeaderIconClose.filename.length > 0){
    isAccHeaderIcon = true;
  }
  const accHeaderBorderWeight = (uiData.hasOwnProperty('accHeaderBorderWeight')) ? uiData.accHeaderBorderWeight : 1;

  if(!uiData.hasOwnProperty('collapsible')) {
    uiData['collapsible'] = false;
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      width: '100%',//containerWidth,
      height: '100%',//containerHeight,
      backgroundColor: getColorValue(uiData.backgroundColor),  
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`, 
      pointerEvents: 'none',
      border: '1px solid',
      boxSizing: 'border-box',
    },
    tilelistlayout: {
      width: containerWidth,//'100%',
      height: `calc(${containerHeight - pagingHeight - accHeaderHeight}px)`,
      padding: 0,
      display: 'flex',      
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      overflow: 'hidden',
      //flexDirection: 'column'
    },
    tilelayout: {
      width: '100%',
      height: `calc(${itemHeight}px)`,
      display: 'flex',
      //flexDirection: 'column',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    pagingDiv: {
      visibility: showPaging,
      width: '100%',
      height: pagingHeight,
      backgroundColor: 'transparent',
      border: '1px solid rgba(0, 0, 0, 0.5)',
      display: 'flex',
    },
    hidden: {
      width:'100%',
      height:'100%',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    visible: {
      width:'100%',
      height:'100%',
    },
    accheader:{
      width: '100%',
      height: accHeaderHeight +'px',
      backgroundColor: getColorValue(accHeaderBGColor),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      boxSizing:'border-box',
      //borderWidth : `calc(${accHeaderBorderWeight}px)`,      
      //borderStyle: 'solid',
      border: `solid calc(${accHeaderBorderWeight}px)`
    },
    accicon:{
      padding: 4,
      width: (accHeaderHeight - 8) +'px',
    },
    accheaderleft:{
      textAlign: 'left',
      width: '100%',
      //height: '100%',
      color: getColorValue(accHeaderTextColor),
      fontWeight: theme.typography.fontWeightBold,
    },
    accheaderright:{
      textAlign: 'left',
      width: '100%',
      //height: '100%',
      paddingLeft: 12,
      color: getColorValue(accHeaderTextColor),
      fontWeight: theme.typography.fontWeightBold,
    },
    horizontalnext:{
      height: '100%', 
      width: 10,
    },
    verticalnext:{
      width: '100%', 
      height: 10,
    }
    
  }));
  const classes = useStyles();
  

  return (
    <Box id="tilelist" className={classes.uilayout} >
    {(isAccordion && accHeaderIconPosition === 'left') && 
        <Box className={classes.accheader}>
          {!isAccHeaderIcon && <img src={accHeaderIcon} alt="accheaderright" className={classes.accicon}/> }
          {isAccHeaderIcon && <img src={accHeaderIconClose} alt="accheaderright" className={classes.accicon}/> }
          <Typography variant="subtitle2" className={classes.accheaderleft} >{uiData.Groupby}</Typography>
        </Box>
      }
      {(isAccordion && accHeaderIconPosition === 'right') && 
        <Box className={classes.accheader}>
          <Typography variant="subtitle2" className={classes.accheaderright} >{uiData.Groupby}</Typography>
          {!isAccHeaderIcon && <img src={accHeaderIcon} alt="accheaderright" className={classes.accicon}/> }
          {isAccHeaderIcon && <img src={accHeaderIconClose} alt="accheaderright" className={classes.accicon}/> }
        </Box>
      }
      <List component="nav" dense={true} className={classes.tilelistlayout} >
        {tileListData.map((listData, id) => (
          <GridList key={id} cellHeight={itemHeight} cols={itemColumns} className={classes.tilelayout} style={{margin:0}}>
            {listData.map((item, index) => (
              <GridListTile key={index} cols={1} rows={1} style={{height:'100%', width:itemWidth, padding:0}}>
                <UIContainer appconfig={appConfig} data={item} pagedata={props.pagedata} screenIndex={scrIndex} source="TileList" />           
              </GridListTile>
            ))}
            {displayHnext && 
              <GridListTile id="horizontalnext" style={{width:10, height:117, padding:0, margin:0, marginLeft:itemGap}} >
                <Box style={{height:'100%', width:'100%', padding:0, backgroundColor:'darkgrey'}}></Box>        
              </GridListTile>
            }
          </GridList>
        ))}              
        {displayVnext && 
          <GridList id="verticalnext" className={classes.verticalnext} style={{margin:0, marginTop:itemGap}} >
            <Box style={{height:'100%', width:'100%', padding:0, backgroundColor:'darkgrey'}}></Box>        
          </GridList>
        }
      </List>
      <div id="pagingDiv" className={classes.pagingDiv} style={{justifyContent:(uiData.direction === 'Vertical' ? 'end' : 'center')}} >
        {uiData.direction === 'Horizontal' && 
          <svg height="18" width={containerWidth}>
            <circle cx={containerWidth/2} cy="9" r="8" stroke="black" strokeWidth="1" fill="grey" />
            Sorry, your browser does not support inline SVG.  
          </svg> 
        }
        {uiData.direction === 'Vertical' && 
          <img src="assets/uimockup/list-paging.png" alt="list-paging" height={28}></img>
        }
      </div>
    </Box>
  );
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

