import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar} from '@material-ui/core';
import defaultImg from '../../../assets/uimockup/defaultAvatar.png';


export default function UIAvatar(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;
  
  const type = uiData.type;
  let avatarText = (uiData.avatarTxt && uiData.avatarTxt.length > 0) ? uiData.avatarTxt.substring(0, 1).toUpperCase() : "A";

  let avatarIcon = getImagePath(uiData.avatarSrc, appConfig.apiURL, appConfig.projectid);
  //console.log(avatarIcon, "****************", defaultImg);
  if(avatarIcon === ""){
    avatarIcon = defaultImg;
  }

  if(!uiData.hasOwnProperty('avatarImg')){
    uiData['avatarImg'] = {"srcLocation": "url", "filename": "", "fileext": "", "url": ""};
  }
  const avatarImage = getImagePath(uiData.avatarImg, appConfig.apiURL, appConfig.projectid);  

  let size = 40;
  if(uiData['size']){
    switch (uiData['size']) {
      case "small":
        size = 32;
        break;
      case "medium":
        size = 40;
        break;
      case "large":
        size = 48;
        break;
      case "xlarge":
        size = 64;
        break;    
      default:
        size = 40;
        break;
    }
  }
 // uiData.frame['width'] = uiData.frame['height'] = size;
  const fontSize = (size === 32) ? 16 : (size-16);
  const radius = (uiData.variant === "rounded") ? '50%' : 0;

  const bgColor = getColorValue(uiData.backgroundColor);

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    letterlayout: {     
      minWidth: 5,
      minHeight: 5,
      width: size,
      height:size,
      backgroundColor: bgColor,
      borderRadius: radius,    
      padding: 0,
      display: 'flex',
      fontSize: fontSize,
    },
    imagelayout: {     
      minWidth: 5,
      minHeight: 5,
      width: size,
      height: size,
      backgroundColor: bgColor,
      borderRadius: radius,    
      padding: 0,
      display: 'flex',
      overflow: 'auto',
    },
    imgfill: {
      //width:size,
      //height:size,
      display:'inline-block'
    },
    imgicon: {
      width:'100%',
      maxHeight:'100%',
      objectFit:'scale-down'
    },
  }));

  const classes = useStyles();

  return (
    <div id="iconbutton" className={classes.root}>
      {type === "Letter" && 
        <Avatar className={classes.letterlayout} variant="rounded">{avatarText}</Avatar>
      }
      {type === "Icon" && 
        <div className={classes.imagelayout}><img src={avatarIcon} alt="icon" width={size} height={size} /></div>
      }
      {type === "Image" && 
        <div className={classes.imagelayout}><img src={avatarImage} alt="img" width={size} height={size} className={classes.imgfill} /></div>
      }
    </div>
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

  if(imageObj['srcLocation'] === 'bundle'){
    if(imageObj['filename'] !== "" && imageObj['fileext'] !== "")
      return _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'] + '?ts=' + new Date().getTime();
    else{
      if(imageObj['filename'] !== "" && imageObj['fileext'] !== "")
        return _url + "download/image/" + _pid +"/" + imageObj['filename'];
    }
  }else if(imageObj['srcLocation'] === 'url') {    
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
  
    //console.log('url >>>', imageObj);
  }



