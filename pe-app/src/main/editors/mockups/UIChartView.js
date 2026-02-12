import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import lineChart from '../../../assets/uimockup/charts/line.png';
import curveChart from '../../../assets/uimockup/charts/curve.png';
import barChart from '../../../assets/uimockup/charts/bar.png';
import columnChart from '../../../assets/uimockup/charts/column.png';
import areaChart from '../../../assets/uimockup/charts/area.png';
import stackedbarChart from '../../../assets/uimockup/charts/stacked_bar.png';
import stackedcolumnChart from '../../../assets/uimockup/charts/stacked_column.png';
import stackedareaChart from '../../../assets/uimockup/charts/stacked_area.png';
import bubbleChart from '../../../assets/uimockup/charts/bubble.png';
import scatterChart from '../../../assets/uimockup/charts/scatter.png';
import pieChart from '../../../assets/uimockup/charts/pie.png';
import pie3dChart from '../../../assets/uimockup/charts/pie3d.png';
import donutChart from '../../../assets/uimockup/charts/donut.png';
import candlestickChart from '../../../assets/uimockup/charts/candlestick.png';
import waterfallChart from '../../../assets/uimockup/charts/waterfall.png';
import comboChart from '../../../assets/uimockup/charts/combo.png';
import histogramChart from '../../../assets/uimockup/charts/histogram.png';
import IconButton from '@material-ui/core/IconButton';
import FullscreenIcon from '@material-ui/icons/Fullscreen';

export default function UIChartView(props) {
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

  if(!uiData.hasOwnProperty('isStacked')) {
    uiData['isStacked'] = false;
  }
  if(!uiData.hasOwnProperty('isWaterfall')) {
    uiData['isWaterfall'] = false;
  }
  if(!uiData.hasOwnProperty('seriesType')) {
    uiData['seriesType'] = "bars";
  }
  if(!uiData.hasOwnProperty('seriesField')) {
    uiData['seriesField'] = "";
  }
  if(!uiData.hasOwnProperty('styleField')) {
    uiData['styleField'] = "";
  }
  if(!uiData.hasOwnProperty('annotationField')) {
    uiData['annotationField'] = "";
  }
  if(!uiData.hasOwnProperty('toggleFullScreen')) {
    uiData['toggleFullScreen'] = false;
  }
  if(!uiData.actions){
    uiData['actions'] = {"onReady":[], "onError":[], "onSelect":[]};
  }

  let chartsrc = lineChart;
  switch (uiData.chartType) {
    case "Line":
      if(uiData.showCurve)  chartsrc = curveChart;
      else    chartsrc = lineChart;
      break;
    case "Bar":
      if(uiData.isStacked)  chartsrc = stackedbarChart;
      else    chartsrc = barChart;
      break;
    case "Column":
      if(uiData.isStacked)  chartsrc = stackedcolumnChart;
      else    chartsrc = columnChart;
      break;
    case "Area":
      if(uiData.isStacked)  chartsrc = stackedareaChart;
      else    chartsrc = areaChart;
      break;
    case "Bubble":
      chartsrc = bubbleChart;
      break;
    case "Scatter":
      chartsrc = scatterChart;
      break;
    case "Pie":
      if(uiData.is3D)  chartsrc = pie3dChart;
      else    chartsrc = pieChart;
      break;
    case "Donut":
      chartsrc = donutChart;
      break;
    case "CandleStick":
      if(uiData.isWaterfall)  chartsrc = waterfallChart;
      else    chartsrc = candlestickChart;
      break;
    case "Combo":
      chartsrc = comboChart;
      break;
    case "Histogram":
      chartsrc = histogramChart;
      break;
    default:
      chartsrc = lineChart;
  }
  
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

  if(!uiData.hasOwnProperty('barWidth')) {
    uiData['barWidth'] = 70;
  }
  if(!uiData.hasOwnProperty('pointSize')) {
    uiData['pointSize'] = 0;
  }

  if(!uiData.hasOwnProperty('dataFields')) {
    uiData['dataFields'] = [];
   //console.log(uiData['name'], "....Chart dataFields>>>>", uiData['valueField']);
    for (let index = 0; index < uiData['valueField'].length; index++) {
      const element = uiData['valueField'][index];
      const _fieldObj = { "id": index,
        "fieldname": element['fieldname'],
        "displaytext": element['fieldname'].replace("[","").replace("]",""),
        "seriescolor": {"alpha": 1, "red": 0.2, "green": 0.4, "blue": 0.6, "colorName": ""}
      };
      uiData['dataFields'].push(_fieldObj);    
    }
  }else{
    if(uiData.hasOwnProperty('dataFields')) {
      for (let index = 0; index < uiData['dataFields'].length; index++) {
        let fieldObj = uiData['dataFields'][index];
        if(!fieldObj.hasOwnProperty('pointShape'))  fieldObj['pointShape'] = 'circle';
        if(!fieldObj.hasOwnProperty('fillpoints'))  fieldObj['fillpoints'] = true;
      }
    }
  }

  if(!uiData.hasOwnProperty('legendTextStyle')) {
    uiData['legendTextStyle'] = {"fontName":"system", "fontSize":12, "fontWeight":false, "fontStyle":false, "textAlignment":"center", "textColor":{"alpha":1,"red":1,"green":1,"blue":1,"colorName":""}, "lineBreakMode":"WordWrap" };
  }

  if(!uiData.hasOwnProperty('gridlines')){
    uiData['gridlines'] = "Default";
  }

  if(!uiData.hasOwnProperty('vaxisBaseline')){
    uiData['haxisBaseline'] = true;
    uiData['vaxisBaseline'] = true;
  }

  if(!uiData.hasOwnProperty('dataToolTip')){
    uiData['dataToolTip'] = "";
  }

  if(!uiData.hasOwnProperty('chartarea')){
    uiData['chartarea'] = {"top": 0, "right": 0, "bottom": 0, "left": 0, "width": 100, "height": 100};
    uiData['haxisTextStyle'] = {"fontName":"system", "fontSize":12, "fontWeight":false, "fontStyle":false, "textAlignment":"center", "textColor":{"alpha":1,"red":1,"green":1,"blue":1,"colorName":""}, "lineBreakMode":"WordWrap" };
    uiData['vaxisTextStyle'] = {"fontName":"system", "fontSize":12, "fontWeight":false, "fontStyle":false, "textAlignment":"center", "textColor":{"alpha":1,"red":1,"green":1,"blue":1,"colorName":""}, "lineBreakMode":"WordWrap" };
  }                
  
  if(uiData['vendor']){
    uiData['provider'] = uiData['vendor'];
    delete uiData['vendor'];
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

