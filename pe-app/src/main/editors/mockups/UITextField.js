import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import personIcon from '../../../assets/uimockup/person.png';
import emailIcon from '../../../assets/uimockup/email.png';
import mobileIcon from '../../../assets/uimockup/mobile.png';
import phoneIcon from '../../../assets/uimockup/phone.png';
import homeIcon from '../../../assets/uimockup/home.png';
import locationIcon from '../../../assets/uimockup/location.png';

export default function UITextField(props) {
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
  if(!uiData.hasOwnProperty('autocomplete')) {
    uiData['autocomplete'] = false;
  }

  var uiText = (uiData.text) ? uiData.text : "";

  let borderWeight = uiData.borderWeight;
  const borderBottomWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  let borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  const textWidth = uiData.frame.width - (paddingLeft + paddingRight + 2*borderWeight);
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
  const textAlign = (uiData.font) ? uiData.font.textAlignment : 'left';
  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'middle';

  let textDecoration = 'none';
  if(uiData['underline'] && uiData['strikeout'])
    textDecoration = 'line-through underline';
	else if(uiData['underline'])
    textDecoration =  'underline';
	else if(uiData['strikeout'])
    textDecoration =  'line-through';

  let textTransform = 'none';
  if(uiData['autocapitalizationType'] === 'Words')
    textTransform = 'capitalize';
  else if(uiData['autocapitalizationType'] === 'AllCharacters')
    textTransform =  'uppercase';
	else if(uiData['autocapitalizationType'] === 'Sentences'){
    textTransform =  'none';
    let _text = "";
    
    uiText = uiText.toString().toLowerCase();
    let arrSentence = uiText.split(".");
    for (let i = 0; i < arrSentence.length; i++) {
      let sentence = arrSentence[i];
      _text += sentence.charAt(0).toUpperCase() + sentence.substr(1).toLowerCase();
    }
    uiText = _text;
  }    
	
  if(uiData['trim']){
    uiText.trim();
  }

  const placeHolder = uiData.placeholder;
  if(!placeHolder){
    uiData.placeholder = "";
  }
  if(!uiData.hasOwnProperty('placeholderColor')) {
    uiData['placeholderColor'] = {"alpha": 1, "red": 0.6, "green": 0.6, "blue": 0.6, "colorName": ""}
  }
  if(placeHolder && placeHolder.length > 0 && uiText.length === 0){
    uiText = placeHolder;
    textColor = getColorValue(uiData['placeholderColor']);
  }

  //const readOnly = (uiData.editable) ? true : false;
  if(uiData.text) {
    if(uiData.secure && uiData.text.length > 0){
      uiText = "*";
      const txtlen = uiData.text.length;
      for (let index = 1; index < txtlen; index++) {
        uiText = uiText + "*";      
      }    
    }
  }
  
  if(!uiData.hasOwnProperty('required')) {
    uiData['required'] = false;
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
      case "person":
        iconsrc = personIcon;
        break;
      case "email":
        iconsrc = emailIcon;
        break;
      case "mobile":
        iconsrc = mobileIcon;
        break;
      case "phone":
        iconsrc = phoneIcon;
        break;
      case "home":
        iconsrc = homeIcon;
        break;
      case "location":
        iconsrc = locationIcon;
        break;
      case "custom":
        iconsrc = getImagePath(uiData.customIcon, appConfig.apiURL, appConfig.projectid);;
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
      width: '100%',
      height: '100%',
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
      minWidth: 5,
      minHeight: 5,
      width:'100%',
      maxWidth: textWidth,
      height: `calc(${textHeight}px)`,
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
    },
    uiicon: {
      minWidth: 20,
      minHeight: 20,
      maxWidth: 64,
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
    <Box id="textfield" className={classes.uilayout} >
      {(showIcon && iconPosition === "start") && 
        <img src={iconsrc} alt={icontype} className={classes.uiicon} />
      } 
      <Typography noWrap={true} className={classes.uitext}>{uiText}</Typography>
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

