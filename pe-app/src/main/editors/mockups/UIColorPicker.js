import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Box, InputBase } from '@material-ui/core';

export default function UIColorPicker(props) {
  const uiData = props.data;

  const containerHeight = uiData.frame.height;
  const containerWidth = uiData.frame.width;

  const hexval = uiData.value.toUpperCase();

  const borderWeight = parseInt(uiData.borderWeight);
  //const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const fontFamily = (uiData.font && uiData.font.fontName !== 'system') ? uiData.font.fontName : 'Arial';
  const fontSize = (uiData.font) ? parseInt(uiData.font.fontSize) : 0;
  const textColor = (uiData.font) ? getColorValue(uiData.font.textColor) : 0;
  
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },    
    divlayout: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      pointerEvents: 'none'
    },
    uilayout: {     
      height: `calc(${containerHeight}px)`,
      width: containerWidth,
      display: 'flex',
      flexDirection: 'row',  
      alignItems: 'center',
      padding: 0, 
    },
    uiPicker: {      
      inlineSize: `calc(${containerHeight}px)`,
      blockSize: `calc(${containerHeight}px)`,
    },

  }));

  const classes = useStyles();  

  const ColorInput = withStyles(theme => ({
    root: {
      position: 'absolute',
      left: `calc(${containerHeight}px)`,
      width: 70,
      height: `calc(${containerHeight}px)`,
      margin: 0
    },
    input: {
      width: '100%',
      height: '100%',    
      padding: theme.spacing(0,0.5),
      backgroundColor: getColorValue(uiData.backgroundColor),
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: uiData.value,
      borderRadius: borderRadius,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      color: textColor,
      boxSizing: 'border-box'
    },
  }))(InputBase);

  function handleChangeValue(){
    console.log("***************");
  }

  return (
    <div key={uiData.name} className={classes.divlayout}>
      <Box id="colorpicker" className={classes.uilayout} >
        <input type="color" value={uiData.value}  className={classes.uiPicker} 
               onChange={handleChangeValue} />
        {uiData.showLabel && 
          <ColorInput required type="text" value={hexval} inputProps={{ maxLength: 6 }} >
          </ColorInput>
        }
      </Box>
    </div> 
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}


