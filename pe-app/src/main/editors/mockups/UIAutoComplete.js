import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, SvgIcon } from '@material-ui/core';


export default function UIAutoComplete(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;  
  uiData['SelectedIndex'] = 0;

  if(!uiData['actions'].hasOwnProperty('DidEndEditing')) {
    delete uiData['actions']['DidPressEnter'];
    uiData['actions']['DidEndEditing'] = [];
  }

  const defaultIcon = uiData['showDefaultIcon']
  let isCustomIcon = false;
  if(uiData['showDefaultIcon']){
    isCustomIcon = (uiData['customIcon'] && uiData['customIcon']['filename'] !== "") ? true : false;
  }  
  const iconSize = 32;

  const _variant = (uiData['showElevation']) ? 'contained' : 'outlined';

  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);
  
  let borderWeight = uiData.borderWeight;
  const borderBottomWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  let borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;
  
  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  
  const textHeight = containerHeight - (paddingTop + paddingBottom) - (2*borderWeight);
  let textWidth = containerWidth - (paddingLeft + paddingRight) - (2*borderWeight) - iconSize;
  if(textWidth < 5) textWidth = 5;

  const fontFamily = (uiData.font && uiData.font.fontName !== 'system') ? uiData.font.fontName : 'Arial';
  const fontSize = (uiData.font) ? uiData.font.fontSize : 0;
  if(!uiData.font.hasOwnProperty('fontWeightNum')){
    uiData.font['fontWeightNum'] = 400;
  }
  const fontWeight = (uiData.font.fontWeightNum) ? uiData.font.fontWeightNum : 400;
  let textColor = (uiData.font) ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = (uiData.font) ? uiData.font.textAlignment : 'left';
  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'middle';
  
  //console.log(uiData['name'], ".. combo box.. >>", uiData);
  if(!uiData.hasOwnProperty('ServiceName')){
    uiData['ServiceName'] = "";
  }
  let uiText;
  if(uiData.type === 'DB'){    
    uiText = uiData.displayText;
  }else{
    if(!uiData.dataarray) {
      uiData['dataarray'] = [{"text":"", "fieldvalue":""}];
    }

    let filteredArray = uiData['dataarray'].filter(function(node) {
      if(node !== null)   
        return true;
      return false;
    });
    uiData.dataarray = filteredArray;

    uiText = uiData.dataarray[0]['text'];
  }  
  
  if(!uiData.hasOwnProperty('placeholderColor')) {
    uiData['placeholderColor'] = {"alpha": 1, "red": 0.6, "green": 0.6, "blue": 0.6, "colorName": ""}
  }
  const placeholder = (uiData['placeholder']) ? uiData['placeholder'] : "";
  if(placeholder.length > 0) {
    uiText = placeholder;
    textColor = getColorValue(uiData['placeholderColor']);
  }

  if(!uiData.hasOwnProperty('multiselect')) {
    uiData['multiselect'] = false;
  }
  if(!uiData.hasOwnProperty('multivalueSeparator')) {
    uiData['multivalueSeparator'] = "comma";
  }
  if(!uiData.hasOwnProperty('checkmarkPosition')) {
    uiData['checkmarkPosition'] = "left";
  }
  if(!uiData.hasOwnProperty('multivalueSelector')) {
    uiData['multivalueSelector'] = "Checkmark";
  }
  if(!uiData.hasOwnProperty('checkmarkPosition')) {
    uiData['checkmarkPosition'] = "left";
  }
  if(!uiData.hasOwnProperty('chipVariant')) {
    uiData['chipVariant'] = "outlined";
  }
  //const uiVariant = (uiData.chipVariant === "outlined") ? uiData.chipVariant : "default";

  if(!uiData.hasOwnProperty('setSelectAll')) {
    uiData['setSelectAll'] = false;
  }
  if(!uiData.hasOwnProperty('selectallValue')){
    uiData['selectallValue'] = "Select All";
  }
  if(placeholder.length === 0 && uiData['setSelectAll']) {
    uiText = (uiData['selectallValue'].length > 0) ? uiData['selectallValue'] : "Select All";
  }

  if(!uiData.hasOwnProperty('variant')) {
    uiData['variant'] = 'outlined';
  }
  if(uiData['variant'] === 'standard'){
    borderWeight = 0;
    borderRadius = 0;
  }

  if(!uiData.hasOwnProperty('setThreshold')) {
    uiData['setThreshold'] = true;
  }
  
  if(!uiData.hasOwnProperty('deleteIcon')) {
    uiData['deleteIcon'] = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
    uiData['actions']['OnDelete'] = [];
  }

  if(!uiData.hasOwnProperty('valueType')) {
    uiData['valueType'] = "Default";
  }
  if(!uiData.hasOwnProperty('multivalueRender')) {
    uiData['multivalueRender'] = "Chip";
    uiData['limitTags'] = 1;
  }  

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: { 
      pointerEvents: 'none',   
      width: '100%',
      height:'100%',
      backgroundColor: getColorValue(uiData.backgroundColor),
      borderLeftWidth : `calc(${borderWeight}px)`,
      borderTopWidth : `calc(${borderWeight}px)`,
      borderRightWidth : `calc(${borderWeight}px)`,
      borderBottomWidth : `calc(${borderBottomWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: borderRadius,
      display: 'table',
      textAlign : textAlign,
      padding: 0, 
      overflow: 'hidden',  
    },
    uitext: {      
      minWidth: 5,
      minHeight: 5,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      height: textHeight,
      width: textWidth,      
      color: textColor,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      display: 'table-cell',
      verticalAlign : verticalAlign,
      textTransform: 'none',
      //borderRight: '1px solid rgb(222,222,222)',
    },
    uiicon: {
     minWidth: 24,
     width: iconSize,
     paddingTop: `calc(${(containerHeight-24)/2}px)`
    },
    customicon: {
      minWidth: 10,
      minHeight: 10,
      width: iconSize,
      height: iconSize,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      paddingTop: `calc(${(containerHeight-24)/2}px)`
    },
  }));

  const classes = useStyles();

  return (
    <Button id="autocomplete" className={classes.uilayout} variant={_variant} color="default" disableRipple fullWidth={true}>
      {(uiData['multiselect'] && uiData['checkmarkPosition'] === "left") &&
        <SvgIcon className={classes.uiicon}><path opacity=".67" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></SvgIcon>
      }
      <Typography className={classes.uitext}>{uiText}</Typography>      
      {(defaultIcon && isCustomIcon) && 
        <img className={classes.customicon} alt="custom" src={getImagePath(uiData.customIcon, appConfig.apiURL, appConfig.projectid)}></img>
      }
      {(defaultIcon && !isCustomIcon) && 
        <SvgIcon className={classes.uiicon}><path opacity=".87" fill="none" d="M24 24H0V0h24v24z"/><path d="M7 10l5 5 5-5z"></path></SvgIcon>
      }
    </Button>  
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

function getImagePath(imageObj, _url, _pid) {
  if(imageObj['srcLocation'] === 'bundle') {
    if(imageObj['filename'] !== "")
      return _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];
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




