import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Avatar, Box, Chip } from '@material-ui/core';
import FaceIcon from '@material-ui/icons/Face';
import DeleteIcon from '@material-ui/icons/HighlightOff';


export default function UIChip(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;
  
  const uiTitle = (uiData.title) ? uiData.title : "mobilous";

  const uiVariant = (uiData.variant === "outlined") ? uiData.variant : "default";

  let iconImage = '';
  if(uiData.showIcon){
    iconImage = getImagePath(uiData.iconImage, appConfig.apiURL, appConfig.projectid);
  }
  let deleteImage = '';
  if(uiData.showDelete){
    deleteImage = getImagePath(uiData.deleteImage, appConfig.apiURL, appConfig.projectid);
  }

  /*const fontFamily = (uiData.normalFont && uiData.normalFont.fontName !== 'system') ? uiData.normalFont.fontName : 'Arial';
  const fontSize = (uiData.normalFont) ? uiData.normalFont.fontSize : 0;
  const fontWeight = (uiData.normalFont.fontWeight) ? 'bold' : 'normal';
  const fontStyle = (uiData.normalFont.fontStyle) ? 'italic' : 'normal';
  const textColor = (uiData.normalFont) ? getColorValue(uiData.normalFont.textColor) : 0;
  const textAlign = (uiData.normalFont) ? uiData.normalFont.textAlignment : 'left';
  const textTransform = 'none';

  let wordWrap = 'normal';
  let whiteSpace = 'pre';
  if(uiData['normalFont']['lineBreakMode'] === 'WordWrap'){
    wordWrap = 'break-word';
    whiteSpace = 'pre-wrap';
  }          
  
  let textDecoration = 'none';
  if(uiData['underline'] && uiData['strikeout'])
    textDecoration = 'line-through underline';
	else if(uiData['underline'])
    textDecoration =  'underline';
	else if(uiData['strikeout'])
    textDecoration =  'line-through';

  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'middle';

  */

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,      
    },
    btnlayout: {    
      minWidth: 16,
      minHeight: 16,
      width: '100%',
      height:'100%',
      boxSizing:'border-box',      
      textTransform: 'none'
    }
    
  }));

  const classes = useStyles();

  const handleDelete = () => {
    console.info('You clicked the delete icon.');
  };

  return (
    <Box id="chipview" className={classes.btnlayout} >    
      {(!uiData.showIcon && !uiData.showDelete) && 
        <Chip 
              label={uiTitle}
              variant={uiVariant}
              size={uiData.size}
              color={uiData.color} />
      }
      {((uiData.showIcon && iconImage.length === 0) && (uiData.showDelete && deleteImage.length === 0)) && 
        <Chip 
              label={uiTitle}
              variant={uiVariant}
              size={uiData.size}
              color={uiData.color}
              icon={<FaceIcon />}
              deleteIcon={<DeleteIcon />} onDelete={handleDelete} />
      }
      {((uiData.showIcon && iconImage.length > 0) && (uiData.showDelete && deleteImage.length > 0)) && 
        <Chip 
              label={uiTitle}
              variant={uiVariant}
              size={uiData.size}
              color={uiData.color}
              avatar={<Avatar alt="custom-icon" src={iconImage} />}
              deleteIcon={<Avatar alt="custom-delete" src={deleteImage} />} onDelete={handleDelete} />
      }
      {((uiData.showIcon && iconImage.length === 0) && !uiData.showDelete) && 
        <Chip 
              label={uiTitle}
              variant={uiVariant}
              size={uiData.size}
              color={uiData.color}
              icon={<FaceIcon />} />
      }
      {((uiData.showIcon && iconImage.length > 0) && !uiData.showDelete) && 
        <Chip 
              label={uiTitle}
              variant={uiVariant}
              size={uiData.size}
              color={uiData.color}
              avatar={<Avatar alt="custom-icon" src={iconImage} />} />
      }
      {((uiData.showIcon && iconImage.length === 0) && (uiData.showDelete && deleteImage.length > 0)) && 
        <Chip 
              label={uiTitle}
              variant={uiVariant}
              size={uiData.size}
              color={uiData.color}
              icon={<FaceIcon />} 
              deleteIcon={<Avatar alt="custom-delete" src={deleteImage} />} onDelete={handleDelete}/>
      }
      {((uiData.showIcon && iconImage.length > 0) && (uiData.showDelete && deleteImage.length === 0)) && 
        <Chip 
              label={uiTitle}
              variant={uiVariant}
              size={uiData.size}
              color={uiData.color}
              avatar={<Avatar alt="custom-icon" src={iconImage} />} 
              deleteIcon={<DeleteIcon />} onDelete={handleDelete}/>
      }
      {(!uiData.showIcon && (uiData.showDelete && deleteImage.length === 0)) && 
        <Chip 
              label={uiTitle}
              variant={uiVariant}
              size={uiData.size}
              color={uiData.color}
              deleteIcon={<DeleteIcon />} onDelete={handleDelete} />
      }
      {(!uiData.showIcon && (uiData.showDelete && deleteImage.length > 0)) && 
        <Chip 
              label={uiTitle}
              variant={uiVariant}
              size={uiData.size}
              color={uiData.color}
              deleteIcon={<Avatar alt="custom-delete" src={deleteImage} />} onDelete={handleDelete} />
      }
      
    </Box>
  );

  function getImagePath(imageObj, _url, _pid) {

    if(imageObj['srcLocation'] === 'bundle'){
      if(imageObj['filename'] !== "" && imageObj['fileext'] !== "")
        return _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];// + '?ts=' + new Date().getTime();
      else{
        if(imageObj['filename'] !== "" && imageObj['fileext'] !== "")
          return _url + "download/image/" + _pid +"/" + imageObj['filename'];
      }
    }    
    else if(imageObj['srcLocation'] === 'url')
      return imageObj['url'];
    else if(imageObj['srcLocation'] === 'remoteFile')
      return imageObj['url'] + imageObj['filename'];
  
    return "";
  }

}


