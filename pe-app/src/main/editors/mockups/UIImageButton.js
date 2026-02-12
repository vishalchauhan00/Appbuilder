import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import defaultImg from '../../../assets/uimockup/defaultImage.png';


export default function UIImageButton(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;  
  //let uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';
  
  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? uiData.cornerRadius : 0;

  const containerWidth = uiData.frame.width - (2*borderWeight);
  const containerHeight = uiData.frame.height - (2*borderWeight);

  if(!uiData.hasOwnProperty('scaleMode')) {
    uiData['scaleMode'] = "ScaleToFill";
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    btnlayout: {     
      minWidth: 5,
      minHeight: 5,
      height:'100%',
      padding: 0,
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`,    
    },
    imgFill: {
      width:containerWidth,
      height:containerHeight,
      display:'inline-block'
    },
    imgAspect: {
      width:'100%',
      maxHeight:'100%',
      objectFit:'scale-down'
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

  const imageForeground = getImagePath(uiData.normalImage, appConfig.apiURL, appConfig.projectid);
  const imageBackgound = getImagePath(uiData.normalBackgroundImage, appConfig.apiURL, appConfig.projectid);
  //const imageSelectedFG = getImagePath(uiData.selectedImage, appConfig.apiURL, appConfig.projectid);
  //const imageSelectedBG = getImagePath(uiData.selectedBackgroundImage, appConfig.apiURL, appConfig.projectid);
  //console.log(imageForeground, "**", imageBackgound, "**", imageSelectedFG, "**", imageSelectedBG);

  let imgBtn = <img src={defaultImg} alt="img" className={classes.imgFill} />;
  if(imageForeground !== ""){
    imgBtn = <img src={imageForeground} alt="img" className={`${(uiData['scaleMode'] === "ScaleToFill") ? classes.imgFill : classes.imgAspect}`} />;
  }else{
    if(imageBackgound !== "" && imageBackgound.indexOf("defaultImage.png") === -1){
      imgBtn = <img src={imageBackgound} alt="img" className={`${(uiData['scaleMode'] === "ScaleToFill") ? classes.imgFill : classes.imgAspect}`} />;
    }
  }

  return (
    <Button id="imgbutton" disableRipple variant="text" color="default" component="span" fullWidth={true} className={classes.btnlayout}>
      {imgBtn}
    </Button>  
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

function getImagePath(imageObj, _url, _pid) {
  if(imageObj['srcLocation'] === 'bundle'){
    if(imageObj['filename'] !== "" && imageObj['fileext'] !== "")
      return _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'] + '?ts=' + new Date().getTime();
    else{
      if(imageObj['filename'] !== "" && imageObj['fileext'] !== "")
        return _url + "download/image/" + _pid +"/" + imageObj['filename'];
    }
  }
    
  else if(imageObj['srcLocation'] === 'url')
    return imageObj['url'];
  else if(imageObj['srcLocation'] === 'remoteFile')
    return imageObj['url'] + imageObj['filename'];

  return "";
}



