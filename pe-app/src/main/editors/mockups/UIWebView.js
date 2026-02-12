import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';


export default function UIWebView(props) {
  const uiData = props.data;
  const webtext = (uiData.filename.url) ? uiData.filename.url : 'Web Page URL';

  let _scalestoFit = uiData['scalesPageToFit'];
  if(typeof _scalestoFit === 'string') {
    _scalestoFit = _scalestoFit.replace("page_","");    
    uiData['scalesPageToFit'] = (_scalestoFit === "true");
  }
  
  const align = (uiData.filename.url) ? 'start' : 'center';
  //console.log(align, ">>> WebView >>>>", uiData);
  const margin = 5;
  const borderWeight = uiData.borderWeight;

  const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = (parseInt(uiData.frame.width) - 2*(borderWeight + margin));
  const containerHeight = (parseInt(uiData.frame.height) - 2*(borderWeight + margin));

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    baselayout: {     
      left: `calc(${containerX}px)`,
      top: `calc(${containerY}px)`,
      width: '100%',
      height:'100%',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: getColorValue(uiData.borderColor), 
      //display: 'table',
      //textAlign : 'center',     
    },
    uiweb: {
      display: 'flex',//'table-cell',
      //verticalAlign : 'middle',
      alignItems: align,
      justifyContent: 'center',
      minWidth: 100,
      minHeight: 40,
      width: `calc(${containerWidth}px)`,
      height: `calc(${containerHeight}px)`,
      padding: margin, 
      backgroundColor: 'rgba(255, 255, 255, 1)',
      color: 'rgba(210, 210, 210, 1)',
      fontSize: 18,
      fontWeight: 'bold',
      textTransform: 'none',
      wordBreak: 'break-word',
      overflow: 'hidden',
    },
  }));

  const classes = useStyles();

  return (
    <Box id="webview" className={classes.baselayout} >
      <Typography className={classes.uiweb}>{webtext}</Typography>
    </Box>    
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

