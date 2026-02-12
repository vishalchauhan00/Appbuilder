import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, GridList, GridListTile, List } from '@material-ui/core';
import UIContainer from '../UIContainer';


export default function UIScrollableView(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  
  const borderWeight = parseInt(uiData.borderWeight);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const boxShadowWidth = parseInt(uiData['boxShadowWidth']);
  const boxShadowColor = getColorValue(uiData['boxShadowColor']);
  const boxShadow = (uiData['boxShadow']) ? '0px ' + boxShadowWidth + 'px ' + boxShadowColor : '0px 0px 0';

  //const containerWidth = parseInt(uiData.frame.width) - 2*(borderWeight);
  let containerHeight = parseInt(uiData.frame.height) - 2*(borderWeight);
  if(uiData['boxShadow']){
    containerHeight = containerHeight - boxShadowWidth;
  }

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
    console.log(itemArray, contentData, ".... UIScrollView ....", contentListData);
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1
    },
    viewlayout: {
      width: '100%',
      height: `calc(100% - ${boxShadowWidth}px)`,
      display: 'inline-flex',
      flexDirection: 'column',
      backgroundColor: getColorValue(uiData.backgroundColor),      
      boxSizing: 'border-box',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: getColorValue(uiData.borderColor), 
      borderRadius: borderRadius,
      boxShadow: boxShadow,
      background: uiData.backgroundGradient,
      overflow: 'auto',
    },
    contentlistlayout: {
      width: uiData.scrollwidth,
      height: uiData.scrollheight,      
      boxSizing: 'border-box',
      display: 'flex',      
      flexWrap: 'wrap',
      justifyContent: 'space-around',      
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

  }));

  const classes = useStyles();

  return (
    <Box className={classes.viewlayout}>    
      <List component="nav" dense={true} className={classes.contentlistlayout} >
        {contentListData.map((listData, id) => (
          <GridList key={id} cellHeight={itemHeight} cols={itemColumns} className={classes.contentlayout} style={{margin:0}}>
            {listData.map((item, index) => (
              <GridListTile key={index} cols={1} rows={1}>            
                <UIContainer appconfig={appConfig} data={item} pagedata={props.pagedata} screenIndex={scrIndex} source="ScrollableView" />           
              </GridListTile>
            ))}
          </GridList>
        ))}
      </List>      
    </Box>  
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

