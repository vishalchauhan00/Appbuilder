import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

export default function UISkeleton(props) {
  const uiData = props.data;
  const uiHeight = parseInt(uiData.frame.height);
  
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    rectanglelayout: {
      display: 'flex',
      alignItems: 'center',
      width:'100%',
      height:uiHeight,      
      backgroundColor: getColorValue(uiData.backgroundColor),
    },
    roundedlayout: {     
      display:'flex',
      width:'100%',
      height:uiHeight,
      backgroundColor: getColorValue(uiData.backgroundColor),
      borderRadius:'8px'
    },
    circularlayout: {
      display: 'flex',
      alignItems: 'start',
      width:uiHeight,
      height:uiHeight,
      backgroundColor: getColorValue(uiData.backgroundColor),
      borderRadius:'50%'

    },
  }));

  const classes = useStyles();

  let uiMockup;
  if(uiData.variant === "circular" ){
    uiMockup = [<div key={uiData.name} className={classes.circularlayout}></div>];
  }else if(uiData.variant === "rounded" ){
    uiMockup = [<div key={uiData.name} className={classes.roundedlayout}></div>];
  }else{
    uiMockup = [<div key={uiData.name} className={classes.rectanglelayout}></div>];
  }

  return (
    <Box id="indicator" className={classes.root} >
      {uiMockup}
    </Box> 
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}