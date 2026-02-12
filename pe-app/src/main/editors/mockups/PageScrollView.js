import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Typography } from '@material-ui/core';

import PageLayoutEditor from '../pageLayoutEditor';


export default function PageScrollView(props) {

  const appConfig = props.appconfig;
  const pagelist = props.pagelist;
  const scrIndex = (props.screenIndex) ? props.screenIndex : 0;
  const pagedata = props.data;
  let childPagesTop = 0;
  if(!pagedata.StatusBarHidden) childPagesTop += 20;
  if(!pagedata.NavigationBarHidden) childPagesTop += 44;
  if(!pagedata._toolBarTop[scrIndex].hidden) childPagesTop += parseInt(pagedata._toolBarTop[scrIndex].frame.height);
  
  let pagescrollpages = pagedata.Children[0]['pages'];
  //console.log(pagedata, ".. PageScrollView >>>> ", pagescrollpages);
   
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
      backgroundColor: getColorValue(pagedata.backgroundColor),
      width:'inherit',
      height:'inherit',
      position: 'absolute',
      top: childPagesTop,
      overflow: 'auto hidden',
      //display: 'flex',
      //flexDirection: 'column',
    },
  }));
  const classes = useStyles();

  return (
    <Box id="pagescrollview" className={classes.root} >
      {pagescrollpages.map((page, index) => (
        <PageScrollChild key={index} pos={index} data={page} pagelist={pagelist} appconfig={appConfig} appData={props.appData} screenIndex={scrIndex} />
      ))}
      
    </Box>
  );
}

function PageScrollChild(props) {
  const appConfig = props.appconfig;
  const pageList = props.pagelist;
  const childPage = props.data;
  const scrIndex = props.screenIndex;

  const childDef = childPage['pagedef'];
  let childpageId = (childDef.filename.length > 0) ? (childDef.filename.replace("page_","")) : "";
  let childPageDef;
  if(childpageId.length > 0) {
    childPageDef =  pageList.filter(function(_page) {
      return _page['pageid'] === childpageId;
    });
  }
  
  let childWid = 0;
  let leftShift = 0;
  let pageBGColor = {red: 1, green: 1, blue: 1, alpha: 1, colorName: "" };
  if(childPageDef && childPageDef.length > 0) {
    //console.log(childpageId, ".. PageScrollChild >>>> ", childPageDef[0]);
    childWid = childPageDef[0].frame.width;
    leftShift = childPageDef[0].frame.width * props.pos;
    pageBGColor = childPageDef[0].backgroundColor;
  }

  //let pageframe = {width: 320, height: 480, x: 0, y: 0};
  

  const useStyles = makeStyles(theme => ({
    child: { 
      position: 'absolute',       
      top: 0,
      left: leftShift,
      width: childWid,
      height: '100%',
      borderRadius: 0,
      backgroundColor: getColorValue(pageBGColor),
      overflow: 'hidden',
    },
  }));
  const classes = useStyles();

  function doubleClickHandler() {
    console.log("doubleClickHandler >>>", childpageId);
  }
  
  return ( 
    <Paper className={classes.child} draggable={false} onDoubleClick={doubleClickHandler}>
      {!childPageDef && <Typography>{childPage.id}</Typography>}
      {childPageDef && <PageLayoutEditor show={true} appconfig={appConfig} appData={props.appData} pageList={pageList} data={childPageDef[0]} screenIndex={scrIndex} haveContainerView={true} />}
    </Paper>   
  );
}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

/* function getIconPath(imageObj, _url, _pid) {
  let imagepath = "";
  
  if(imageObj['srcLocation'] === 'bundle')
    imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];
  else if(imageObj['srcLocation'] === 'url')
    imagepath = imageObj['url'];
  else if(imageObj['srcLocation'] === 'remoteFile')
    imagepath = imageObj['url'] + imageObj['filename'];
  else
    imagepath = imageObj['filename'];

  return imagepath;
} */

