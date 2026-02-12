import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import timepicker from '../../../assets/uimockup/timepicker.png';


export default function UIDatePicker(props) {
  const uiData = props.data;
  
  const border = 10;
  const containerWidth = parseInt(uiData.frame.width) - 2*border;
  const containerHeight = parseInt(uiData.frame.height) - 2*border;

  const monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let showDate = (uiData.mode === 'Date' || uiData.mode === 'DateAndTime') ? 'table-cell' : 'none';
  let showTime = (uiData.mode === 'Time' || uiData.mode === 'DateAndTime') ? 'table-cell' : 'none';
  let showAMPM = (showTime !== 'none' && uiData.timeFormat === '12 Hour') ? 'table-cell' : 'none';

  var currentDate = new Date();
  const year = currentDate.getFullYear();
  let date = currentDate.getDate();
  if(date < 10) date = "0" + date;
  let month = currentDate.getMonth();
  month = monthArray[month];
  let hour = currentDate.getHours();
  if(hour < 10) hour = "0" + hour;
  let minute = currentDate.getMinutes();
  if(minute < 10) minute = "0" + minute;

  const ampm = (hour >= 12 && minute > 0) ? "PM" : "AM" ;

  //console.log(uiData.mode, showDate, showTime, showAMPM, "********", date, month, year, hour, minute, ampm);

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {     
      height: `calc(${containerHeight}px)`,
      width: containerWidth,
      display: 'table',
      flexDirection: 'row',  
      alignItems: 'center',
      backgroundColor: 'rgba(189, 189, 189, 0)',
      border: 'solid rgba(0, 0, 0, 0.87)',
      borderWidth: border,
      borderRadius: 16,  
    },
    uilabel: {      
      minWidth: 40,
      minHeight: 140,
      height:'100%',
      //width:'100%',      
      //display: 'table-cell',
      verticalAlign : 'middle',
      color: theme.palette.common.black,
      backgroundColor: theme.palette.common.white,
      fontSize: 16,  
      borderRight: '1px solid',
    },
    uimonth: {      
      minWidth: 60,
      minHeight: 140,
      height:'100%',
      verticalAlign : 'middle',
      color: theme.palette.common.black,
      backgroundColor: theme.palette.common.white,
      fontSize: 16,  
      borderRight: '1px solid',
    },
    divlayout: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center'
    },
    fulllayout: {
      width:'100%',
      height:'100%',
      display:'inline-block'
    },

  }));

  const classes = useStyles();  

  return (
    <div key={uiData.name} className={classes.divlayout}>
      <Box id="datepicker" className={classes.uilayout} style={{display:'none'}} >
        <Typography id="year" className={classes.uilabel} style={{display:showDate}}>{year}</Typography>
        <Typography id="month" className={classes.uimonth} style={{display:showDate}}>{month}</Typography>
        <Typography id="date" className={classes.uilabel} style={{display:showDate}}>{date}</Typography>
        <Typography id="hour" className={classes.uilabel} style={{display:showTime}}>{hour}</Typography>
        <Typography id="minute" className={classes.uilabel} style={{display:showTime}}>{minute}</Typography>
        <Typography id="ampm" className={classes.uilabel} style={{display:showAMPM}}>{ampm}</Typography>
      </Box> 
      <img src={timepicker} alt="timepicker" className={classes.fulllayout} />
    </div> 
  );

}


