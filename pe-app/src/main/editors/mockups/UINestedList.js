import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box} from '@material-ui/core';

import defaultBotAvatar from '../../../assets/uimockup/chatbots/bot.png';
import UIContainer from '../UIContainer';


export default function UINestedList(props) {
  const appConfig = props.appconfig;
  const uiData = props.data; 

  const uiBackgroundColor = getColorValue(uiData.backgroundColor);
  const uiBackground = (uiData.backgroundGradient && uiData.backgroundGradient.lengrh > 0) ? uiData.backgroundGradient : uiBackgroundColor;
  
  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const boxShadowWidth = parseInt(uiData['boxShadowWidth']);
  const boxShadowColor = getColorValue(uiData['boxShadowColor']);
  const boxShadow = (uiData['boxShadow']) ? '2px ' + boxShadowWidth + 'px ' + boxShadowColor : '0px 0px ' + boxShadowColor;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;

  const uicontentWidth = parseInt(uiData.frame.width) - (paddingLeft + paddingRight);

  //main-cell
  const maincellBgColor = getColorValue(uiData.mainCellDef.backgroundColor);
  const maincellBackground = (uiData.mainCellDef.backgroundGradient && uiData.mainCellDef.backgroundGradient.lengrh > 0) ? uiData.mainCellDef.backgroundGradient : maincellBgColor;
  const maincellborderWeight = uiData.mainCellDef.borderWeight;
  const maincellborderColor = getColorValue(uiData.mainCellDef.borderColor);
  const maincellborderRadius = (uiData.chatInputcornerRadius) ? parseInt(uiData.chatInputcornerRadius) : 0;
  
  let maincellCollaseIcon = getImagePath(uiData.mainCellDef.collapseIcon, appConfig.apiURL, appConfig.projectid);
  if(maincellCollaseIcon === "")  maincellCollaseIcon = defaultBotAvatar;
  
  const maincellheight = uiData.mainCellDef.height;
  const maincellFrame = { x:0, y:0, width: uicontentWidth, height:maincellheight };
  const maincellFields = uiData.mainCellDef.Fields;

  //sub-cell
  const subcellBgColor = getColorValue(uiData.subCellDef.backgroundColor);
  const subcellBackground = (uiData.subCellDef.backgroundGradient && uiData.subCellDef.backgroundGradient.lengrh > 0) ? uiData.subCellDef.backgroundGradient : subcellBgColor;
  const subcellborderWeight = uiData.subCellDef.borderWeight;
  const subcellborderColor = getColorValue(uiData.subCellDef.borderColor);
  const subcellborderRadius = (uiData.chatInputcornerRadius) ? parseInt(uiData.chatInputcornerRadius) : 0;
  
  const subcellheight = uiData.subCellDef.height;
  const subcellFrame = { x:0, y:0, width: uicontentWidth, height:subcellheight };
  const subcellFields = uiData.subCellDef.Fields;

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      width: '100%',
      height: '100%',
      background: uiBackground,
      boxSizing:'border-box',
      boxShadow: boxShadow,
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 0
    },
    maincellbox: {
      width: '100%',
      height: maincellheight,
      padding: '6px',
      background: maincellBackground,
      boxSizing:'border-box',
      borderBottom : `calc(${maincellborderWeight}px) solid`,
      borderColor: maincellborderColor,
      borderRadius: `calc(${maincellborderRadius}px)`,
      pointerEvents: 'none',
    },
    subcellbox: {
      width: '100%',
      height: subcellheight,
      padding: '0px 4px',
      background: subcellBackground,
      boxSizing:'border-box',
      borderBottom : `calc(${subcellborderWeight}px) solid`,
      borderColor: subcellborderColor,
      borderRadius: `calc(${subcellborderRadius}px)`,
      pointerEvents: 'none',
    },
    smallicon: {
      width: 32, height: 32,
      borderRadius: '50%'
    }
    
  }));

  const classes = useStyles();

  return (
    <Box id="nestedlistview" className={classes.uilayout} >
      <div id="nestedlist-container" className={classes.container}>
        <div className={classes.maincellbox}>
          <UIContainer appconfig={appConfig} pagedata={props.pagedata} data={maincellFields} source="maincell"
             screenIndex={props.currentScreenIndex} containerFrame={maincellFrame} />
        </div>
        <div className={classes.subcellbox}>
          <UIContainer appconfig={appConfig} pagedata={props.pagedata} data={subcellFields} source="subcell"
             screenIndex={props.currentScreenIndex} containerFrame={subcellFrame} />
        </div>
      </div>
    </Box>
  );
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

function getImagePath(imageObj, _url, _pid) {
  let imagepath = "";

  if(imageObj['srcLocation'] === 'bundle') {
    if(imageObj['filename'] !== "" && imageObj['fileext'] !== "") {
      imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];
    }else {
      if(imageObj['filename'] !== "") {
        imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'];
      }else {
        imagepath = "";
      }
    }
  }
  else if(imageObj['srcLocation'] === 'url') {    
    imagepath = imageObj['imageName'];
    setURLImage_FileAndExt(imageObj);
  }    
  else if(imageObj['srcLocation'] === 'remoteFile')
    imagepath = imageObj['url'] + imageObj['filename'];
  else
    imagepath = imageObj['filename'];

  return imagepath;
}

function setURLImage_FileAndExt(imageObj) {
  if(imageObj.hasOwnProperty('imageName')) {

    const strVal = imageObj['imageName'];
    if(strVal.length > 0){
      const refStartIndex = strVal.indexOf("[");
      const refEndIndex = strVal.indexOf("]");
      if(refStartIndex > -1) {
        if(refEndIndex > -1 && refEndIndex > refStartIndex) {
          imageObj['url'] = imageObj['filename'] = imageObj['fileext'] = "";
        }
      }else {
        imageObj['url'] = strVal.substring(0, strVal.lastIndexOf("/"));
        let strImageName = strVal.substring(strVal.lastIndexOf("/") + 1);
        if(strImageName.indexOf(".") > -1) {
          imageObj['filename'] = strImageName.substring(strImageName.lastIndexOf("/") + 1, strImageName.lastIndexOf("."));
          imageObj['fileext'] = strImageName.substr(strImageName.lastIndexOf(".") + 1, strImageName.length);
        }else {
          imageObj['filename'] = strImageName.substring(strImageName.lastIndexOf("/") + 1, strImageName.length);
          imageObj['fileext'] = "";
        }
      }
    }else {
      imageObj['url'] = imageObj['filename'] = imageObj['fileext'] = "";
    }
  }else {
    if(imageObj['fileext'] !== "") {
      imageObj['imageName'] = imageObj['url'] +"/"+ imageObj['filename'] +"."+ imageObj['fileext'];
    }else {
      imageObj['imageName'] = imageObj['url'] +"/"+ imageObj['filename'];
    }
  }
}