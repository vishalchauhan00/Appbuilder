import React from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Box, Fab } from '@material-ui/core';
import SvgIcon from '@material-ui/core/SvgIcon';
import AddIcon from '@material-ui/icons/Add';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import infolightIcon from '../../../assets/uimockup/system-infolight.png';
import infodarkIcon from '../../../assets/uimockup/system-infodark.png';


export default function UISystemButton(props) {
  const uiData = props.data;
  
  //const containerWidth = uiData.frame.width;
  //const containerHeight = uiData.frame.height;

  const rotation = (uiData.frame['rotation']) ? parseInt(uiData.frame.rotation) : 0;

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    btnlayout: {     
      minWidth: 16,
      minHeight: 16,
      width:'100%',
      height:'100%',
      transform: `rotate(${rotation}deg)`    
    },
    fablayout: {
      width:'100%',
      height:'100%',
      backgroundColor: theme.palette.common.black,      
    },
    imgFit: {     
      maxWidth:'100%',
      maxHeight:'100%',
      display:'inline-block'
    },    
    
  }));

  const classes = useStyles();  

  let btnMockup;

  const buttonType = uiData.buttonType; 
  switch (buttonType) {
    case "add":
      btnMockup = [<SystemUI key="sysAdd" className={classes.fablayout} aria-label={buttonType}><AddIcon fontSize="large" /></SystemUI>];
      break;
    case "Detail":
      btnMockup = [<SystemUI key="sysDetail" className={classes.fablayout} aria-label={buttonType}><SvgIcon><path opacity=".87" fill="none" d="M24 24H0V0h24v24z"/><path d="M7.38 21.01c.49.49 1.28.49 1.77 0l8.31-8.31c.39-.39.39-1.02 0-1.41L9.15 2.98c-.49-.49-1.28-.49-1.77 0s-.49 1.28 0 1.77L14.62 12l-7.25 7.25c-.48.48-.48 1.28.01 1.76z"/></SvgIcon></SystemUI>];
      break;
    case "InfoLight":
      btnMockup = [<img key="sysInfolight" src={infolightIcon} alt="img" className={classes.imgFit} />];
      break;
    case "InfoDark":
      btnMockup = [<img key="sysInfodark" src={infodarkIcon} alt="img" className={classes.imgFit} />];
      break;
    default:
      btnMockup = [<SystemUI key="sysDefault" className={classes.fablayout} aria-label={buttonType}><AddCircleIcon fontSize="large" /></SystemUI>];
      break;
  }

  return (
    <Box id="system" className={classes.btnlayout}>
      {btnMockup}
    </Box>    
  );

}

const SystemUI = withStyles({
  root: {
    color: "rgb(255,255,255)"
  },
})(props => <Fab {...props} />);



