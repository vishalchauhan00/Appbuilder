import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, List, GridList, GridListTile } from '@material-ui/core';

import UIContainer from '../UIContainer';


export default function UIDrawer(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  //const currentScreen = props.screendata[scrIndex];
  const uiData = props.data;
  //console.log(currentScreen, "..UI Drawer >>>", uiData);
  
  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;
  const cornerRadius = (uiData.style === "plain") ? 0 : 10;
  
  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  
  const defaultWidth = parseInt(uiData.frame.width);//(currentScreen['width']) ? parseInt(currentScreen['width']) : parseInt(uiData.frame.width);
  const defaultHeight = parseInt(uiData.frame.height);//(currentScreen['height']) ? parseInt(currentScreen['height']/2) : parseInt(uiData.frame.height);
  let containerHeight = defaultHeight - (paddingTop+paddingBottom + 2*borderWeight);
  //let containerWidth = defaultWidth - (paddingLeft+paddingRight + 2*borderWeight);

  const showHeader = (uiData.showdragIndicator) ? 'visible' : 'hidden';
  const headerHeight = (showHeader === 'visible') ? 10 : 0;
  const showClose = (uiData.showclose) ? 'visible' : 'hidden';  
  const footerHeight = (showClose === 'visible') ? 24 : 0;
  containerHeight = containerHeight - headerHeight - (footerHeight+1);

  const dataArray = uiData.dataarray[0];
  const itemColumns = parseInt(dataArray.columns);
  const itemRows = parseInt(dataArray.rows);
  const itemGap = (itemRows > 1) ? parseInt(dataArray.gap) : 0;
  let itemHeight = (dataArray.height === 0) ? (containerHeight - itemGap)/itemRows : dataArray.height;

  let contentListData = [];
  const itemArray = dataArray.Fields;
  if(itemArray.length > 0) {
    let contentData = new Array(itemColumns).fill(itemArray);
    for (let i = 0; i < itemRows; i++) {
      contentListData.push(contentData);    
    }
    //console.log(itemArray, contentData, ".... UIDialog ....", contentListData);
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      width: defaultWidth,
      //height: containerHeight,
      backgroundColor: getColorValue(uiData.backgroundColor), 
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`, 
      //marginTop : `calc(${paddingTop}px)`,
      //marginBottom : `calc(${paddingBottom}px)`,
      //marginLeft : `calc(${paddingLeft}px)`,
      //marginRight : `calc(${paddingRight}px)`,
      pointerEvents: 'none',
      position: 'absolute',
      left: 0,
      boxSizing: 'border-box',
      'border-top-right-radius': cornerRadius,
      'border-top-left-radius': cornerRadius
    },
    contentlistlayout: {
      //width: '100%',
      height: `calc(${containerHeight}px)`,
      padding: 0,
      display: 'flex',      
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden auto',
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
    },
    contentlayout: {
      width: '100%',
      height: `calc(${itemHeight}px)`,
      display: 'flex',
      //flexDirection: 'column',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
    },
    headerDiv: {
      visibility: showHeader,
      width: `calc(100% - 20px)`,
      marginLeft: 10,
      height: headerHeight,
      backgroundColor: getColorValue(uiData.backgroundColor),       
      display: 'flex',
      alignItems: 'end',
      justifyContent: 'center'
    },
    indicatorDiv: {
      width: '10%',
      height: 2,
      backgroundColor: 'rgba(0,0,0,1)', 
      border: '1px solid',
      display: 'table'
    },
    footerDiv: {
      visibility: showClose,
      width: `calc(100% - 20px)`,
      marginLeft: 10,
      height: footerHeight,
      backgroundColor: getColorValue(uiData.backgroundColor), 
      borderTop: '1px solid',
    },
    
  }));
  const classes = useStyles();

  return (
    <Box id="drawerui" className={classes.uilayout} >
      <div id="headerDiv" className={classes.headerDiv} >
        <div id="indicatorDiv" className={classes.indicatorDiv} ></div>
      </div>
      <List component="nav" dense={true} className={classes.contentlistlayout} >
        {contentListData.map((listData, id) => (
          <GridList key={id} cellHeight={itemHeight} cols={itemColumns} className={classes.contentlayout} style={{margin:0}}>
            {listData.map((item, index) => (
              <GridListTile key={index} cols={1} rows={1}>            
                <UIContainer appconfig={appConfig} data={item} pagedata={props.pagedata} screenIndex={scrIndex} source="Drawer" />           
              </GridListTile>
            ))}
          </GridList>
        ))}
      </List>
      <div id="footerDiv" className={classes.footerDiv} >
        <div id="closeDiv">Close</div>
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

