import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography, Paper } from '@material-ui/core';


export default function UIDatePicker(props) {
  const uiData = props.data;
  
  //const uiVisibility = (uiData.hidden) ? 'hidden' : 'visible';

  //const containerX = uiData.frame.x;
  //const containerY = uiData.frame.y;
  const containerWidth = uiData.frame.width;
  const containerHeight = uiData.frame.height;

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {     
      height: `calc(${containerHeight}px)`,
      width: containerWidth,
      display: 'none',  //'flex',
      flexDirection: 'column',  
      alignItems: 'center',
      backgroundColor: 'rgba(189, 189, 189, 0)',
      border: '10px solid rgba(0, 0, 0, 0.87)',
      borderRadius: 16,
    },
    uicolumn: {      
      minWidth: 240,
      minHeight: 140,
      height:'100%',
      width:'100%',
      display: 'table-cell',
      verticalAlign : 'middle',
      borderRight: '1px solid',
    },
    uilabel: {      
      minWidth: 10,
      minHeight: 10,
      height:'100%',
      width:'100%',      
      color: 0,
      fontSize: 12,  
      display: 'table-cell',
      verticalAlign : 'middle',
    },
    notsupportedlayout: {
      height: `calc(${containerHeight}px)`,
      width: containerWidth,
      display:'flex',
      alignItems:'center', justifyContent:'center',
      backgroundImage: 'url(http://localhost:3000/assets/transp.png)',
    },
  }));

  const classes = useStyles();

  let dataArray = uiData.dataarray;

  return (
    <div>
      <Paper className={classes.notsupportedlayout} elevation={2}>
        <Typography>Picker UI not supported</Typography>
      </Paper>
      <Box id="picker" className={classes.uilayout} >
        {dataArray.map((columndata, column) => (
          <Box key={column} className={classes.uicolumn} >
          {columndata.itemarray.map((itemdata, index) => (
              <Typography key={index} className={classes.uilabel} >{itemdata['text']}</Typography>          
          ))}
          </Box>        
        ))}      
      </Box>    
    </div>
  );

}


