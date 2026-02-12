import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Paper, Typography } from '@material-ui/core';

//import UIContainer from '../UIContainer';
import PageLayoutEditor from '../pageLayoutEditor';


export default function SplitView(props) {

  const appConfig = props.appconfig;
  const pagelist = props.pagelist;
  const scrIndex = (props.screenIndex) ? props.screenIndex : 0;
  const pagedata = props.data;

  let childPagesTop = 0;
  if(!pagedata.StatusBarHidden) childPagesTop += 20;
  if(!pagedata.NavigationBarHidden) childPagesTop += 44;
  if(!pagedata._toolBarTop[scrIndex].hidden) childPagesTop += parseInt(pagedata._toolBarTop[scrIndex].frame.height);

  let splitpages = pagedata['pages'];
  //console.log("SplitView >>>", splitpages); 
  
  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
      backgroundColor: getColorValue(pagedata.backgroundColor),
      width:'inherit',
      height:'inherit',
      position: 'absolute',
      top: childPagesTop,
      overflow: 'auto',
    },
  }));
  const classes = useStyles();

  return (
    <Box id="splitview" className={classes.root} >
      {splitpages.map(page => (
        <SplitChild key={page.id} data={page} pagelist={pagelist} appconfig={appConfig} screenIndex={scrIndex} />
      ))}
      
    </Box>
  );
}

function SplitChild(props) {
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
  
  let pageBGColor = {red: 1, green: 1, blue: 1, alpha: 1, colorName: "" };
  if(childPageDef && childPageDef.length > 0) {
    pageBGColor = childPageDef[0].backgroundColor;
  }

  let pageframe = (childPage._screenFrames[scrIndex]) ? childPage._screenFrames[scrIndex] : childPage.frame;

  const useStyles = makeStyles(theme => ({
    child: { 
      position: 'absolute',       
      top: pageframe.y,
      left: pageframe.x,
      width: pageframe.width,
      height: pageframe.height,
      borderRadius: 0,
      backgroundColor: getColorValue(pageBGColor),
      overflow: 'hidden',
    },
    frame: {
      height: 'inherit',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));
  const classes = useStyles();

  function doubleClickHandler() {
    console.log("doubleClickHandler >>>", childpageId);
  }
  
  return ( 
    <Paper className={classes.child} draggable={false} onDoubleClick={doubleClickHandler}>
      {!childPageDef && <Typography className={classes.frame}>id: {childPage.id}</Typography>}
      {childPageDef && <PageLayoutEditor show={true} data={childPageDef[0]} appconfig={appConfig} screenIndex={scrIndex} haveContainerView={true} />}
    </Paper>   
  );
}



function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

