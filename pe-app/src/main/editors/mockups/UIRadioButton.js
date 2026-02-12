import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Radio, Box, FormGroup, Typography } from '@material-ui/core';


export default function UIRadioButton(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  if(!uiData.hasOwnProperty('groupNameField')) {
    uiData['groupNameField'] = "";
  }
  
  let uiTitle = (uiData.title) ? uiData.title : "";
  //let uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
    
  const paddingTop = (uiData.padding) ? uiData.padding.top : 0;
  const paddingBottom = (uiData.padding) ? uiData.padding.bottom : 0;
  const paddingLeft = (uiData.padding) ? uiData.padding.left : 0;
  const paddingRight = (uiData.padding) ? uiData.padding.right : 0;
  const textHeight = uiData.frame.height - (paddingTop + paddingBottom) - (2*borderWeight);
  const textWidth = uiData.frame.width - (paddingLeft + paddingRight) - (2*borderWeight);

  const fontFamily = (uiData.normalFont && uiData.normalFont.fontName !== 'system') ? uiData.normalFont.fontName : 'Arial';
  const fontSize = (uiData.normalFont) ? uiData.normalFont.fontSize : 0;
  //const fontWeight = (uiData.normalFont.fontWeight) ? 'bold' : 'normal';
  if(!uiData.normalFont.hasOwnProperty('fontWeightNum')){
    uiData.normalFont.fontWeightNum = (uiData.normalFont.fontWeight) ? 600 : 400;
  }
  const fontWeight = uiData.normalFont.fontWeightNum;
  const fontStyle = (uiData.normalFont.fontStyle) ? 'italic' : 'normal';
  const textColor = (uiData.normalFont) ? getColorValue(uiData.normalFont.textColor) : 0;
  const textAlign = (uiData.normalFont) ? uiData.normalFont.textAlignment : 'left';
  const textTransform = 'none';         
  
  let textDecoration = 'none';
  if(uiData['underline'] && uiData['strikeout'])
    textDecoration = 'line-through underline';
	else if(uiData['underline'])
    textDecoration =  'underline';
	else if(uiData['strikeout'])
    textDecoration =  'line-through';

  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'middle';

  const radVal = (uiData.on) ? 'on' : 'off';
  const imageOff = getImagePath(uiData.normalImage, appConfig.apiURL, appConfig.projectid);
  const imageOn = getImagePath(uiData.selectedImage, appConfig.apiURL, appConfig.projectid);
  let customImg = (uiData.on) ? imageOn : imageOff;


  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    btnlayout: {
      pointerEvents: 'none',     
      minWidth: 24,
      minHeight: 24,
      height: textHeight,//'100%',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor),
      //display: 'table',
      textAlign: textAlign,
      overflow: 'hidden',   
    },
    btngroup: {
      height:'100%',
      display: 'table',
      flexDirection:'row', 
      alignItems:'center'
    },
    btnLabel: {
      paddingLeft: 30,
      width: `calc(${textWidth - 30}px)`,
      height: `calc(${textHeight}px)`,
      lineHeight: '1rem',
      color: textColor,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      textDecoration: textDecoration,
      textTransform: textTransform,
      display: 'table-cell',
      verticalAlign : verticalAlign,
      textOverflow: 'clip',
      overflow: 'hidden',
      whiteSpace: 'pre',    
    },
    customImage: {
      width: 22,
      height: 22,
      position: 'absolute',
      top: `calc(${(uiData.frame.height - 22)/2}px)`, 
      right:0, bottom:0, 
      left: 6,      
      backgroundImage: `url(${customImg})`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
    },

  }));

  const classes = useStyles();

  var radioTag = [<FormGroup key="radgroup" className={classes.btngroup}><RadioUI checked={uiData.on} value={radVal}/><Typography className={classes.btnLabel}>{uiTitle}</Typography></FormGroup>];  

  if(imageOff.length > 0 && imageOn.length > 0){
    radioTag = [<FormGroup key="radgroup" className={classes.btngroup}><RadioUI checked={uiData.on} value={radVal}/><div className={classes.customImage}/><Typography className={classes.btnLabel}>{uiTitle}</Typography></FormGroup>];
  }else{
    if(imageOff.length > 0){
      radioTag = [<FormGroup key="radgroup" className={classes.btngroup}><RadioUI checked={uiData.on} value={radVal}/><div className={classes.customImage}/><Typography className={classes.btnLabel}>{uiTitle}</Typography></FormGroup>];
    }
    if(imageOn.length > 0){
      radioTag = [<FormGroup key="radgroup" className={classes.btngroup}><RadioUI checked={uiData.on} value={radVal}/><div className={classes.customImage}/><Typography className={classes.btnLabel}>{uiTitle}</Typography></FormGroup>];
    }
  }

  return (
    <Box id="radioview" className={classes.btnlayout} >
      {radioTag}
    </Box> 
  );
}

const RadioUI = withStyles({
  root: {
    position: 'absolute',
    top: 2, bottom: 2, left: 2,
    padding: '0px 2px',
  },
  checked: {},
})(props => <Radio color="default" {...props} />);


function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

function getImagePath(imageObj, _url, _pid) {
  if(imageObj['srcLocation'] === 'bundle') {
    if(imageObj['filename'] !== "")
      return _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'] + '?ts=' + new Date().getTime();
    else
      return "";
  }    
  else if(imageObj['srcLocation'] === 'url') {
    if(imageObj['url'] !== "")
      return imageObj['url'];
    else
      return "";
  }    
  else if(imageObj['srcLocation'] === 'remoteFile') {
    if(imageObj['filename'] !== "")
      return imageObj['url'] + imageObj['filename'];
    else
      return "";
  }    

  return "";
}

