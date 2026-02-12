import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Typography } from '@material-ui/core';


export default function UITextButton(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;
  
  let uiTitle = (uiData.title) ? uiData.title : "";
  //console.log(uiData.name, ">>> TextButton >>>>", JSON.stringify(uiData));
  
  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? uiData.cornerRadius : 0;

  const paddingTop = (uiData.padding) ? uiData.padding.top : 0;
  const paddingBottom = (uiData.padding) ? uiData.padding.bottom : 0;
  const paddingLeft = (uiData.padding) ? uiData.padding.left : 0;
  const paddingRight = (uiData.padding) ? uiData.padding.right : 0;

  const textHeight = uiData.frame.height - (paddingTop + paddingBottom + 2*borderWeight);

  //const fontFamily = (uiData.normalFont) ? uiData.normalFont.fontName : 'system';
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

  let wordWrap = 'normal';
  let whiteSpace = 'pre';
  if(uiData['normalFont']['lineBreakMode'] === 'WordWrap'){
    wordWrap = 'break-word';
    whiteSpace = 'pre-wrap';
  }          
  
  let textDecoration = 'none';
  if(uiData['underline'] && uiData['strikeout'])
    textDecoration = 'line-through underline';
	else if(uiData['underline'])
    textDecoration =  'underline';
	else if(uiData['strikeout'])
    textDecoration =  'line-through';

  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'middle';

  const imageNormal = getImagePath(uiData.normalBackgroundImage, appConfig.apiURL, appConfig.projectid);
  const imageSelected = getImagePath(uiData.selectedBackgroundImage, appConfig.apiURL, appConfig.projectid);

  //console.log(uiData, ".. TextButton ..", imageNormal, imageSelected);

  let bgImg = "";
  if(imageNormal !== ""){
    bgImg = imageNormal;
  }else {
    if(imageSelected !== ""){      
      bgImg = imageSelected;
    }
  }

  if(!uiData.hasOwnProperty('backgroundGradient')) {
    uiData['backgroundGradient'] = "";
  }

  if(!uiData.hasOwnProperty('scaleMode')) {
    uiData['scaleMode'] = "ScaleToFill";
  }

  if(!uiData.hasOwnProperty('mouseoverTintColor')) {
    uiData['mouseoverTintColor'] = {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
    uiData['mouseoverTextColor'] = {"alpha": 1, "red": 0, "green": 0, "blue": 0, "colorName": ""};
  }

  if(!uiData['textColorRef']){
    uiData['textColorRef'] = "";
    uiData['mouseoverTintColorRef'] = "";
    uiData['mouseoverTextColorRef'] = "";
  }

  //console.log(uiData.name, "**** TB ****", JSON.stringify(uiData));
 
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
      width:'100%',
      height:'100%',
    },
    btnlayout: {     
      minWidth: 16,
      minHeight: 16,
      width:'100%',
      height:'100%',
      boxSizing:'border-box',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,      
      display: 'table',
      textAlign : textAlign,
      overflow: 'hidden',
      background : (uiData['backgroundGradient'].length > 0) ? uiData['backgroundGradient'] : theme.palette.grey[100],
    },
    btnText: {
      width:'100%',
      height: `calc(${textHeight}px)`,
      //lineHeight: '1rem',
      color: textColor,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      fontStyle: fontStyle,      
      textDecoration: textDecoration,
      textTransform: textTransform,      
      wordWrap: wordWrap,
      whiteSpace: whiteSpace,
      //whiteSpace: 'nowrap',
      //overflow: 'hidden',
      //textOverflow: 'ellipsis',
      display: 'table-cell',
      verticalAlign : verticalAlign,      
    },    
    btnbackground: {
      position: 'absolute',
      top:0, right:0, bottom:0, left:0,
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`,      
      backgroundImage: `url(${bgImg})`,
      backgroundSize: (uiData['scaleMode'] === "AspectFit") ? "contain" : `${uiData.frame.width}px ${uiData.frame.height}px`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      display: 'flex',
    },
    textfill: {
      width: `calc(100% - ${(paddingRight+paddingLeft+2*borderWeight)}px)`,
      height: `calc(100% - ${(paddingTop+paddingBottom+2*borderWeight)}px)`,
      display: 'table',
      textAlign : textAlign,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
    },
    
  }));

  const classes = useStyles();  

  return (
    <div id="textbutton" className={classes.root}>    
      {(bgImg.length === 0) && 
        <Button id="textbtn" className={classes.btnlayout} variant="contained" color="default" disableRipple disableElevation fullWidth={true}>
          <Typography className={classes.btnText}>{uiTitle}</Typography> 
        </Button>
      }
      {(bgImg.length > 0) && 
        <Box className={classes.btnbackground}>
          <span className={classes.textfill}><Typography className={classes.btnText}>{uiTitle}</Typography></span>
        </Box>
      }
    </div>
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
      return _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];// + '?ts=' + new Date().getTime();
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

