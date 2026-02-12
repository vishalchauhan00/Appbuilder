import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

import v2Checkbox from '../../../assets/uimockup/gsignin/v2checkbox.png';
import v2Invisible from '../../../assets/uimockup/gsignin/v2invisible.png';

export default function UIGoogleCaptcha(props) {
  const uiData = props.data;  

  const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);

  const theme = uiData.theme;
  let fillColor = '';
  switch (theme) {
    case "light":
      fillColor = '#FFFFFF';
      break;
    case "dark":
      fillColor = '#131314';
      break;
    default:
      fillColor = '#F2F2F2';
      break;
  }

  const type = uiData.type;
  let imgPath = theme.toString().toLowerCase();
  switch (type) {
    case "Checkbox":
      imgPath = v2Checkbox;
      break;
    case "Invisible":
      imgPath = v2Invisible;
      break;
    default:
      imgPath = v2Checkbox;
      break;
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    baselayout: {     
      left: `calc(${containerX}px)`,
      top: `calc(${containerY}px)`,
      width: `calc(${containerWidth}px)`,
      height: `calc(${containerHeight}px)`,
      backgroundColor: fillColor,
      border: '1px solid',
      borderColor: fillColor,
      borderRadius: 4,
      padding : 0,
      boxSizing: 'border-box'
    },    
    divlayout: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    imglayout: {
      width: '100%',
      height: '100%',
    }
    
  }));

  const classes = useStyles();

  return (
    <Box id="googlecaptchaview" className={classes.baselayout} >      
      <div id="captchadiv" className={classes.divlayout}>
        <img src={imgPath} alt="google-recaptcha" width={containerWidth} height={containerHeight} />
      </div>
    </Box>    
  );

}
