import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import gaugeChart from '../../../assets/uimockup/charts/gauge.png';
import IconButton from '@material-ui/core/IconButton';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

export default function UIGaugeChart(props) {
  const uiData = props.data;

  const titletext = (uiData.chartTitle) ? uiData.chartTitle : '';
  const displaytitle = (titletext.length > 0) ? 'flex' : 'none';
  const subtitletext = (uiData.subTitle) ? uiData.subTitle : '';
  const displaySubtitle = (subtitletext.length > 0) ? 'flex' : 'none';

  const containerX = uiData.frame.x;
  const containerY = uiData.frame.y;
  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;  
  
  let chartW = containerWidth - (paddingLeft + paddingRight);
  let chartH = containerHeight - (paddingTop + paddingBottom);
  if(titletext.length > 0)  chartH = chartH - 18;
  if(titletext.length > 0)  chartH = chartH - 16;

  let chartsrc = gaugeChart;
  
  let legendW;// = containerWidth - (paddingLeft + paddingRight);
  let legendH;// = containerHeight - (paddingTop + paddingBottom);
  let displayLegends = "none";
  let areaDirection = "row";
  let legendDirection = "row";
  let legendGap = 0;
  if(uiData.showLegends){
    displayLegends = "block";
    const legendPosition = (uiData.showLegends) ? uiData.legendPosition : "";
    if(legendPosition === "top" || legendPosition === "bottom"){
      legendH = 40;
      chartH = chartH - 40;
      areaDirection = (legendPosition === "bottom") ? "column" : "column-reverse";
      legendGap = 32;
    }else{
      legendW = 80;
      chartW = chartW - 80;
      areaDirection = (legendPosition === "right") ? "row" : "row-reverse";
      legendDirection = "column";
    }
  }
  
  const dummyLegends = [1, 2, 3];

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    baselayout: {     
      left: `calc(${containerX}px)`,
      top: `calc(${containerY}px)`,
      width: `calc(${containerWidth}px)`,
      height: `calc(${containerHeight}px)`,
      backgroundColor: getColorValue(uiData.backgroundColor),
      borderWidth : `calc(${uiData.borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: getColorValue(uiData.borderColor), 
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      boxSizing: 'border-box'
    },
    uiheading: {
      display: displaytitle,
      justifyContent: 'start',
      width: '100%',
      height: 18,
      color: 'rgba(117, 117, 117, 1)',
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'none'
    },
    uisubheading: {
      display: displaySubtitle,
      justifyContent: 'start',
      width: '100%',
      height: 16,
      color: 'rgba(189, 189, 189, 1)',
      fontSize: 14,
      textTransform: 'none'
    },
    chartarea: {
      boxSizing: 'border-box',
      margin: 5,
      display: 'flex',
      flexDirection: areaDirection
    },
    chartdiv: {
      width: chartW,
      height: chartH,
      padding: 5,
      boxSizing: 'border-box'
    },
    chartfill: {
      width:'100%',
      height:'100%',
      display:'inline-block'
    },
    legenddiv: {
      display : displayLegends,
      width: legendW,
      height: legendH,
      //background : 'red'
    },
    legendlist: {
      'padding-inline-start':24,
      'list-style-type':'square',      
      display: 'flex',
      flexDirection: legendDirection
    },
    toggleFullScreen: {
      position: 'absolute',
      top: 4, right: 4,
      padding: 0, margin: 0,
      //visibility: (uiData['toggleFullScreen']) ? 'visible' : 'hidden'
    }
  }));

  const classes = useStyles();

  return (
    <Box id="chartview" className={classes.baselayout} >
      {uiData['toggleFullScreen'] && 
        <IconButton edge="end" color="inherit" className={classes.toggleFullScreen} >
          <FullscreenIcon />
        </IconButton>
      }
      <Typography className={classes.uiheading}>{titletext}</Typography>
      <Typography className={classes.uisubheading}>{subtitletext}</Typography>
      <div id="chartarea" className={classes.chartarea}>
        <div id="chartdiv" className={classes.chartdiv}>
          <img src={chartsrc} alt={uiData.chartType} className={classes.chartfill} />
        </div>
        <div id="legenddiv" className={classes.legenddiv}>
          <ul id="legendlist" className={classes.legendlist}>
            {dummyLegends.map((legend, index) => (
              <li key={index} style={{'fontSize':12,'marginRight':legendGap}}>Legend {legend}</li>
            ))}
          </ul>
        </div>
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

