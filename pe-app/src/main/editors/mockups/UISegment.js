import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ButtonGroup, Button, Typography } from '@material-ui/core';


export default function UISegment(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;

  //segmentedControlStyle : Plain, Bezeled
  //segmentInitialValue

  const borderWeight = (uiData.borderWeight) ? parseInt(uiData.borderWeight) : 1;
  const borderColor = (uiData.borderColor) ? getColorValue(uiData.borderColor) : 'rgba(0,0,0,1)';
  const bgroundColor = getColorValue(uiData.tintColor);

  const segmentItems = uiData.segmentItems;
  const itemHeight = parseInt(uiData.frame.height) - (2*borderWeight + 4);
  const itemWidth = parseInt(uiData.frame.width)/segmentItems.length - (2*borderWeight + 4);
  const itemTextColor = getColorValue(segmentItems[0].font.textColor);

  const fontFamily = (segmentItems[0].font && segmentItems[0].font.fontName !== 'system') ? segmentItems[0].font.fontName : 'Arial';
  
  let selectedSegmentIndex = -1;
  for (let index = 0; index < segmentItems.length; index++) {
    const segmentElem = segmentItems[index];
    segmentElem['font']['textColor'] = segmentItems[0].font.textColor;

    segmentElem['onTapTextColor']['alpha'] = 1;

    if(segmentElem['type'] === "TextItem" && segmentElem['text'] !== "") {
      if(segmentElem['text'] === uiData['segmentInitialValue']){
        selectedSegmentIndex = index;
      }
    }
  }
  const selectedItemTintColor = (selectedSegmentIndex  >-1) ? getColorValue(segmentItems[selectedSegmentIndex].onTapTintColor) : bgroundColor;
  const selectedItemTextColor = (selectedSegmentIndex  >-1) ? getColorValue(segmentItems[selectedSegmentIndex].onTapTextColor) : itemTextColor;  

  //const itemImage = getImagePath(segmentItems[1].imageDic, appConfig.apiURL, appConfig.projectid);
  //console.log(uiData.name, "*segmentItems***", segmentItems);

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    btnlayout: {
      pointerEvents: 'none',    
      width:'100%',
      height: '100%',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      boxSizing: 'border-box',
      overflow: 'auto hidden',
    },
    itemlayout: {     
      minWidth: 30,
      minHeight: 10,
      width: '100%',
      height: '100%',
      padding: 2,
      backgroundColor: bgroundColor,      
      textTransform: 'none',
    },
    textitemlayout: {      
      width:'100%',
      height:'100%',
      color: itemTextColor,
      fontFamily: fontFamily,
      fontSize: segmentItems[0].font.fontSize,
    },
    imgitemlayout: {     
      minWidth: 10,
      minHeight: 10,
      width: itemWidth,
      height: itemHeight,
      //backgroundImage: `url(${itemImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    btnText: {
      width: '100%',
      height: '100%',           
    },
       
  }));

  const classes = useStyles();

  return (     
    <ButtonGroup id="segment" variant="contained" color="primary" className={classes.btnlayout}>
      {segmentItems.map((item, index) => (
        <Button key={index} className={classes.itemlayout} style={{borderColor: borderColor, backgroundColor : (index === selectedSegmentIndex) ? selectedItemTintColor : bgroundColor }}>
          {item.type === "TextItem" && 
            <Typography className={classes.textitemlayout} style={{fontSize: parseInt(item.font.fontSize), color : (index === selectedSegmentIndex) ? selectedItemTextColor : itemTextColor}}>{item.text}</Typography>            
          }
          {item.type === "ImageItem" && 
            <img className={classes.imgitemlayout} alt="item" src={getImagePath(item.imageDic, appConfig.apiURL, appConfig.projectid)}></img>
          }
        </Button>
      ))}
    </ButtonGroup>
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);
  
  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';  
}

function getImagePath(imageObj, _url, _pid) {
  if(imageObj['srcLocation'] === 'bundle') {
    if(imageObj['filename'] !== "")
      return _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'] + '?ts=' + new Date().getTime();
    else
      return "";
  }    
  else if(imageObj['srcLocation'] === 'url') {
    if(imageObj['url'] !== "")
      return imageObj['url'];
    else
      return "";
  }    
  else if(imageObj['srcLocation'] === 'remoteFile') {
    if(imageObj['filename'] !== "")
      return imageObj['url'] + imageObj['filename'];
    else
      return "";
  }    

  return "";
}



