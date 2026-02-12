import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, GridListTile } from '@material-ui/core';


export default function UIComboBox(props) {
  //const appConfig = props.appconfig;
  const uiData = props.data;  
   
  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  
  const borderWeight = uiData.borderWeight;
  const borderBottomWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  //"type": "Contained", "layout": "Center-Aligned", "paging": true,

  const containerWidth = parseInt(uiData.frame.width) - (paddingLeft+paddingRight) + 1;
  const showPaging = (uiData.paging) ? 'visible' : 'hidden';
  let pagingHeight = (uiData.paging) ? 18 : 0;
  if(uiData.direction === 'Vertical'){
    pagingHeight = 0;
  }
  const containerHeight = parseInt(uiData.frame.height) - (paddingTop+paddingBottom) - pagingHeight;
  
  const itemGap = uiData.itemGap ? parseInt(uiData.itemGap) : 10;
  let itemColumns = uiData.displayedItemCount ? parseInt(uiData.displayedItemCount) : 3;
  if(uiData.layout === 'Full-Screen') {
    itemColumns = 1;
  }
  const totalWidth = (containerWidth - ((itemColumns-1)*itemGap));

  const uilayout = (uiData.layout === 'Full-Screen' || itemColumns === 1) ? 'FullScreen' : uiData.layout;

  
  let largeItemWidth = 0;
  if(uilayout === 'FullScreen') {
    largeItemWidth = Math.floor(totalWidth);
  }else{
    largeItemWidth = Math.floor(totalWidth * 0.5);
  }
  
  let mediumItemWidth = 0;
  if(uilayout === 'Start-Aligned') {
    mediumItemWidth = Math.floor(totalWidth * 0.3);
  }
  
  let smallItemWidth = 0;
  let trailCount = 0;
  let leadCount = 0;
  let smallitemarray = [];
  if(itemColumns > 1){
    if(uilayout === 'Start-Aligned') {
      smallItemWidth = Math.floor(totalWidth * 0.2)/(itemColumns -1);
      leadCount = itemColumns - 2;
    }else if(uilayout === 'Center-Aligned') {
      smallItemWidth = Math.floor(totalWidth * 0.5)/(itemColumns -1);
      trailCount = leadCount = (itemColumns - 1)/2;
    }
    smallitemarray = Array.from({ length: leadCount }, (_, i) => i + 1);
  }

  const itemBorderRadius = (uiData.itemStyle && uiData.itemStyle.cornerRadius) ? parseInt(uiData.itemStyle.cornerRadius) : 0;
  const itemBorderWeight = (uiData.itemStyle && uiData.itemStyle.outlineWidth) ? parseInt(uiData.itemStyle.outlineWidth) : 0;
  const itemBorderColor = (uiData.itemStyle && uiData.itemStyle.outlineColor) ? getColorValue(uiData.itemStyle.outlineColor) : 'rgba(0,0,0,1)';
  const itemBorder = `${itemBorderWeight}px solid ${itemBorderColor}`;

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: { 
      pointerEvents: 'none',   
      width: '100%',
      height:'100%',
      backgroundColor: getColorValue(uiData.backgroundColor),
      borderLeftWidth : `calc(${borderWeight}px)`,
      borderTopWidth : `calc(${borderWeight}px)`,
      borderRightWidth : `calc(${borderWeight}px)`,
      borderBottomWidth : `calc(${borderBottomWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: borderRadius,
      display: 'flex',
      flexDirection: 'column',
      padding: 0, 
      overflow: 'hidden',  
    },
    uicontainer: {      
      minWidth: 5,
      minHeight: 5,
      width: containerWidth, 
      height: containerHeight,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      display: 'table-cell',
      textTransform: 'none',
    }, 
    contentdiv: {
      height:'100%', 
      width:'100%', 
      display:'flex', 
      alignItems:'center', 
      justifyContent:'center', 
      gap:itemGap,
      boxSizing: 'border-box',
    },
    itemdiv: {
      height: '100%',
      borderRadius:itemBorderRadius, 
      border:itemBorder,
      boxSizing: 'border-box',
    },
    pagingDiv: {
      visibility: showPaging,
      width: '100%',
      height: pagingHeight,
      backgroundColor: 'transparent',
      border: '0px solid',
    },
  }));

  const classes = useStyles();

  return (
    <Box id="carousel" className={classes.uilayout} >
      <div className={classes.uicontainer} >
        {uiData['layout'] === "Full-Screen" && 
          <div className={classes.itemdiv} style={{width:largeItemWidth}} />
        }
        {uiData['layout'] === "Start-Aligned" && 
          <div className={classes.contentdiv} >
            <div className={classes.itemdiv} style={{width:largeItemWidth}} />
            {mediumItemWidth > 0 && 
              <div className={classes.itemdiv} style={{width:mediumItemWidth}} />
            }
            {smallItemWidth > 0 && 
              <>
                {smallitemarray.map((item, index) => (         
                  <GridListTile key={index} cols={leadCount} rows={1} style={{height:'100%', padding:0}} component="div">             
                    <div className={classes.itemdiv} style={{width:smallItemWidth}} />
                  </GridListTile>
                ))}
              </>
            }
          </div>
        }
        {uiData['layout'] === "Center-Aligned" && 
          <div className={classes.contentdiv} >
            {smallItemWidth > 0 && 
              <>
                {smallitemarray.map((item, index) => (         
                  <GridListTile key={index} cols={trailCount} rows={1} style={{height:'100%', padding:0}} component="div">             
                    <div className={classes.itemdiv} style={{width:smallItemWidth}} />
                  </GridListTile>
                ))}
              </>
            }
            <div className={classes.itemdiv} style={{width:largeItemWidth}} />
            {smallItemWidth > 0 && 
              <>
                {smallitemarray.map((item, index) => (         
                  <GridListTile key={index} cols={leadCount} rows={1} style={{height:'100%', padding:0}} component="div">             
                    <div className={classes.itemdiv} style={{width:smallItemWidth}} />
                  </GridListTile>
                ))}
              </>
            }
          </div>
        }
      </div>
      <div id="pagingDiv" className={classes.pagingDiv} >
        <svg height="18" width={containerWidth}>
          <circle cx={containerWidth/2} cy="9" r="8" stroke="black" strokeWidth="1" fill="grey" />
          Sorry, your browser does not support inline SVG.  
        </svg> 
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






