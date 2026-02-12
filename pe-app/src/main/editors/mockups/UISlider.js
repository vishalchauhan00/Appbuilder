import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Box, Slider } from '@material-ui/core';


export default function UISlider(props) {
  const uiData = props.data;
  
  if(!uiData.hasOwnProperty('direction')) {
    uiData['direction'] = "Horizontal";
  }
  if(!uiData.hasOwnProperty('type')) {
    uiData['type'] = "Default";
  }
  if(!uiData.hasOwnProperty('trackSize')) {
    uiData['trackSize'] = "Default";
  }
  if(!uiData.hasOwnProperty('stepValue')) {
    uiData['stepValue'] = 1;
  }    
  if(!uiData.hasOwnProperty('valueLabelDisplay')) {
    uiData['valueLabelDisplay'] = false;
  }
  const displayLabel = (uiData['valueLabelDisplay']) ? "on" : "auto";

  if(!uiData.hasOwnProperty('isCustomMarks')) {
    uiData['isCustomMarks'] = false;
  }
  if(!uiData.hasOwnProperty('marks')) {
    uiData['marks'] = [{"value":"", "label":""}];
  }
  if(!uiData.hasOwnProperty('displayMarkValue')) {
    uiData['displayMarkValue'] = false;
  }

  const pad = 4;
  const trackHeight = (uiData['trackSize'] === "Default") ? 4 : 2;

  const containerHeight = uiData.frame.height - 2*pad;
  const thumbSize = parseInt(containerHeight);
  const thumbLeft = 0;//thumbSize * -0.5;

  const bgColor = getColorValue(uiData.backgroundColor);
  const filledtrackColor = getColorValue(uiData.trackGradientColor1);
  const trackColor = getColorValue(uiData.trackGradientColor2);
  const thumbColor = getColorValue(uiData.thumbGradientColor1);
  const thumbBorder = getColorValue(uiData.thumbGradientColor2);

  if(uiData['type'] === "Default"){
    uiData.stepValue = uiData.maximumValue - uiData.minimumValue;
  }

  const sliderVal = uiData.currentValue;
  const minVal = uiData.minimumValue;
  const maxVal = uiData.maximumValue;
  const stepVal = uiData.stepValue;
  //console.log("slider >>", uiData);

  let marks = [];
  if(displayLabel === "on"){  
    if(uiData['type'] === "Range"){
      marks.push({value:minVal, label:minVal});
      //marks.push({value:sliderVal, label:sliderVal});
      marks.push({value:maxVal, label:maxVal});
    
    }else{
      if(uiData['isCustomMarks']){
        marks = uiData['marks'];
        
      }else{
        let myval = minVal;
        while (myval <= maxVal) {
          marks.push({value:myval, label:myval});
          myval= myval + stepVal;
        } 
  
        if(uiData['type'] === "Default"){
          marks.push({value:sliderVal, label:sliderVal});
        }
      }
    }
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    btnlayout: {     
      minWidth: 16,
      minHeight: 16,
      width:'100%',
      height: containerHeight, //'100%',
      backgroundColor: bgColor, 
      padding: pad,
      borderWidth: 0,
      borderColor: bgColor,
      borderStyle: 'solid',
      borderRadius: 8,
    },
    
  }));

  const classes = useStyles();  

  const CustomSlider = withStyles({
    root: {
      color: 'rgba(82,175,119,0)',
      height: `calc(${containerHeight}px)`,
      padding: 0,
    },
    track: {
      position: 'absolute',
      top: `calc(50% - ${trackHeight/2}px)`,
      height: `calc(${trackHeight}px)`,
      backgroundColor: filledtrackColor,
      borderRadius: 8,
    },
    rail: {
      position: 'absolute',
      top: `calc(50% - ${trackHeight/2}px)`,
      height: `calc(${trackHeight}px)`,
      backgroundColor: trackColor,
      opacity: 1,
      borderRadius: 8,
    },
    thumb: {
      /* height: 24,
      width: 24,
      marginTop: -8,
      marginLeft: -12, */
      height: `calc(${thumbSize}px)`,
      width: `calc(${thumbSize}px)`,
      marginTop: 0,
      marginLeft: `calc(${thumbLeft}px)`,
      backgroundColor: thumbColor,
      border: '0px solid',
      borderColor: thumbBorder,      
      '&:focus,&:hover,&$active': {
        boxShadow: 'inherit',
      },
      top: '50%',
      transform: 'translate(-50%, -50%)'
    },
    active: {},
    valueLabel: {
      transform: 'scale(1) translateY(-6px) !important',
      left: 'calc(-50% + 8px)',
      backgroundColor: bgColor,
      color: bgColor,
      "& > span > span": {
          color: thumbColor,
          fontSize: '0.875rem',
          fontWeight: 'bold'
      }
    },
    mark: {
      backgroundColor: filledtrackColor,
      width: 16, height: 16,
      top: `calc(50% - 8px)`, marginLeft: -8,
      borderRadius: '50%',
    },
    markActive: {
      backgroundColor: trackColor,
    }
    
  })(Slider);


  return (
    <Box id="slider" className={classes.btnlayout} style={{pointerEvents:'none'}} >
      {uiData['type'] === "Default" && 
        <CustomSlider id="default" valueLabelDisplay={displayLabel} defaultValue={sliderVal} marks={marks} />
      }
      {uiData['type'] === "Range" && 
        <CustomSlider id="range" valueLabelDisplay={displayLabel} value={[minVal,maxVal]} marks={marks} />
      }
      {uiData['type'] === "Discrete" && 
        <CustomSlider id="discrete" valueLabelDisplay={displayLabel} defaultValue={sliderVal} 
                      min={minVal} max={maxVal} step={null} marks={marks}  />
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