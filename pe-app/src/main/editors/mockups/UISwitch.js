import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Box, Switch } from '@material-ui/core';


export default function UISwitch(props) {
  const uiData = props.data;
  
  //let uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';

  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);

  let thumbTranslate = containerWidth - (containerHeight);

  let thumbSize = containerHeight - 2;
  if(borderWeight && borderWeight > 0){
    thumbSize = containerHeight - 2*borderWeight;
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    btnlayout: {     
      minWidth: 16,
      minHeight: 16,
      width:'100%',
      height:'100%',
      //borderWidth : `calc(${borderWeight}px)`,
      //borderStyle: 'solid',
      //borderColor: borderColor,       
    },    
    hidden: {
      width:'100%',
      height:'100%',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    visible: {
      width:'100%',
      height:'100%',
    },
  }));

  const classes = useStyles();  

  const BTNSwitch = withStyles(theme => ({
    root: {
      width: containerWidth,
      height: containerHeight,
      padding: 0,
      margin: 0,
    },
    switchBase: {
      padding: 0,
      top: `calc(${borderWeight}px)`, 
      left: `calc(${borderWeight}px)`,
      '&$checked': {
        transform: `translateX(${thumbTranslate}px)`,
        color: theme.palette.grey[600],
        '& + $track': {
          backgroundColor: '#cccccf',
          opacity: 1,
          //border: 'none',
          borderWidth : `calc(${borderWeight}px)`,
          borderStyle: 'solid',
          borderColor: borderColor,
        },
      },
      '&$focusVisible $thumb': {
        color: '#cccccf',
        border: '6px solid #fff',
      },
    },
    thumb: {
      width: thumbSize,
      height: thumbSize,
    },
    track: {
      height: `calc(${thumbSize}px)`,
      borderRadius: containerHeight / 2,
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      backgroundColor: theme.palette.grey[300],
      opacity: 1,
      transition: theme.transitions.create(['background-color', 'border']),
    },
    checked: {},
    focusVisible: {},
  }))(({ classes, ...props }) => {
    return (
      <Switch
        focusVisibleClassName={classes.focusVisible}
        disableRipple
        classes={{
          root: classes.root,
          switchBase: classes.switchBase,
          thumb: classes.thumb,
          track: classes.track,
          checked: classes.checked,
        }}
        {...props}
      />
    );
  });

  const switchVal = (uiData.on) ? 'on' : 'off';
  

  return (
    <Box id="switch" className={classes.btnlayout} >
      <BTNSwitch checked={uiData.on} value={switchVal} />
    </Box> 
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}


