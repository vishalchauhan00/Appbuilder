import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, IconButton, Paper } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import UIContainer from '../UIContainer';


export default function UIExpansionPanel(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  
  const containerWidth = parseInt(uiData.frame.width) - (paddingLeft+paddingRight);
  //const containerHeight = parseInt(uiData.frame.height) - (paddingTop+paddingBottom);

  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;
  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  
  if(!uiData.hasOwnProperty('headerBGColor')) {
    uiData['headerBGColor'] = uiData['backgroundColor'];
  }
  const headerHeight = parseInt(uiData.headerheight);
  const fontSize = (uiData.headerfont) ? uiData.headerfont.fontSize : 16;
  //const fontWeight = (uiData.headerfont.fontWeight) ? 'bold' : 'normal';
  if(!uiData.headerfont.hasOwnProperty('fontWeightNum')){
    uiData.headerfont.fontWeightNum = (uiData.headerfont.fontWeight) ? 600 : 400;
  }
  const fontWeight = uiData.headerfont.fontWeightNum;
  const textColor = (uiData.headerfont) ? getColorValue(uiData.headerfont.textColor) : {"alpha": 1, "red": 0, "green": 0, "blue": 0, "colorName": ""}; 

  if(!uiData.hasOwnProperty('subheadingfont')) {
    uiData['subheadingfont'] = {"fontName": "system", "fontSize": 14, "fontWeight": true, "fontStyle": false, "textAlignment": "left", "textColor": {"red": 0, "blue": 0, "green": 0, "alpha": 1, "colorName": ""}, "lineBreakMode": "WordWrap" };
  }
  uiData['subheadingfont']['fontName'] = uiData['headerfont']['fontName'];

  const subheadfontSize = (uiData.subheadingfont) ? uiData.subheadingfont.fontSize : 14;
  //const subheadfontWeight = (uiData.subheadingfont.fontWeight) ? 'bold' : 'normal';
  if(!uiData.subheadingfont.hasOwnProperty('fontWeightNum')){
    uiData.subheadingfont.fontWeightNum = (uiData.subheadingfont.fontWeight) ? 600 : 400;
  }
  const subheadfontWeight = uiData.subheadingfont.fontWeightNum;
  const subheadtextColor = (uiData.subheadingfont) ? getColorValue(uiData.subheadingfont.textColor) : {"alpha": 1, "red": 0, "green": 0, "blue": 0, "colorName": ""}; 

  const headerIconPosition = (uiData.headerIconPosition) ? uiData.headerIconPosition : "right";
  const headerIconClose = getImagePath(uiData.headerIconClose, appConfig.apiURL, appConfig.projectid);
  let customIcon = false;
  if(uiData.headerIconClose.filename.length > 0){
    customIcon = true;
  }
  
  //const itemGap = uiData.gap;
  //let itemHeight = ((containerHeight - headerHeight) - itemGap);

  /*const panelCount = uiData.panelItems.length;
  for (let index = 0; index < panelCount; index++) {
    const element = uiData.panelItems[index];
    if(!element.hasOwnProperty('headerimage')) {
      element['headerimage'] = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
    }
  }*/
  //console.log("** EXpn Panel **", uiData.panelItems);

  if(!uiData.hasOwnProperty('borderSide')) {
    uiData['borderSide'] = ["All"];
  }
  let borderSide = uiData['borderSide'];
  if(borderSide.length > 1){
    if(borderSide.indexOf("All") === 0){
      uiData['borderSide'].splice(0,1);
    }else{
      let selectAll = false;
      if(borderSide.indexOf("All") > 0)   selectAll = true;
      if(borderSide.indexOf("Top") > -1 && borderSide.indexOf("Left") > -1 && borderSide.indexOf("Right") > -1 && borderSide.indexOf("Bottom") > -1)   selectAll = true;

      if(selectAll){
        uiData['borderSide'].splice(0);
        uiData['borderSide'].push("All");
      }
    }
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      //boxSizing: 'border-box',
      position: 'absolute',
      backgroundColor: 'rgba(255,255,255,0)', 
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      pointerEvents: 'none',
    },
    headerDiv: {
      width: containerWidth,
      height: `calc(${headerHeight}px)`,
      backgroundColor: getColorValue(uiData.headerBGColor,true),
      boxSizing: 'border-box',
      display: 'flex'
    },
    headerDivBorder: {      
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderTopLeftRadius: `calc(${borderRadius}px)`,
      borderTopRightRadius: `calc(${borderRadius}px)`,
      borderBottom: 0
    },
    headerBox:{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: '0px 4px'
    },
    headerleft:{
      textAlign: 'left',
      width: '100%',
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      color: textColor,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      //lineHeight: 1,
    },
    headerright:{
      textAlign: 'left',
      width: '100%',
      //height: '100%',
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      color: textColor,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      //lineHeight: 1,
    },
    subheader:{
      textAlign: 'right',
      width: '50%',
      //height: '100%',
      fontSize: `calc(${subheadfontSize}px)`,
      fontWeight: subheadfontWeight,
      color: subheadtextColor,
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      //lineHeight: 1,
    },
    headericon:{
      padding: 4,
      width: (headerHeight/2) +'px',
      height: (headerHeight/2) +'px',
      maxHeight: 32, maxWidth: 32
    },
    contentlistlayout: {
      width: containerWidth,
      //height: `calc(${containerHeight - headerHeight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor),      
      boxSizing: 'border-box',
      display: 'flex',      
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
    },
    panelItemBorder: {
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderBottomLeftRadius: `calc(${borderRadius}px)`,
      borderBottomRightRadius: `calc(${borderRadius}px)`,
    },
    panelItemBorderTop: {
      borderTopWidth : `calc(${borderWeight}px)`,
      borderTopStyle: 'solid',
      borderTopColor: borderColor,
      borderTopLeftRadius: `calc(${borderRadius}px)`,
      borderTopRightRadius: `calc(${borderRadius}px)`,
    },
    panelItemBorderBottom: {
      borderBottomWidth : `calc(${borderWeight}px)`,
      borderBottomStyle: 'solid',
      borderBottomColor: borderColor,
      borderBottomLeftRadius: `calc(${borderRadius}px)`,
      borderBottomRightRadius: `calc(${borderRadius}px)`,
    },
    panelItemBorderRight: {
      borderRightWidth : `calc(${borderWeight}px)`,
      borderRightStyle: 'solid',
      borderRightColor: borderColor,
      borderRightTopRadius: `calc(${borderRadius}px)`,
      borderRightBottomRadius: `calc(${borderRadius}px)`,
    },
    panelItemBorderLeft: {
      borderLeftWidth : `calc(${borderWeight}px)`,
      borderLeftStyle: 'solid',
      borderLeftColor: borderColor,
      borderLeftTopRadius: `calc(${borderRadius}px)`,
      borderLeftBottomRadius: `calc(${borderRadius}px)`,
    }
    
    
  }));
  const classes = useStyles();

  return (

    <Box id="expnpanelui" className={classes.uilayout} >
      {uiData['panelItems'].map((item, index) => 
        <Paper elevation={0} key={'uipanel'+index} style={{marginBottom:uiData.gap, background:'transparent'}}>
          {item.showheader && 
            <Box id="panela-header" aria-controls="panela-content"
                 className={`${classes.headerDiv} 
                             ${(borderSide[0] === "All") ? classes.headerDivBorder : ''}
                             ${(borderSide.indexOf("Top") > -1) ? classes.panelItemBorderTop : ''}
                             ${(borderSide.indexOf("Right") > -1) ? classes.panelItemBorderRight : ''}
                             ${(borderSide.indexOf("Left") > -1) ? classes.panelItemBorderLeft : ''}`} >
              {headerIconPosition === "left" && 
                <Box id="lefticon" className={classes.headerBox}>
                  {!customIcon && 
                    <IconButton aria-label="Close" className={classes.headericon}>
                      <ExpandMoreIcon />
                    </IconButton>
                  }
                  {customIcon && 
                    <img src={headerIconClose} alt="close" className={classes.headericon} />
                  }
                  <Typography className={classes.headerleft}>{item.heading}</Typography>
                  <Typography className={classes.subheader}>{item.subheading}</Typography>
                </Box>
              }
              {headerIconPosition === "right" && 
                <Box id="righticon" className={classes.headerBox}>
                  {isImageSet(item.headerimage) && 
                    <img src={getImagePath(item.headerimage, appConfig.apiURL, appConfig.projectid)} alt="close" className={classes.headericon} />
                  }
                  <Typography className={classes.headerright}>{item.heading}</Typography>
                  <Typography className={classes.subheader}>{item.subheading}</Typography>
                  {!customIcon && 
                    <IconButton aria-label="Close" className={classes.headericon}>
                      <ExpandMoreIcon />
                    </IconButton>
                  }
                  {customIcon && 
                    <img src={headerIconClose} alt="close" className={classes.headericon} />
                  }
                </Box>
              }
            </Box>
          }
          <Box className={`${classes.contentlistlayout} 
                           ${(borderSide[0] === "All") ? classes.panelItemBorder : ''}
                           
                           ${(borderSide.indexOf("Right") > -1) ? classes.panelItemBorderRight : ''}
                           ${(borderSide.indexOf("Left") > -1) ? classes.panelItemBorderLeft : ''}
                           ${(borderSide.indexOf("Bottom") > -1) ? classes.panelItemBorderBottom : ''}`} 
                           style={{height:item.height}}>
            <UIContainer appconfig={appConfig} data={item['Fields']} pagedata={props.pagedata} screenIndex={scrIndex} source={'ExpansionPanel-'+index} />
          </Box>
        </Paper>
      )}
    </Box>

  );
}

function getColorValue(colorObj, opaque) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  if(opaque){
    return 'rgba('+_red+','+_green+','+_blue+',1)';
  }else{
    return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
  }
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

function isImageSet(imageObj){
  if(imageObj && imageObj['srcLocation'] === 'bundle'){
    if(imageObj['filename'] !== "" && imageObj['fileext'] !== ""){
      return true;
    }
  }
  return false;
}

