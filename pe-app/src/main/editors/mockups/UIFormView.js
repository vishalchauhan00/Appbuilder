import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, List, GridList, GridListTile, Typography } from '@material-ui/core';

import UIContainer from '../UIContainer';

export default function UIFormView(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  //const pageData = props.pagedata;

  const uiData = props.data;
  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible'; 
  let uiWidth = parseInt(uiData.frame.width);
  let uiHeight = parseInt(uiData.frame.height);

  const borderWeight = parseInt(uiData.borderWeight);
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;

  const heading = uiData.heading;
  const fontSize = (uiData.headerfont) ? uiData.headerfont.fontSize : 14;
  const fontWeight = (uiData.headerfont) ? uiData.headerfont.fontWeight : 14;
  const textColor = (uiData.headerfont) ? getColorValue(uiData.headerfont.textColor) : 'rgb(0,0,0)';
  const headerHeight = (heading.length > 0) ? 30 : 0;
  
  const containerWidth = uiWidth - (paddingLeft+paddingRight + 2*borderWeight);
  let containerHeight = uiHeight - (paddingTop+paddingBottom + 2*borderWeight);
  containerHeight = containerHeight - headerHeight;    

  const formItemBackground = getColorValue(uiData.itembackgroundColor);
  const formborderWeight = parseInt(uiData.itemborderWeight);
  const formborderColor = getColorValue(uiData.itemborderColor);
  const formborderRadius = (uiData.itemcornerRadius) ? parseInt(uiData.itemcornerRadius) : 0;
  const formLabelSize = (uiData.itemfont) ? uiData.itemfont.fontSize : 14;
  const formLabelColor = (uiData.itemfont) ? getColorValue(uiData.itemfont.textColor) : 'rgb(0,0,0)'; 
  const formLabelWeight = uiData.itemfont.fontWeight;
  const formLabelStyle = (uiData.itemfont.fontStyle) ? 'italic' : 'normal';
  const textAlign = (uiData.itemfont) ? uiData.itemfont.textAlignment : 'center';
  
 let formItemsData = uiData.formItems;
 for (let index = 0; index < formItemsData.length; index++) {
   const element = formItemsData[index];
   element['id'] = index;    
  }
  
  const formItem = uiData.formItems[0];
  const itemAlign = (formItem.itemAlignment) ? formItem.itemAlignment : 'middle';
  //const formItemMinHeight = formItem.height;
  const formItemGap = formItem.gap;
  
  const itemColumns = uiData.columns.length;

  let gridcolumns = '1fr';
  if(containerWidth > 480){
    gridcolumns = '';
    for (let index = 0; index < uiData.columns.length; index++) {
      const colObj = uiData.columns[index];
      const colFraction = Number(colObj['width']);
      gridcolumns = gridcolumns + colFraction +'fr ';
    }
  }

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      width: uiWidth,
      height: uiHeight,
      backgroundColor: getColorValue(uiData.backgroundColor), 
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`, 
      //pointerEvents: 'none',
      position: 'absolute',
      left: 0,
    },
    headerDiv: {
      width: '100%',
      height: headerHeight,
      backgroundColor: getColorValue(uiData.backgroundColor),
      display: 'table'
    },
    headerText: {
      textAlign: 'start',
      paddingLeft: 10,
      paddingRight: 70,
      color: textColor,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      height: '100%',
      lineHeight: 1,
      display: 'table-cell',
      verticalAlign: 'middle'
    },
    formitemslayout: {
      width: containerWidth,
      height: containerHeight,
      //padding: 0,
      //display: 'flex',      
      //flexWrap: 'wrap',
      alignContent: 'flex-start',
      overflow: 'hidden auto',
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      display: 'grid',
      gap: formItemGap,
      'grid-template-columns': gridcolumns 
    },
    itemslayout: {
      width: '100%',
      //minHeight: `calc(${formItemMinHeight}px)`,
      backgroundColor: formItemBackground,
      boxSizing: 'border-box',      
      borderWidth : `calc(${formborderWeight}px)`,
      borderStyle: 'solid',
      borderColor: formborderColor,
      borderRadius: `calc(${formborderRadius}px)`,      
      display: 'table',
      textAlign : textAlign,
      overflow: 'hidden',
      pointerEvents: 'none',
    },
    itemLabel: {
      lineHeight: 1,
      marginLeft: 10,
      color: formLabelColor,
      fontSize: `calc(${formLabelSize}px)`,
      fontWeight: formLabelWeight,
      fontStyle: formLabelStyle,      
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      display: 'flex',
      alignItems: 'center',
      textAlign: 'start',
      verticalAlign: itemAlign,
    },
    itemRequired: {
      width: 20,
      height: 32,
      lineHeight: 1.33,
      marginLeft: 5,
      color: 'red',
      fontSize: 32,
    },
    
  }));
  const classes = useStyles();

  return (
    <Box id="formui" className={classes.uilayout} >
      <div id="headerDiv" className={classes.headerDiv} >
        <Typography className={classes.headerText}>{heading}</Typography>
      </div>
      <List component="nav" dense={true} className={classes.formitemslayout} >
        {formItemsData.map((items, id) => (
          <GridList key={id} cellHeight={items.height} rows={1} cols={itemColumns} className={classes.itemslayout} style={{height:items.height, margin:0}}>
            <div className='horizontal-align' style={{height:28, display:(items.required || items.label.length > 0) ? 'flex' : 'none'}}>
              <Typography className={classes.itemLabel} style={{height:(items.label.length > 0) ? 32 : 0}}>{items.label}</Typography>
              <Typography className={classes.itemRequired} style={{display:(items.required) ? 'flex' : 'none'}}>*</Typography>
            </div>
            {items['Fields'].map((item, index) => (
              <GridListTile key={index} cols={1} rows={1} style={{height:(items.label.length > 0) ? `calc(100% - 32px)` : '100%', width:'100%', padding:0}}>
                <UIContainer appconfig={appConfig} data={items['Fields']} pagedata={props.pagedata} screenIndex={scrIndex} />           
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

