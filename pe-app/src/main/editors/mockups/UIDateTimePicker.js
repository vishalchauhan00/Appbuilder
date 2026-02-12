import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import SvgIcon from '@material-ui/core/SvgIcon';


export default function UIDateTimePicker(props) {
  const uiData = props.data; 
  uiData['userInteractionEnabled'] = true;

  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  const textHeight = containerHeight - (paddingTop + paddingBottom + 2*borderWeight);
  let textWidth = containerWidth - (paddingLeft + paddingRight + 2*borderWeight);

  const fontFamily = (uiData.font && uiData.font.fontName !== 'system') ? uiData.font.fontName : 'Arial';
  const fontSize = (uiData.font) ? parseInt(uiData.font.fontSize) : 0;
  let textColor = (uiData.font) ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = (uiData.font) ? uiData.font.textAlignment : 'left';
  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'middle';  
  
  let uiText = uiData.currentDate;  
  const placeHolder = uiData.placeholder;
  if(placeHolder.length > 0 && uiText.length === 0){
    uiText = placeHolder;
    textColor = getColorValue(uiData['placeholderColor']);
  }

  const _variant = (uiData['showElevation']) ? 'contained' : 'outlined';  
  const uiIcon = (uiData.showIcon) ? 'visible' : 'hidden';
  const iconDisplay = (uiData.showIcon) ? 'inline-block' : 'none';
  if(uiData.showIcon){
    textWidth = textWidth - 41;
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
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: borderRadius,
      padding: 0,
      display: 'table',
      textAlign: textAlign,
      textTransform: 'none',
      boxSizing: 'border-box'
    },
    uitext: {      
      minWidth: 5,
      minHeight: 5,
      width: '100%',
      maxWidth: textWidth,
      height: textHeight,
      color: textColor,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      display: 'table-cell',
      verticalAlign : verticalAlign,
      textOverflow: 'clip',      
    },
    svgicon: {
      visibility: uiIcon,
      display: iconDisplay,
      height: '100%',
      padding:'0px 4px',
      color: 'grey'
    },
  }));

  const classes = useStyles();

  return (
    <Box id="DateTimePicker" variant={_variant} className={classes.uilayout}>
      <Typography noWrap={true} className={classes.uitext}>{uiText}</Typography>
      {uiData.mode === "Time" && 
        <SvgIcon className={classes.svgicon}>
          <path opacity=".87" fill="none" d="M24 24H0V0h24v24z"/>
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path>
          <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path>
        </SvgIcon>
      }
      {uiData.mode === "DateTime" && 
        <SvgIcon className={classes.svgicon} >
          <path opacity=".87" fill="none" d="M24 24H0V0h24v24z"/>
          <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"></path>
        </SvgIcon>
      }
    </Box>  
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}




