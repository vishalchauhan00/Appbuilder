import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';


export default function UIRoundButton(props) {
  const uiData = props.data;
  uiData['type'] = "text";
  
  let uiTitle = (uiData.title) ? uiData.title : "";
  //let uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = 10;
  
  const paddingTop = (uiData.padding) ? uiData.padding.top : 0;
  const paddingBottom = (uiData.padding) ? uiData.padding.bottom : 0;
  const paddingLeft = (uiData.padding) ? uiData.padding.left : 0;
  const paddingRight = (uiData.padding) ? uiData.padding.right : 0;
  const textHeight = uiData.frame.height - (paddingTop + paddingBottom + 2*borderWeight);

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

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,      
    },
    btnlayout: {    
      minWidth: 16,
      minHeight: 16,
      width: '100%',
      height:'100%',
      boxSizing:'border-box',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: borderRadius,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor),
      display: 'table',
      textAlign : textAlign,
      overflow: 'hidden',
    },
    btnText: {
      width:'100%',
      height: `calc(${textHeight}px)`,
      lineHeight: '1rem',
      color: textColor,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      fontStyle: fontStyle,      
      textDecoration: textDecoration,
      textTransform: textTransform,
      wordWrap: wordWrap,
      whiteSpace: whiteSpace,
      display: 'table-cell',
      verticalAlign : verticalAlign,      
    },
    
  }));

  const classes = useStyles();

  return (
    <Button id="roundbutton" className={classes.btnlayout} variant="contained" color="default" disableRipple disableElevation fullWidth={true}>
      <Typography className={classes.btnText}>{uiTitle}</Typography>
    </Button>  
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}


