import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Box, Slider, CircularProgress } from '@material-ui/core';


export default function UIProgress(props) {
  const uiData = props.data;
  //uiData['arcRadius'] = 28;
  
  //const containerWidth = uiData.frame.width;
  const containerHeight = parseInt(uiData.frame.height);

  if(!uiData.hasOwnProperty('arcRadius'))    uiData['arcRadius'] = 28;
  const diameter = 2*parseInt(uiData['arcRadius']);

  const bgColor = getColorValue(uiData.backgroundColor);
  const fillColor = getColorValue(uiData.fillColor);

  const progressVal = (uiData.progress) *100;
  const thumbSize = uiData.frame.height;
  const thumbLeft = (progressVal === 0) ? 0 : thumbSize * -0.5;

  if(!uiData.hasOwnProperty('borderColor')){
    uiData['borderColor'] = {"alpha": 1, "red": 0, "green": 0, "blue": 0, "colorName": ""};
    uiData['borderWeight'] = 1;
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    btnlayout: {     
      minWidth: 120,
      minHeight: 8,
      width:'100%',
      height:'100%',  
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
    circleroot: {
      position: 'relative',
    },
    circletop: {
      position: 'absolute',
      color: bgColor
    },
    circlebottom: {
      color: fillColor,
      //animationDuration: '550ms',
      //position: 'absolute',
      //left: 0,
    },
  }));

  const classes = useStyles();  

  const ProgressBar = withStyles({
    root: {
      color: '#52af77',
      height: containerHeight,
      padding: 0,
    },
    track: {
      height: containerHeight,
      backgroundColor: fillColor,
      borderRadius: 8,
    },
    rail: {
      height: containerHeight,
      backgroundColor: bgColor,
      borderRadius: 8,
      opacity: 1,
    },
    thumb: {
      visibility: 'hidden',
      height: thumbSize,
      width: thumbSize,
      marginTop: 0,
      marginLeft: `calc(${thumbLeft}px)`,
      backgroundColor: fillColor,
      border: '2px solid',
      borderColor: fillColor,
      '&:focus,&:hover,&$active': {
        boxShadow: 'inherit',
      },
    },
    active: {},
    valueLabel: {
      left: 'calc(-50% + 4px)',
    },
    
  })(Slider);
  
  


  let progressMockup;
  if(uiData.style === "Circle"){
    progressMockup = [<div key={uiData.name} className={classes.circleroot}>
                          <CircularProgress variant="determinate" value={100} className={classes.circletop} size={diameter} thickness={8} {...props}/>
                          <CircularProgress variant="determinate" value={progressVal} className={classes.circlebottom} size={diameter} thickness={8} {...props} />
                      </div>]
    //progressMockup = <CircularProgress variant="static" value={progressVal} size={containerHeight} thickness={4} />
  }else{
    progressMockup = <ProgressBar valueLabelDisplay="off" defaultValue={0} value={progressVal} />
  }

  return (
    <Box id="progress" className={classes.btnlayout} >
      {progressMockup}
    </Box> 
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}