import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';


export default function UIGoogleSignIn(props) {
  const uiData = props.data;  

  const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);

  const theme = uiData.theme;
  let imgPath = theme.toString().toLowerCase();
  imgPath = '../../../assets/uimockup/gsignin/' + imgPath + ".png";
  
  const shape = uiData.shape;
  let cornerRadius = '2px';
  if(shape === 'Round'){
    if(uiData.style === 'Icon'){
      cornerRadius = '50%';
    }else{
      cornerRadius = '20px';
    }
  } 

  let fillColor = '';
  switch (theme) {
    case "Neutral":
      fillColor = '#F2F2F2';
      break;
    case "Light":
      fillColor = '#FFFFFF';
      break;
    case "Dark":
      fillColor = '#131314';
      break;

    default:
      fillColor = '#F2F2F2';
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
      borderRadius: cornerRadius,
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
      width: 20,
      height: 20,
      position: 'absolute',
      left: 10,
    },
    textlayout: {
      fontFamily: 'Roboto Medium',
      fontSize: 14,
      paddingLeft: 12,
    },
    
  }));

  const classes = useStyles();

  return (
    <Box id="googlesigninview" className={classes.baselayout} >      
      <div id="signindiv" className={classes.divlayout}>
        <img src={imgPath} alt="google-signin" className={classes.imglayout} />
        {(uiData.style === 'Standard') && 
          <Typography className={classes.textlayout}>{uiData.text}</Typography>
        }
      </div>
    </Box>    
  );

}
