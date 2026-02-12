import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import mobileIcon from '../../../assets/uimockup/mobile.png';
import phoneIcon from '../../../assets/uimockup/phone.png';


export default function UINumField(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;  
  if(uiData['displayFormat'] === "Number" && uiData['numberDataType'] !== "") {
    if(!uiData['_numberFormat'])  uiData['_numberFormat'] = {};    
    //uiData['numberFormat'] = uiData['_numberFormat'].toString();
    if(typeof(uiData['_numberFormat']) === "string") {
      uiData['numberFormat'] = uiData['_numberFormat'].toString();
    }else {
      if(uiData['_numberFormat'].hasOwnProperty('value')) {
        uiData['numberFormat'] = uiData['_numberFormat']['value'];
      }else {
        uiData['numberFormat'] = "";
      }
    }
  }
  if(uiData['fieldname'] && uiData['fieldname'] !== "") {
    uiData['fieldname'] = uiData['text'];
  }

  if(!uiData['actions'].hasOwnProperty('DidPressEnter')) {
    uiData['actions']['DidPressEnter'] = [];
  }
  if(!uiData.hasOwnProperty('required')) {
    uiData['required'] = false;
  }

  let uiText = (uiData.text) ? uiData.text : "";

  let borderWeight = uiData.borderWeight;
  const borderBottomWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  let borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  const textHeight = uiData.frame.height - (paddingTop + paddingBottom + 2*borderWeight);

  const fontFamily = (uiData.font && uiData.font.fontName !== 'system') ? uiData.font.fontName : 'Arial';
  const fontSize = (uiData.font) ? uiData.font.fontSize : 0;
  //const fontWeight = (uiData.font.fontWeight) ? 'bold' : 'normal';
  if(!uiData.font.hasOwnProperty('fontWeightNum')){
    uiData.font.fontWeightNum = (uiData.font.fontWeight) ? 600 : 400;
  }
  const fontWeight = uiData.font.fontWeightNum;
  const fontStyle = (uiData.font.fontStyle) ? 'italic' : 'normal';
  let textColor = (uiData.font) ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = (uiData.font) ? uiData.font.textAlignment : 'right';
  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'middle';

  if(!uiData.hasOwnProperty('placeholder')){
    uiData['placeholder'] = "";
  }
  if(!uiData.hasOwnProperty('placeholderColor')) {
    uiData['placeholderColor'] = {"alpha": 1, "red": 0.6, "green": 0.6, "blue": 0.6, "colorName": ""}
  }
  const placeHolder = (uiData.placeholder) ? uiData.placeholder : "";
  if(placeHolder.length > 0 && uiText.length === 0){
    uiText = placeHolder;
    textColor = getColorValue(uiData['placeholderColor']);
  }
  //const readOnly = (uiData.editable) ? true : false;  
  if(uiData.text){
    if(uiData.secure && uiData.text.length > 0){
      uiText = "*";
      const txtlen = uiData.text.length;
      for (let index = 1; index < txtlen; index++) {
        uiText = uiText + "*";      
      }    
    }
  }

  if(!uiData.hasOwnProperty('showIcon')) {
    uiData['showIcon'] = false;
    uiData['iconPosition'] = "start";
  }
  const showIcon = (uiData.showIcon) ? true : false;
  let iconPosition = uiData['iconPosition'];
  let icontype = "icon";
  let iconsrc = "";
  if(showIcon){
    icontype = uiData['iconType'];
    switch (icontype) {
      case "mobile":
        iconsrc = mobileIcon;
        break;
      case "phone":
        iconsrc = phoneIcon;
        break;
      case "custom":
        iconsrc = getImagePath(uiData.customIcon, appConfig.apiURL, appConfig.projectid);
        break;
    
      default:
        iconsrc = "";
        break;
    }
  }
  
  if(!uiData.hasOwnProperty('setInputlabel')) {
    uiData['setInputlabel'] = (uiData.placeholder.length > 0) ? true : false;
  }
  if(!uiData.hasOwnProperty('onfocusBackgroundColor')) {
    uiData['onfocusBackgroundColor'] = uiData.backgroundColor;
  }
  if(!uiData.hasOwnProperty('onfocusBorderColor')) {
    uiData['onfocusBorderColor'] = uiData.borderColor;
  }
  if(!uiData.hasOwnProperty('boxShadow')) {
    uiData['boxShadow'] = false;
    uiData['boxShadowWidth'] = 4;
    uiData['boxShadowColor'] = {"alpha": 1, "red": 0.870588, "green": 0.870588, "blue": 0.870588, "colorName": ""};
  }
  const boxShadowWidth = parseInt(uiData['boxShadowWidth']);
  const boxShadowColor = getColorValue(uiData['boxShadowColor']);
  const boxShadow = (uiData['boxShadow']) ? '0px ' + boxShadowWidth + 'px ' + boxShadowColor : 0;

  if(!uiData.hasOwnProperty('variant')) {
    uiData['variant'] = 'outlined';
  }
  if(uiData['variant'] === 'standard'){
    borderWeight = 0;
    borderRadius = 0;
  }

  if(!uiData['textColorRef']){
    uiData['textColorRef'] = "";
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      minWidth: 16,
      minHeight: 16,
      width:'100%',
      height:'100%',     
      //left: `calc(${containerX}px)`,
      //top: `calc(${containerY}px)`,
      //width: `calc(${containerWidth}px)`,
      //height: `calc(${containerHeight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor),
      boxSizing:'border-box',
      borderLeftWidth : `calc(${borderWeight}px)`,
      borderTopWidth : `calc(${borderWeight}px)`,
      borderRightWidth : `calc(${borderWeight}px)`,
      borderBottomWidth : `calc(${borderBottomWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      display: 'table',
      textAlign : textAlign,
      boxShadow: boxShadow,
      background: uiData.backgroundGradient     
    },
    uitext: {
      textTransform: 'none',
      minWidth: 5,
      minHeight: 5,
      //height:'100%',
      width:'100%',
      height: `calc(${textHeight}px)`,
      color: textColor,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      display: 'table-cell',
      verticalAlign : verticalAlign,
    },
    uiicon: {
      minWidth: 20,
      minHeight: 20,
      maxWidth: 32,
      maxHeight: 64,
      //padding: `calc(${paddingTop}px)`,
      height: `calc(${textHeight}px)`,
      verticalAlign : 'middle'
    },
    itemRequired: {
      width: 16,
      height: `calc(${textHeight}px)`,
      marginLeft: 5,
      color: 'red',
      fontSize: 32,
      position: 'absolute',
      left: uiData.frame.width,
      top: 0,
    },
  }));

  const classes = useStyles();

  return (
    <Box id="numview" className={classes.uilayout} >
      {(showIcon && iconPosition === "start") && 
        <img src={iconsrc} alt={icontype} className={classes.uiicon} />
      } 
      <Typography className={classes.uitext}>{uiText}</Typography>
      {(showIcon && iconPosition === "end") && 
        <img src={iconsrc} alt={icontype} className={classes.uiicon} />
      }
      <Typography className={classes.itemRequired} style={{display:(uiData.required) ? 'flex' : 'none'}}>*</Typography>
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
  let imagepath = "";

  if(imageObj['srcLocation'] === 'bundle') {
    if(imageObj['filename'] !== "" && imageObj['fileext'] !== "") {
      imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];
    }else {
      if(imageObj['filename'] !== "") {
        imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'];
      }else {
        imagepath = "";
      }
    }
  }
  return imagepath;
}
