import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, GridList, List, SvgIcon, TextField, Typography } from '@material-ui/core';
import UIContainer from '../UIContainer';


export default function UIDataGrid(props) {
  const appConfig = props.appconfig;
  const scrIndex = props.currentScreenIndex;
  const uiData = props.data;

  if(!uiData.hasOwnProperty('rowfont')){
    uiData['rowfont'] = {"fontName": "system", "fontSize": 16, "fontWeight": false, "fontStyle": false, "textAlignment": "center", "textColor": {"red": 0, "blue": 0, "green": 0, "alpha": 1, "colorName": ""}, "lineBreakMode": "WordWrap" };
    uiData['alternatingRowStyle'] = false;
    uiData['alternatingRowColors'] = {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
    uiData['rowhoverColor'] = {"alpha": 1, "red": 1, "green": 1, "blue": 1, "colorName": ""};
  }

  if(!uiData.hasOwnProperty('gridlines')){
    uiData['gridlines'] = "Default";
  }
  const gridlines = (uiData['gridlines'] === "Default") ? 1 : 0;
  if(!uiData.hasOwnProperty('paginationColor')){
    uiData['paginationColor'] = {"red": 0.09411764705, "green": 0.09411764705, "blue": 0.58823529411, "alpha": 1, "colorName": ""};
  }

  if(!uiData.hasOwnProperty('checkboxSelection')){
    uiData['checkboxSelection'] = false;
    uiData['selectallValue'] = "Select All";
  }
  if(!uiData.hasOwnProperty('selectallFieldname')){
    uiData['selectallFieldname'] = "";
  }  

  for (let index = 0; index < uiData['dataCols'].length; index++) {
    const element = uiData['dataCols'][index];
    if(element){
      if(!element.hasOwnProperty('isSearchable')){
        element['isSearchable'] = false;
      }
      if(!element.hasOwnProperty('isCustomHeader')){
        element['isCustomHeader'] = false;
        element['headerFields'] = [];
      }
      if(!element.hasOwnProperty('isInclude')){
        element['isInclude'] = true;
      }
    }      
  }

  if(appConfig.apiURL.indexOf("htapps") > -1){
    uiData['headerfont']['fontName'] = "Noto Sans";
    uiData['rowfont']['fontName'] = "Noto Sans";
  }

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  
  const borderWeight = parseInt(uiData.borderWeight);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const boxShadowColor = getColorValue(uiData['boxShadowColor']);
  const boxShadowWidth = (uiData['boxShadow']) ? parseInt(uiData['boxShadowWidth']) : 0;
  //const boxShadow = (uiData['boxShadow']) ? '0px ' + boxShadowWidth + 'px ' + boxShadowColor : '0px 0px 0';
  const rbshadow = boxShadowWidth + ' ' + boxShadowWidth + ' ' + boxShadowWidth + ' 0 ' + boxShadowColor;
	const tlshadow = '0 ' + boxShadowWidth + ' ' + boxShadowWidth + ' ' + boxShadowWidth + ' ' + boxShadowColor;
  const boxShadow = (uiData['boxShadow']) ? (rbshadow + ' , ' +  tlshadow) : 0;

  const headerPosition = (uiData['stickyheader']) ? 'sticky' : 'inherit';
  const headerBGColor = getColorValue(uiData.headerBGColor);
  const headerTextColor = getColorValue(uiData.headerfont['textColor']);
  const headerTextAlign = uiData.headerfont['textAlignment'];
  const headerFontSize = parseInt(uiData.headerfont['fontSize']);
  //const headerBold = (uiData.headerfont['fontWeight']) ? 'bold' : 'normal';
  if(!uiData.headerfont.hasOwnProperty('fontWeightNum')){
    uiData.headerfont.fontWeightNum = (uiData.headerfont.fontWeight) ? 600 : 400;
  }
  const headerfontWeight = uiData.headerfont.fontWeightNum;

  let gridHeight = (uiData.showheader) ? uiData.headerheight : 0;
  const rowsHeight = uiData.rowcount * uiData.rowheight;
  gridHeight = gridHeight + rowsHeight;  

  const pagingHeight = 32;

  let gridWidth = 0;
  let dataCols = uiData.dataCols;
  for (let index = 0; index < dataCols.length; index++) {
    const element = dataCols[index];
    gridWidth = gridWidth + element['width'];
  }
  //console.log(gridWidth, gridHeight, ".... UIDataGrid ....", dataCols);

  let gridListData = [];
  if(dataCols.length > 0) {
    dataCols = dataCols.filter(function(cols) {
      if(cols['isInclude']) {
        return true;
      }
      return false;
    });

    let gridData = new Array(1).fill(dataCols);
    for (let i = 0; i < uiData.rowcount; i++) {
      gridListData.push(gridData);    
    }
  }

  //console.log(uiData.name, ".... UIDataGrid ....", gridListData);

  const rowTextColor = getColorValue(uiData.rowfont['textColor']);
  const rowTextAlign = uiData.rowfont['textAlignment'];
  const rowFontSize = parseInt(uiData.rowfont['fontSize']);
  if(!uiData.rowfont.hasOwnProperty('fontWeightNum')){
    uiData.rowfont.fontWeightNum = 400;
  }
  const rowfontWeight = uiData.rowfont.fontWeightNum;
  const rowAlternateColor = (uiData.alternatingRowStyle) ? getColorValue(uiData.alternatingRowColors) : getColorValue(uiData.backgroundColor);

  if(!uiData.hasOwnProperty('actions')){
    uiData['actions'] = {"onCellClick":[]};
  }
  if(!uiData.hasOwnProperty('freezeCols')){
    uiData['freezeCols'] = 0;
  }
  if(!uiData.hasOwnProperty('rowcountTargetUI')){
    uiData['rowcountTargetUI'] = "";
    uiData['rowcountUIText'] = "[ROWCOUNT]";
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
      width: gridWidth,
      height: gridHeight,      
      boxSizing: 'border-box',
      display: 'flex',      
      flexWrap: 'wrap',
      flexDirection: 'column',
     // justifyContent: 'space-around',      
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`
    },
    headerdiv: {
      display: 'flex', 
      height: uiData.headerheight,
      position: headerPosition,
      top: 0, 
      zIndex: 2,
    },
    contentlayout: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      overflow: 'hidden',
      border: '1px solid',
      boxSizing: 'border-box',
      borderLeftWidth: gridlines,
      borderRightWidth: gridlines
    },
    headercheck: {
      width: 28,//uiData.headerheight - 18,
      height: 28,//uiData.headerheight - 18,
      padding: (6 - gridlines),
      paddingTop: (uiData.headerheight - 30)/2,
      paddingBottom: (uiData.headerheight - 30)/2,
      border: '1px solid',
      borderLeftWidth: gridlines,
      borderRightWidth: gridlines,
      backgroundColor: headerBGColor
    },
    heading: {
      backgroundColor: headerBGColor,
      padding: '0px 2px', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: headerTextAlign,
      color: headerTextColor, 
      fontSize: headerFontSize, 
      fontWeight: headerfontWeight,
    },
    headersearch: {
      margin: '8px 0px',
      backgroundColor: 'white',
      borderRadius: 4
    },
    gridcell: {
      height: uiData.rowheight, 
      padding: '0px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: rowTextAlign,
      color: rowTextColor,
      fontSize: rowFontSize,
      fontWeight: rowfontWeight
    },
    rowcheck: {
      width: '28px  !important',
      height: '28px  !important',
      padding: `calc(${6 - gridlines}px)  !important`,
      paddingTop: `calc(${(uiData.rowheight - 30)/2}px)  !important`,
      paddingBottom: `calc(${(uiData.rowheight - 30)/2}px)  !important`,
      border: '1px solid',
      borderLeftWidth: gridlines,
      borderRightWidth: gridlines
    },
    pagingdiv: {
      height: pagingHeight,
      backgroundColor: getColorValue(uiData.backgroundColor), 
      margin: '0px 2px',
      textAlign: 'end'
    },
    uiicon: {
      minWidth: 24,
      minHeight: 24,
      width: 32,
      height: 32,
      padding: 8,
      border: '1px solid',
      borderLeft: gridlines,
      borderRight: gridlines
    },

  }));

  const classes = useStyles();

  return (
    <Box className={classes.viewlayout}>    
      <List component="nav" dense={true} className={classes.contentlistlayout} >          
        {(uiData.showheader) && 
          <div className={classes.headerdiv}>
            {(uiData['checkboxSelection']) &&
              <SvgIcon className={classes.headercheck}><path opacity=".67" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></SvgIcon>
            }
            {dataCols.map((coloumndata, id) => (
              <React.Fragment key={id}>
                {coloumndata.isInclude && 
                  <GridList cellHeight={uiData.headerheight} cols={1} className={classes.contentlayout} style={{margin:0, width:coloumndata.width, pointerEvents:'none', backgroundColor: headerBGColor}}>
                    {coloumndata.heading.length > 0 && 
                      <Typography variant='h6' className={classes.heading} style={{padding:'0px 4px', height:40}}>{coloumndata.heading}</Typography>
                    }
                    {coloumndata.isSearchable &&
                      <TextField variant="standard" className={classes.headersearch} style={{ width:'initial', height:32, padding:0, visibility: (coloumndata.isSearchable) ? 'visible' : 'hidden'}}></TextField>
                    }
                    {coloumndata.isCustomHeader &&
                      <UIContainer appconfig={appConfig} data={coloumndata['headerFields']} pagedata={props.pagedata} screenIndex={scrIndex} source="DataGrid" />
                    }
                  </GridList>              
                }
              </React.Fragment>
            ))}
          </div>
        }
        {gridListData.map((gridData, i) => (
          <GridList key={i} cellHeight={uiData.rowheight} cols={1} style={{margin:0, flexWrap:'nowrap'}}>
            {(uiData['checkboxSelection']) &&
              <SvgIcon className={classes.rowcheck} style={{backgroundColor: (i % 2 === 0) ? getColorValue(uiData.backgroundColor) : rowAlternateColor}}>
                <path opacity=".67" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
              </SvgIcon>
            }
            {gridData.map((data, j) => (
              <div key={j} style={{
                  display:'flex', padding:0, width:gridData.width, height:uiData.rowheight, pointerEvents:'none',
                  backgroundColor: (i % 2 === 0) ? getColorValue(uiData.backgroundColor) : rowAlternateColor
                }}>
                {data.map((item, k) => (
                  <div key={k} className={classes.contentlayout} style={{width:item.width}}>
                    {!(item.isCustom) &&
                      <Typography className={classes.gridcell} style={{ width:item.width}}>{item.fieldname}</Typography>
                    }
                    {(item.isCustom && (item['Fields'].length > 0 && item['Fields'][0]['uiParts'].length > 0)) && 
                      <UIContainer appconfig={appConfig} data={item['Fields']} pagedata={props.pagedata} screenIndex={scrIndex} source="DataGrid" />
                    }
                  </div>
                ))}   
              </div>
            ))}            
          </GridList>
        ))}
      </List>      
      {(uiData.showPagination) && 
        <div id="pagingdiv" className={classes.pagingdiv}>
          <img src="assets/uimockup/grid-paging.png" alt="grid-paging"></img>
        </div>
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

