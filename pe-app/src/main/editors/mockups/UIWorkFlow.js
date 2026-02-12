import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box} from '@material-ui/core';


export default function UIWorkFlow(props) {
  //const appConfig = props.appconfig;
  const uiData = props.data;

  const boxShadowWidth = parseInt(uiData['boxShadowWidth']);
  const boxShadowColor = getColorValue(uiData['boxShadowColor']);
  const boxShadow = (uiData['boxShadow']) ? '2px ' + boxShadowWidth + 'px ' + boxShadowColor : 0;
  
  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = (uiData.padding) ? uiData.padding.top : 0;
  const paddingBottom = (uiData.padding) ? uiData.padding.bottom : 0;
  const paddingLeft = (uiData.padding) ? uiData.padding.left : 0;
  const paddingRight = (uiData.padding) ? uiData.padding.right : 0;

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      width: '100%',
      height: '100%',
      boxSizing:'border-box',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor),
      display: 'table',
      boxShadow: boxShadow,
      background: uiData.backgroundGradient,
    },
    
  }));

  const classes = useStyles();

  return (
    <Box id="dynamicuiview" className={classes.uilayout} >
      
    </Box>
  );
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}


