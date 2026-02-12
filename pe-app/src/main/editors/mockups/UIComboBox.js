import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Typography, SvgIcon, Chip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/HighlightOff';


export default function UIComboBox(props) {
  const appConfig = props.appconfig;
  const uiData = props.data;  
  uiData['SelectedIndex'] = 0;

  if(!uiData.hasOwnProperty('placeholder')) {
    uiData['placeholder'] = "";
  }
  if(!uiData.hasOwnProperty('setInputlabel')) {
    uiData['setInputlabel'] = (uiData.placeholder.length > 0) ? true : false;
  }  
  if(!uiData.hasOwnProperty('onfocusBackgroundColor')) {
    uiData['onfocusBackgroundColor'] = uiData.backgroundColor;
  }
  if(!uiData.hasOwnProperty('onfocusBorderColor')) {
    uiData['onfocusBorderColor'] = uiData.borderColor;
  }
  if(!uiData.hasOwnProperty('selectedOptionBGColor')) {
    uiData['selectedOptionBGColor'] = {"alpha": 1, "red": 0.23921568628, "green": 0.49411764706, "blue": 0.84705882353, "colorName": ""};
  }

  if(!uiData.hasOwnProperty('showElevation')) {
    uiData['showElevation'] = false;
  }
  const _variant = (uiData['showElevation']) ? 'contained' : 'outlined';
  
  if(!uiData.hasOwnProperty('customIcon')) {
    uiData['customIcon'] = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
  }
  const isCustomIcon = (uiData['customIcon'] && uiData['customIcon']['filename'] !== "") ? true : false;

  const containerWidth = parseInt(uiData.frame.width);
  const containerHeight = parseInt(uiData.frame.height);
  
  let borderWeight = uiData.borderWeight;
  const borderBottomWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  let borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;
  
  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  
  const textHeight = containerHeight - (paddingTop + paddingBottom) - (2*borderWeight);
  let textWidth = containerWidth - (paddingLeft + paddingRight) - (2*borderWeight) - 40;
  if(textWidth < 5) textWidth = 5;

  const fontFamily = (uiData.font && uiData.font.fontName !== 'system') ? uiData.font.fontName : 'Arial';
  const fontSize = (uiData.font) ? uiData.font.fontSize : 0;
  if(!uiData.font.hasOwnProperty('fontWeightNum')){
    uiData.font['fontWeightNum'] = 400;
  }
  const fontWeight = (uiData.font.fontWeightNum) ? uiData.font.fontWeightNum : 400;
  let textColor = (uiData.font) ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = (uiData.font) ? uiData.font.textAlignment : 'left';
  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'middle';

  /*if(uiData['name'] === "txt_starttime" || uiData['name'] === "txt_endtime"){

    uiData.type = 'Fixed';

    var timeStr1 = '{"id":1,"times":"09:00"},{"id":2,"times":"09:15"},{"id":3,"times":"09:30"},{"id":4,"times":"09:45"},{"id":5,"times":"10:00"},{"id":6,"times":"10:15"},{"id":7,"times":"10:30"},{"id":8,"times":"10:45"}';
    var timeStr2 = '{"id":9,"times":"11:00"},{"id":10,"times":"11:15"},{"id":11,"times":"11:30"},{"id":12,"times":"11:45"},{"id":13,"times":"12:00"},{"id":14,"times":"12:15"},{"id":15,"times":"12:30"},{"id":16,"times":"12:45"}';
    var timeStr3 = '{"id":17,"times":"13:00"},{"id":18,"times":"13:15"},{"id":19,"times":"13:30"},{"id":20,"times":"13:45"},{"id":21,"times":"14:00"},{"id":22,"times":"14:15"},{"id":23,"times":"14:30"},{"id":24,"times":"14:45"}';
    var timeStr4 = '{"id":25,"times":"15:00"},{"id":26,"times":"15:15"},{"id":27,"times":"15:30"},{"id":28,"times":"15:45"},{"id":29,"times":"16:00"},{"id":30,"times":"16:15"},{"id":31,"times":"16:30"},{"id":32,"times":"16:45"}';
    var timeStr5 = '{"id":33,"times":"17:00"},{"id":34,"times":"17:15"},{"id":35,"times":"17:30"},{"id":36,"times":"17:45"},{"id":37,"times":"18:00"},{"id":38,"times":"18:15"},{"id":39,"times":"18:30"},{"id":40,"times":"18:45"}';
    var timeStr6 = '{"id":41,"times":"19:00"},{"id":42,"times":"19:15"},{"id":43,"times":"19:30"},{"id":44,"times":"19:45"},{"id":45,"times":"20:00"},{"id":46,"times":"20:15"},{"id":47,"times":"20:30"},{"id":48,"times":"20:45"}';
    var timeStr7 = '{"id":49,"times":"21:00"},{"id":50,"times":"21:15"},{"id":51,"times":"21:30"},{"id":52,"times":"21:45"},{"id":53,"times":"22:00"},{"id":54,"times":"22:15"},{"id":55,"times":"22:30"},{"id":56,"times":"22:45"}';
    var timeStr8 = '{"id":57,"times":"23:00"},{"id":58,"times":"23:15"},{"id":59,"times":"23:30"},{"id":60,"times":"23:45"},{"id":61,"times":"00:00"},{"id":62,"times":"00:15"},{"id":63,"times":"00:30"},{"id":64,"times":"00:45"}';
    var timeStr9 = '{"id":65,"times":"01:00"},{"id":66,"times":"01:15"},{"id":67,"times":"01:30"},{"id":68,"times":"01:45"},{"id":69,"times":"02:00"},{"id":70,"times":"02:15"},{"id":71,"times":"02:30"},{"id":72,"times":"02:45"}';
    var timeStr10 = '{"id":73,"times":"03:00"},{"id":74,"times":"03:15"},{"id":75,"times":"03:30"},{"id":76,"times":"03:45"},{"id":77,"times":"04:00"},{"id":78,"times":"04:15"},{"id":79,"times":"04:30"},{"id":80,"times":"04:45"}';
    var timeStr11 = '{"id":81,"times":"05:00"},{"id":82,"times":"05:15"},{"id":83,"times":"05:30"},{"id":84,"times":"05:45"},{"id":85,"times":"06:00"},{"id":86,"times":"06:15"},{"id":87,"times":"06:30"},{"id":88,"times":"06:45"}';
    var timeStr12 = '{"id":89,"times":"07:00"},{"id":90,"times":"07:15"},{"id":91,"times":"07:30"},{"id":92,"times":"07:45"},{"id":93,"times":"08:00"},{"id":94,"times":"08:15"},{"id":95,"times":"08:30"},{"id":96,"times":"08:45"}';
    var timeStr = "[" + timeStr1+","+timeStr2+","+timeStr3+","+timeStr4+","+timeStr5+","+timeStr6+","+timeStr7+","+timeStr8+","+timeStr9+","+timeStr10+","+timeStr11+","+timeStr12 + "]";
    var timeArr = JSON.parse(timeStr);

    uiData['dataarray'] = [];
    for (let i = 0; i < timeArr.length; i++) {
      const element = timeArr[i];
      let dataObj = {"text":element.times, "fieldvalue":element.times};
      uiData['dataarray'].push(dataObj);
    }
  }*/
  
  //console.log(uiData['name'], ".. combo box.. >>", uiData);
  if(!uiData.hasOwnProperty('ServiceName')){
    uiData['ServiceName'] = "";
  }
  let uiText;
  if(uiData.type === 'DB'){    
    uiText = uiData.displayText;
  }else{
    if(!uiData.dataarray) {
      uiData['dataarray'] = [{"text":"", "fieldvalue":""}];
    }

    let filteredArray = uiData['dataarray'].filter(function(node) {
      if(node !== null)   
        return true;
      return false;
    });
    uiData.dataarray = filteredArray;

    uiText = uiData.dataarray[0]['text'];    
  }  
  
  if(!uiData.hasOwnProperty('placeholderColor')) {
    uiData['placeholderColor'] = {"alpha": 1, "red": 0.6, "green": 0.6, "blue": 0.6, "colorName": ""};
  }
  const placeholder = (uiData['placeholder']) ? uiData['placeholder'] : "";
  if(placeholder.length > 0) {
    uiText = placeholder;
    textColor = getColorValue(uiData['placeholderColor']);
  }

  if(!uiData.hasOwnProperty('multiselect')) {
    uiData['multiselect'] = false;
  }
  if(uiData['multiselect'] && uiData['editable']){
    uiData['editable'] = false;
  }
  if(!uiData.hasOwnProperty('multivalueSeparator')) {
    uiData['multivalueSeparator'] = "comma";
  }
  if(!uiData.hasOwnProperty('multivalueSelector')) {
    uiData['multivalueSelector'] = "Checkmark";
  }
  if(!uiData.hasOwnProperty('checkmarkPosition')) {
    uiData['checkmarkPosition'] = "left";
  }
  if(!uiData.hasOwnProperty('chipVariant')) {
    uiData['chipVariant'] = "outlined";
  }
  const uiVariant = (uiData.chipVariant === "outlined") ? uiData.chipVariant : "default";

  if(!uiData.hasOwnProperty('setSelectAll')) {
    uiData['setSelectAll'] = false;
  }
  if(!uiData.hasOwnProperty('selectallValue')){
    uiData['selectallValue'] = "Select All";
  }
  if(placeholder.length === 0 && uiData['setSelectAll']) {
    uiText = (uiData['selectallValue'].length > 0) ? uiData['selectallValue'] : "Select All";
  }

  if(!uiData.hasOwnProperty('variant')) {
    uiData['variant'] = 'outlined';
  }
  if(uiData['variant'] === 'standard'){
    borderWeight = 0;
    borderRadius = 0;
  }

  if(!uiData.hasOwnProperty('deleteIcon')) {
    uiData['deleteIcon'] = {"srcLocation": "bundle", "filename": "", "fileext": "", "url": ""};
    uiData['actions']['OnDelete'] = [];
  }
  if(uiData['actions'].hasOwnProperty('onDelete')) {
    uiData['actions']['OnDelete'] = uiData['actions']['onDelete'];
    delete uiData['actions']['onDelete'];
  }

  if(!uiData.hasOwnProperty('valueType')) {
    uiData['valueType'] = "Default";
  }
  if(!uiData.hasOwnProperty('multivalueRender')) {
    uiData['multivalueRender'] = "Text";
  }
  if(uiData['multivalueSelector'] === "Chip" || uiData['multivalueSelector'] === "CheckMark") {
    uiData['multivalueSelector'] = "Checkmark";
  }

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
      display: 'table',
      textAlign : textAlign,
      padding: 0, 
      overflow: 'hidden',  
    },
    uitext: {      
      minWidth: 5,
      minHeight: 5,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      height: textHeight,
      width: textWidth,      
      color: textColor,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      display: 'table-cell',
      verticalAlign : verticalAlign,
      textTransform: 'none',
      //borderRight: '1px solid rgb(222,222,222)',
    },
    uiicon: {
     minWidth: 24,
     width: 40,
     paddingTop: `calc(${(containerHeight-24)/2}px)`
    },
    customicon: {
      minWidth: 10,
      minHeight: 10,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: 8,
      paddingTop: `calc(${(containerHeight-24)/2}px)`,
      verticalAlign: 'bottom'
    },
    chipselector: {  
      position:'relative',
      bottom:8,
      left:4, 
      marginRight:4, 
      textTransform:'none'
    }
  }));

  const classes = useStyles();

  const handleDelete = () => {
    console.info('You clicked the delete icon.');
  };

  return (
    <Button id="combobox" className={classes.uilayout} variant={_variant} color="default" disableRipple fullWidth={true}>
      {(uiData['multiselect'] && uiData['multivalueSelector'] === "Checkmark") && 
        <>
          <SvgIcon className={classes.uiicon}><path opacity=".67" d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path></SvgIcon>
          <Typography className={classes.uitext}>Option Text</Typography>      
        </>
      }
      {(uiData['multiselect'] && uiData['multivalueSelector'] === "Chip") &&
        <>
          <Chip className={classes.chipselector}
                label="Option Text" variant={uiVariant} size="small"
                deleteIcon={<DeleteIcon />} onDelete={handleDelete} />
          <Typography className={classes.uitext}></Typography>
        </>
      }
      {!(uiData['multiselect']) && <Typography className={classes.uitext}>{uiText}</Typography>}
      {!isCustomIcon && 
        <SvgIcon className={classes.uiicon}><path opacity=".87" fill="none" d="M24 24H0V0h24v24z"/><path d="M7 10l5 5 5-5z"></path></SvgIcon>
      }
      {isCustomIcon && 
        <img className={classes.customicon} alt="custom" width="24" height="24" src={getImagePath(uiData.customIcon, appConfig.apiURL, appConfig.projectid)}></img>
      }
    </Button>  
  );

}

function getColorValue(colorObj) {
  let _red = parseInt(colorObj.red * 255);
  let _green = parseInt(colorObj.green * 255);
  let _blue = parseInt(colorObj.blue * 255);

  return 'rgba('+_red+','+_green+','+_blue+','+colorObj.alpha+')';
}

function getImagePath(imageObj, _url, _pid) {
  if(imageObj['srcLocation'] === 'bundle') {
    if(imageObj['filename'] !== "")
      return _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];
    else
      return "";
  }    
  else if(imageObj['srcLocation'] === 'url') {
    if(imageObj['url'] !== "")
      return imageObj['url'];
    else
      return "";
  }    
  else if(imageObj['srcLocation'] === 'remoteFile') {
    if(imageObj['filename'] !== "")
      return imageObj['url'] + imageObj['filename'];
    else
      return "";
  }    

  return "";
}




