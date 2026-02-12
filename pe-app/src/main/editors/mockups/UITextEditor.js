import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';


export default function UITextEditor(props) {
  const uiData = props.data;
  var uiText = (uiData.text) ? uiData.text : "";

  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;
  const textWidth = uiData.frame.width - (paddingLeft + paddingRight + 2*borderWeight);
  const textHeight = uiData.frame.height - (paddingTop + paddingBottom + 2*borderWeight);

  const fontFamily = (uiData.font && uiData.font.fontName !== 'system') ? uiData.font.fontName : 'Arial';
  const fontSize = (uiData.font) ? uiData.font.fontSize : 0;
  const fontWeight = (uiData.font.fontWeight) ? 'bold' : 'normal';
  const fontStyle = (uiData.font.fontStyle) ? 'italic' : 'normal';
  let textColor = (uiData.font) ? getColorValue(uiData.font.textColor) : 0;
  const textAlign = (uiData.font) ? uiData.font.textAlignment : 'left';
  const verticalAlign = (uiData.verticalAlignment) ? uiData.verticalAlignment : 'top';
  let itemAlign = 'start';
  if(verticalAlign === "top")
    itemAlign = 'start';
	else if(verticalAlign === "middle")
    itemAlign =  'center';
	else if(verticalAlign === "bottom")
    itemAlign =  'end';

  let textDecoration = 'none';
  if(uiData['underline'] && uiData['strikeout'])
    textDecoration = 'line-through underline';
	else if(uiData['underline'])
    textDecoration =  'underline';
	else if(uiData['strikeout'])
    textDecoration =  'line-through';

  let textTransform = 'none';
  if(uiData['autocapitalizationType'] === 'Words')
    textTransform = 'capitalize';
  else if(uiData['autocapitalizationType'] === 'AllCharacters')
    textTransform =  'uppercase';
	else if(uiData['autocapitalizationType'] === 'Sentences'){
    textTransform =  'none';
    let _text = "";
    
    uiText = uiText.toString().toLowerCase();
    let arrSentence = uiText.split(".");
    for (let i = 0; i < arrSentence.length; i++) {
      let sentence = arrSentence[i];
      _text += sentence.charAt(0).toUpperCase() + sentence.substr(1).toLowerCase();
    }
    uiText = _text;
  }    
	
  if(uiData['trim']){
    uiText.trim();
  }

  const placeHolder = uiData.placeholder;
  if(!placeHolder){
    uiData.placeholder = "";
  }
  if(!uiData.hasOwnProperty('placeholderColor')) {
    uiData['placeholderColor'] = {"alpha": 1, "red": 0.6, "green": 0.6, "blue": 0.6, "colorName": ""}
  }
  if(placeHolder && placeHolder.length > 0 && uiText.length === 0){
    uiText = placeHolder;
    textColor = getColorValue(uiData['placeholderColor']);
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
  if(!uiData.hasOwnProperty('boxShadow')) {
    uiData['boxShadow'] = false;
    uiData['boxShadowWidth'] = 4;
    uiData['boxShadowColor'] = {"alpha": 1, "red": 0.870588, "green": 0.870588, "blue": 0.870588, "colorName": ""};
  }
  const boxShadowWidth = parseInt(uiData['boxShadowWidth']);
  const boxShadowColor = getColorValue(uiData['boxShadowColor']);
  const boxShadow = (uiData['boxShadow']) ? '0px ' + boxShadowWidth + 'px ' + boxShadowColor : 0;

  if(!uiData.hasOwnProperty('showtoolbar')) {
    uiData['showtoolbar'] = true;
  }
  if(!uiData.hasOwnProperty('toolbarPosition')){
    uiData['toolbarPosition'] = 'bottom';
  }

  if(!uiData.toolbar.hasOwnProperty('showfontsize')){
    uiData['toolbar']['showfontsize'] = false;
  }

  const tbBGcolor = getColorValue(uiData['toolbar']['backgroundColor']);

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: { 
      minWidth: 16,
      minHeight: 16,
      width: '100%',
      height: '100%',
      backgroundColor: getColorValue(uiData.backgroundColor),
      boxSizing:'border-box',
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      display: 'table',
      textAlign : textAlign,
      boxShadow: boxShadow
    },
    uitext: {
      minWidth: 5,
      minHeight: 5,
      //width:'100%',
      width: `calc(${textWidth}px)`,
      //height:'100%',
      height: `calc(${textHeight - 32}px)`,
      //lineHeight: '1rem',
      color: textColor,
      fontFamily: fontFamily,
      fontSize: `calc(${fontSize}px)`,
      fontWeight: fontWeight,
      fontStyle: fontStyle,      
      textDecoration: textDecoration,
      textTransform: textTransform,
      //display: 'table-cell',
      //verticalAlign : verticalAlign,
      display: 'flex',
      alignItems: itemAlign,
      overflow: 'hidden'
    },
  }));

  const classes = useStyles();

  return (
    <Box id="textview" className={classes.uilayout} >
      {(uiData['showtoolbar'] && uiData['toolbarPosition'] === 'top') && 
        <img src="assets/uimockup/rte-toolbar.png" alt="rte-toolbar" style={{width:'100%',height:32, backgroundColor:tbBGcolor}}></img>
      }
      <div id="contentedit" className={classes.uitext} style={{whiteSpace:'break-spaces', display:'grid'}}
           contentEditable="false" suppressContentEditableWarning>{uiText}</div>
      {(uiData['showtoolbar'] && uiData['toolbarPosition'] === 'bottom') && 
        <img src="assets/uimockup/rte-toolbar.png" alt="rte-toolbar" style={{width:'100%',height:32, backgroundColor:tbBGcolor}}></img>
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

/* function getColorValue(colorObj) {
  let _red = Math.ceil(colorObj.red * 255);
  let _green = Math.ceil(colorObj.green * 255);
  let _blue = Math.ceil(colorObj.blue * 255);

  return fullColorHex(_red, _green, _blue);
}
function fullColorHex(r,g,b) {   
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return '#'+red+green+blue;
};
var rgbToHex = function (rgb) { 
  var hex = Number(rgb).toString(16);  
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
}; */

