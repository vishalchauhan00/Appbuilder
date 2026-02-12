import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import indicatorWhite from '../../../assets/uimockup/indicator_White.png';
import indicatorGray from '../../../assets/uimockup/indicator_Gray.png';


export default function UIIndicator(props) {
  const uiData = props.data;
  
  // set values of 'StartIndicator' & 'StopIndicator' on the base of 'InitialState', needed for RTs.
  if(uiData.hasOwnProperty('InitialState')) {
    uiData['StartIndicator'] = (uiData['InitialState'] === "start") ? true : false;
    uiData['StopIndicator'] = (uiData['InitialState'] === "stop") ? true : false;
  }
  
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    medialayout: {
      width:'100%',
      height:'100%',
      display: 'flex',
      alignItems: 'center',
      //border: '1px solid',
    },
    imglayout: {
      width:'100%',
      height:'auto',
      display:'inline-block'
    },
  }));

  const classes = useStyles();

  let uiMockup;
  if(uiData.Style === "Gray" ){
    uiMockup = [<div key={uiData.name} className={classes.medialayout}><img src={indicatorGray} alt="sound" className={classes.imglayout} /></div>];
  }else{
    uiMockup = [<div key={uiData.name} className={classes.medialayout}><img src={indicatorWhite} alt="sound" className={classes.imglayout} /></div>];
  }

  return (
    <Box id="indicator" className={classes.root} >
      {uiMockup}
    </Box> 
  );

}