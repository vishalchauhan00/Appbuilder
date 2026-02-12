import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';


export default function UILinkLabel(props) {
  const uiData = props.data;

  const uiText = (uiData.text) ? uiData.text : "";
  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';
  //console.log(uiVisibility, ">>> LinkLabel >>>>", uiData);

  /* const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = uiData.frame.width;
  const containerHeight = uiData.frame.height; */

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);

  const paddingTop = (uiData.padding) ? uiData.padding.top : 0;
  const paddingBottom = (uiData.padding) ? uiData.padding.bottom : 0;
  const paddingLeft = (uiData.padding) ? uiData.padding.left : 0;
  const paddingRight = (uiData.padding) ? uiData.padding.right : 0;

  const fontSize = (uiData.font) ? uiData.font.fontSize : 0;
  const textColor = (uiData.font) ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = (uiData.font) ? uiData.font.textAlignment : 'left';

  let textDecoration = 'none';
  if(uiData['underline'] && uiData['strikeout'])
    textDecoration = 'line-through underline';
	else if(uiData['underline'])
    textDecoration =  'underline';
	else if(uiData['strikeout'])
    textDecoration =  'line-through';

  const textWidth = parseInt(uiData.frame.width) - (paddingLeft + paddingRight + 2*borderWeight);

  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'middle';
  let marginTop = 0;
  if(verticalAlign === "middle") {
    marginTop = (parseInt(uiData.frame.height) - (paddingTop + paddingBottom + 2*borderWeight + fontSize))/2;
  }else if(verticalAlign === "bottom") {
    marginTop = parseInt(uiData.frame.height) - (paddingTop + paddingBottom + 2*borderWeight + fontSize);
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {     
      //left: `calc(${containerX}px)`,
      //top: `calc(${containerY}px)`,
      //width: `calc(${containerWidth}px)`,
      //height: `calc(${containerHeight}px)`,
      width: '100%',
      height: '100%',
      boxSizing:'border-box',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor),
      display: 'table',
      textAlign : textAlign,     
    },
    uilink: {      
      minWidth: 5,
      minHeight: 5,
      //height:'100%',
      //width:'100%',
      width: textWidth,
      //backgroundColor: getColorValue(uiData.backgroundColor),
      color: textColor,
      fontSize: `calc(${fontSize}px)`,
      textDecoration: textDecoration,
      textTransform: 'none',
      //display: 'table-cell',
      verticalAlign : verticalAlign,
      lineHeight : parseInt(fontSize)+1 +'px',
      textOverflow: 'clip',
      marginTop: marginTop,
    }

  }));

  const classes = useStyles();

  return (
    <Box id="linklabel" className={classes.uilayout} >
      <Typography noWrap={true} className={classes.uilink}>{uiText}</Typography>
    </Box>    
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

