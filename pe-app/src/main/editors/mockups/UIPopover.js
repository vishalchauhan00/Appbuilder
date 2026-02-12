import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, ButtonGroup, GridList, GridListTile, List, Typography } from '@material-ui/core';
import UIContainer from '../UIContainer';


export default function UIPopover(props) {
  const uiData = props.data;
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  
  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const itemHeight = uiData.menuItems[0]['height'];

  const fontFamily = (uiData.font && uiData.font.fontName !== 'system') ? uiData.font.fontName : 'Arial';
  const fontSize = (uiData.font) ? uiData.font.fontSize : 0;
  //const fontWeight = (uiData.font.fontWeight) ? 'bold' : 'normal';
  if(!uiData.font.hasOwnProperty('fontWeightNum')){
    uiData.font.fontWeightNum = (uiData.font.fontWeight) ? 600 : 400;
  }
  const fontWeight = uiData.font.fontWeightNum;
  const fontStyle = (uiData.font.fontStyle) ? 'italic' : 'normal';
  const textColor = (uiData.font) ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = (uiData.font) ? uiData.font.textAlignment : 'left';
  const textTransform = 'none';    
  
  let textDecoration = 'none';
  if(uiData['underline'] && uiData['strikeout'])
    textDecoration = 'line-through underline';
	else if(uiData['underline'])
    textDecoration =  'underline';
	else if(uiData['strikeout'])
    textDecoration =  'line-through';

  const divider = (uiData.showDivider) ? '1px solid black' : '0px';

  if(!uiData.hasOwnProperty('type')){
    uiData['type'] = "Menu";
    uiData['dataarray'] =  [{"columns": 1, "rows":1, "gap":1, "height":300, "CellStyle": "custom", "Fields":[]}];
  }
  const uiType = uiData['type'];

  const dataArray = uiData.dataarray[0];
  dataArray.height = parseInt(uiData.frame.height);
  const itemColumns = parseInt(dataArray.columns);
  const itemRows = parseInt(dataArray.rows);
  const containerHeight = dataArray.height;

  let contentListData = [];
  const itemArray = dataArray.Fields;
  if(itemArray.length > 0) {
    let contentData = new Array(itemColumns).fill(itemArray);
    for (let i = 0; i < itemRows; i++) {
      contentListData.push(contentData);    
    }
    //console.log(itemArray, contentData, ".... UIDialog ....", contentListData);
  }

  if(!uiData.hasOwnProperty('showPointer')){
    uiData['showPointer'] = true;
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1
    },
    uilayout: {
      display: 'inline-flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',      
      boxSizing: 'border-box',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor, 
      borderRadius: borderRadius
    },
    viewlayout: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto hidden',
      backgroundColor: getColorValue(uiData.backgroundColor),   
      //width: '100%',
      height: '100%',
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
    },
    itemlayout: {
      width: '100%',
      height: itemHeight,
      backgroundColor: getColorValue(uiData.backgroundColor),      
      boxSizing: 'border-box',
      pointerEvents: 'none',
      textAlign : textAlign,
      borderBottom: divider
    },
    itemText: {
      width:'100%',
      color: textColor,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      fontStyle: fontStyle,      
      textDecoration: textDecoration,
      textTransform: textTransform,      
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap'    
    },
    contentlistlayout: {
      height: `calc(${containerHeight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor),
      padding: 0,
      display: 'flex',      
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      boxSizing: 'border-box',
      pointerEvents: 'none'
    },
    contentlayout: {
      width: '100%',
      height: `calc(${containerHeight}px)`,
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
    },
  }));

  const classes = useStyles();

  return (
    <Box className={classes.uilayout}>
      {uiType === "Menu" && 
        <ButtonGroup id="header" variant="contained" color="primary" className={classes.viewlayout}>
          {uiData['menuItems'].map((item, index) => (
            <Button key={index} className={classes.itemlayout} style={{'borderRight':0, 'boxShadow':'0 1px 1px 0 rgba(0,0,0,0.2)'}}>
              <Typography className={classes.itemText}>{item.text}</Typography>
            </Button>
          ))}
        </ButtonGroup>
      }
      {uiType === "Custom" && 
        <List component="nav" dense={true} className={classes.contentlistlayout} >
          {contentListData.map((listData, id) => (
            <GridList key={id} cellHeight={containerHeight} cols={itemColumns} className={classes.contentlayout} style={{margin:0}}>
              {listData.map((item, index) => (
                <GridListTile key={index} cols={1} rows={1}>            
                  <UIContainer appconfig={appConfig} data={item} pagedata={props.pagedata} screenIndex={scrIndex} source="PopOver" />           
                </GridListTile>
              ))}
            </GridList>
          ))}
        </List>
      }    
    </Box>  
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

