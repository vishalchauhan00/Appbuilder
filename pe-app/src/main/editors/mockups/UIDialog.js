import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, List, GridList, GridListTile, Typography, IconButton, Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import UIContainer from '../UIContainer';


export default function UIDialog(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;
  //console.log("..UI Dialog >>>", uiData);

  const pageData = props.pagedata;
  const isLeftbarVisible = !(pageData._toolBarLeft[scrIndex].hidden);
  const isLeftbarFixed = (isLeftbarVisible) ? pageData._toolBarLeft[scrIndex].fixed : false;
  const leftbarWidth = parseInt(pageData._toolBarLeft[scrIndex].frame['width']);
  const isRightbarVisible = (pageData._toolBarRight) ? !(pageData._toolBarRight[scrIndex].hidden) : false;
  const isRightbarFixed = (pageData._toolBarRight && isRightbarVisible) ? pageData._toolBarRight[scrIndex].fixed : false;
  const rightbarWidth = (pageData._toolBarRight) ? parseInt(pageData._toolBarRight[scrIndex].frame['width']) : 0;
  let _containerWidth = parseInt(uiData.frame.width);
  if(isLeftbarVisible && isLeftbarFixed) {
    _containerWidth = _containerWidth - parseInt(leftbarWidth);
  }
  if(isRightbarVisible && isRightbarFixed) {
    _containerWidth = _containerWidth -  parseInt(rightbarWidth);
  }
  //console.log(pageData, "..UI Dialog >>>", _containerWidth);

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  
  const containerWidth = _containerWidth - (paddingLeft+paddingRight + 2*borderWeight);//parseInt(uiData.frame.width) - (paddingLeft+paddingRight + 2*borderWeight);
  const containerHeight = parseInt(uiData.frame.height) - (paddingTop+paddingBottom + 2*borderWeight);
  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';

  const showHeader = (uiData.showheader) ? 'visible' : 'hidden';
  const headerHeight = (uiData.showheader) ? parseInt(uiData.headerheight) : 0;
  const heading = uiData.heading;
  const fontSize = (uiData.headerfont) ? uiData.headerfont.fontSize : 0;
  const textColor = (uiData.headerfont) ? getColorValue(uiData.headerfont.textColor) : 0; 
  const showCloseIcon = (uiData.showclose) ? 'visible' : 'hidden';
  //closeIcon
  const imageCloseHeader = getImagePath(uiData.closeIcon, appConfig.apiURL, appConfig.projectid);
  const showCloseImage = (uiData.showclose && imageCloseHeader.length > 0) ? 'visible' : 'hidden';  

  const showFooter = (uiData.showfooter) ? 'visible' : 'hidden';
  const footerHeight = (uiData.showfooter) ? parseInt(uiData.footerheight) : 0;
  //actionButtons actionbuttonheight actionbuttonwidth actionButtonsColor actionButtonsTintColor 
  const actionbuttonheight = (uiData.actionbuttonheight) ? parseInt(uiData.actionbuttonheight) : 24;
  const actionbuttonwidth = (uiData.actionbuttonwidth) ? parseInt(uiData.actionbuttonwidth) : 64;
  const actionButtonsColor = (uiData.actionButtonsColor) ? getColorValue(uiData.actionButtonsColor) : 0;
  const actionButtonsTintColor = (uiData.actionButtonsTintColor) ? getColorValue(uiData.actionButtonsTintColor) : 0;
  const actionButtonsArray = uiData.actionButtons;
  //console.log(uiData, ".. Dialog >>", actionButtonsArray, actionbuttonheight, actionbuttonwidth, actionButtonsColor, actionButtonsTintColor);

  if(uiData['_selectedIndex'] && (uiData['_selectedIndex'] > uiData.dataarray.length-1)){
    uiData['_selectedIndex'] = 0;
  }
  const _selectedIndex = (uiData['_selectedIndex']) ? uiData['_selectedIndex'] : 0;
  const dataArray = uiData.dataarray[_selectedIndex];
  const itemColumns = parseInt(dataArray.columns);
  const itemRows = parseInt(dataArray.rows);
  const itemGap = (itemRows > 1) ? parseInt(dataArray.gap) : 0;
  let itemHeight = (dataArray.height === 0) ? (containerHeight - itemGap)/itemRows : dataArray.height;  //(containerHeight - itemGap)/itemRows;

  let contentListData = [];
  const itemArray = dataArray.Fields;
  if(itemArray.length > 0) {
    let contentData = new Array(itemColumns).fill(itemArray);
    for (let i = 0; i < itemRows; i++) {
      contentListData.push(contentData);    
    }
    //console.log(itemArray, contentData, ".... UIDialog ....", contentListData);
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      width: containerWidth,
      height: containerHeight,
      backgroundColor: getColorValue(uiData.backgroundColor), 
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`, 
      marginTop : `calc(${paddingTop}px)`,
      marginBottom : `calc(${paddingBottom}px)`,
      marginLeft : `calc(${paddingLeft}px)`,
      marginRight : `calc(${paddingRight}px)`,
      pointerEvents: 'none',
      position: 'absolute',
      left: 0,
    },
    contentlistlayout: {
      width: '100%',
      height: `calc(${containerHeight - headerHeight - footerHeight}px)`,
      padding: 0,
      display: 'flex',      
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden auto',
    },
    contentlayout: {
      width: '100%',
      height: `calc(${itemHeight}px)`,
      display: 'flex',
      //flexDirection: 'column',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
    },
    headerDiv: {
      visibility: showHeader,
      width: '100%',
      height: `calc(${headerHeight - 1}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor), 
      borderBottom: '1px solid',
      display: 'table'
    },
    headerText: {
      textAlign: 'start',
      paddingLeft: 10,
      paddingRight: 70,
      color: textColor,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: 'bold',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      height: '100%',
      lineHeight: 1,
      display: 'table-cell',
      verticalAlign: 'middle'
    },
    headerClose: {
      visibility: showCloseIcon,
      position: 'absolute',
      top: 2,//`calc(${paddingTop + 3}px)`,
      right: 10,//`calc(${paddingRight + 10}px)`,
      padding: 0,
    },
    imgFill: {
      position: 'absolute',
      //top: `calc(${paddingTop + 3}px)`,
      right: 10,//`calc(${paddingRight + 10}px)`,
      width: 60,
      height: 24,
      display: 'inline-block',
    },
    footerDiv: {
      visibility: showFooter,
      width: '100%',
      height: `calc(${footerHeight - 1}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor), 
      borderTop: '1px solid',
    },
    actionbuttonlayout: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      overflow: 'hidden',
    },
    actionbuttontile: {
      width: actionbuttonwidth,
      height: actionbuttonheight,
      margin: '2px 4px',
      display: 'flex',
    },
    actionbuttons: {
      width: actionbuttonwidth,
      height: actionbuttonheight,
      backgroundColor: actionButtonsTintColor,
      textTransform: 'none',
      color: actionButtonsColor,
    },
    
  }));
  const classes = useStyles();

  return (
    <Box id="dialogui" className={classes.uilayout} >
      <div id="headerDiv" className={classes.headerDiv} >
        <Typography className={classes.headerText}>{heading}</Typography>
        {showCloseImage === "hidden" && 
          <IconButton aria-label="Close" className={classes.headerClose}>
            <CloseIcon />
          </IconButton>
        }
        {showCloseImage === "visible" && 
          <img src={imageCloseHeader} alt="close" className={classes.imgFill} />
        }
      </div>
      <List component="nav" dense={true} className={classes.contentlistlayout} >
        {contentListData.map((listData, id) => (
          <GridList key={id} cellHeight={itemHeight} cols={itemColumns} className={classes.contentlayout} style={{margin:0}}>
            {listData.map((item, index) => (
              <GridListTile key={index} cols={1} rows={1}>            
                <UIContainer appconfig={appConfig} data={item} pagedata={props.pagedata} screenIndex={scrIndex} source="Dialog" />           
              </GridListTile>
            ))}
          </GridList>
        ))}
      </List>
      <div id="footerDiv" className={classes.footerDiv} >
        <GridList cols={actionButtonsArray.length} className={classes.actionbuttonlayout} style={{margin:0}}>
          {actionButtonsArray.map((item, index) => (
            <GridListTile key={index} cols={1} rows={1} className={classes.actionbuttontile} style={{width:64, height:24, padding:0}}>            
              <Button className={classes.actionbuttons}>{item.title}</Button>          
            </GridListTile>
          ))}
        </GridList>
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

function getImagePath(imageObj, _url, _pid) {
  if(imageObj['srcLocation'] === 'bundle'){
    if(imageObj['filename'] !== "" && imageObj['fileext'] !== "")
      return _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];
    else{
      if(imageObj['filename'] !== "" && imageObj['fileext'] !== "")
        return _url + "download/image/" + _pid +"/" + imageObj['filename'];
    }
  }
    
  else if(imageObj['srcLocation'] === 'url')
    return imageObj['url'];
  else if(imageObj['srcLocation'] === 'remoteFile')
    return imageObj['url'] + imageObj['filename'];

  return "";
}

