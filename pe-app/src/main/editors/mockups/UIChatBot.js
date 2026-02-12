import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Typography} from '@material-ui/core';

import defaultBotAvatar from '../../../assets/uimockup/chatbots/bot.png';
import defaultUserAvatar from '../../../assets/uimockup/chatbots/user.png';
import defaultAttachIcon from '../../../assets/uimockup/chatbots/attach.png';
import defaultSendIcon from '../../../assets/uimockup/chatbots/send.png';
import defaultMicIcon from '../../../assets/uimockup/chatbots/mic.png';


export default function UIChatBot(props) {
  const appConfig = props.appconfig;
  const uiData = props.data; 

  const uiBackgroundColor = getColorValue(uiData.backgroundColor);
  const uiBackground = (uiData.backgroundGradient && uiData.backgroundGradient.lengrh > 0) ? uiData.backgroundGradient : uiBackgroundColor;
  
  const borderWeight = uiData.borderWeight;
  const borderColor = getColorValue(uiData.borderColor);
  const borderRadius = (uiData.cornerRadius) ? parseInt(uiData.cornerRadius) : 0;

  const boxShadowWidth = parseInt(uiData['boxShadowWidth']);
  const boxShadowColor = getColorValue(uiData['boxShadowColor']);
  const boxShadow = (uiData['boxShadow']) ? '2px ' + boxShadowWidth + 'px ' + boxShadowColor : '0px 0px ' + boxShadowColor;

  const paddingTop = (uiData.padding) ? parseInt(uiData.padding.top) : 0;
  const paddingBottom = (uiData.padding) ? parseInt(uiData.padding.bottom) : 0;
  const paddingLeft = (uiData.padding) ? parseInt(uiData.padding.left) : 0;
  const paddingRight = (uiData.padding) ? parseInt(uiData.padding.right) : 0;

  const uicontentWidth = parseInt(uiData.frame.width) - (paddingLeft + paddingRight); 

  const textColor = getColorValue(uiData.chatInputfont.textColor);
  const bubbleAlign = uiData.bubbleAlign;
  const bubbleMaxWidth = parseInt(uicontentWidth * uiData.bubbleMaxWidth/100) - 44;

  //bot-bubble
  const botBgColor = getColorValue(uiData.botBubblebackgroundColor);
  const botBackground = (uiData.botBubblebackgroundGradient && uiData.botBubblebackgroundGradient.lengrh > 0) ? uiData.botBubblebackgroundGradient : botBgColor;
  const botborderWeight = uiData.botBubbleborderWeight;
  const botborderColor = getColorValue(uiData.botBubbleborderColor);
  const botborderRadius = (uiData.chatInputcornerRadius) ? parseInt(uiData.chatInputcornerRadius) : 0;
  const botboxShadowWidth = parseInt(uiData['botBubbleboxShadowWidth']);
  const botboxShadowColor = getColorValue(uiData['botBubbleboxShadowColor']);
  const botboxShadow = (uiData['botBubbleboxShadow']) ? '2px ' + botboxShadowWidth + 'px ' + botboxShadowColor : '0px 0px ' + botboxShadowColor;

  let botAvatarSrc = getImagePath(uiData.botAvatar, appConfig.apiURL, appConfig.projectid);
  if(botAvatarSrc === "")  botAvatarSrc = defaultBotAvatar;

  //user-bubble
  const userBgColor = getColorValue(uiData.userBubblebackgroundColor);
  const userBackground = (uiData.userBubblebackgroundGradient && uiData.userBubblebackgroundGradient.lengrh > 0) ? uiData.userBubblebackgroundGradient : userBgColor;
  const userborderWeight = uiData.userBubbleborderWeight;
  const userborderColor = getColorValue(uiData.userBubbleborderColor);
  const userborderRadius = (uiData.userBubblecornerRadius) ? parseInt(uiData.userBubblecornerRadius) : 0;
  const userboxShadowWidth = parseInt(uiData['userBubbleboxShadowWidth']);
  const userboxShadowColor = getColorValue(uiData['userBubbleboxShadowColor']);
  const userboxShadow = (uiData['userBubbleboxShadow']) ? '2px ' + userboxShadowWidth + 'px ' + userboxShadowColor : '0px 0px ' + userboxShadowColor;

  let userAvatarSrc = getImagePath(uiData.userAvatar, appConfig.apiURL, appConfig.projectid);
  if(userAvatarSrc === "")  userAvatarSrc = defaultUserAvatar;

  //chat-input-values
  const chatInputHeight = 40;
  const inputBgColor = getColorValue(uiData.chatInputbackgroundColor);
  const inputBackground = (uiData.chatInputbackgroundGradient && uiData.chatInputbackgroundGradient.lengrh > 0) ? uiData.chatInputbackgroundGradient : inputBgColor;
  const inputborderWeight = uiData.chatInputborderWeight;
  const inputborderColor = getColorValue(uiData.chatInputborderColor);
  const inputborderRadius = (uiData.chatInputcornerRadius) ? parseInt(uiData.chatInputcornerRadius) : 0;
  const inputboxShadowWidth = parseInt(uiData['chatInputboxShadowWidth']);
  const inputboxShadowColor = getColorValue(uiData['chatInputboxShadowColor']);
  const inputboxShadow = (uiData['chatInputboxShadow']) ? '2px ' + inputboxShadowWidth + 'px ' + inputboxShadowColor : '0px 0px ' + inputboxShadowColor;

  let attachIconSrc = (uiData.supportAttachments) ? getImagePath(uiData.attachmentIcon, appConfig.apiURL, appConfig.projectid) : "";
  if(attachIconSrc === "")  attachIconSrc = defaultAttachIcon;

  let sendIconSrc = getImagePath(uiData.sendIcon, appConfig.apiURL, appConfig.projectid);
  if(sendIconSrc === "")  sendIconSrc = defaultSendIcon;

  let micIconSrc = getImagePath(uiData.micIcon, appConfig.apiURL, appConfig.projectid);
  if(micIconSrc === "")  micIconSrc = defaultMicIcon;

  const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    uilayout: {
      width: '100%',
      height: '100%',
      background: uiBackground,
      boxSizing:'border-box',
      boxShadow: boxShadow,
      borderWidth : `calc(${borderWeight}px)`,
      borderStyle: 'solid',
      borderColor: borderColor,
      borderRadius: `calc(${borderRadius}px)`,
      paddingTop : `calc(${paddingTop}px)`,
      paddingBottom : `calc(${paddingBottom}px)`,
      paddingLeft : `calc(${paddingLeft}px)`,
      paddingRight : `calc(${paddingRight}px)`,
      display: 'flex',
      flexDirection: 'column'
    },
    container: {
      width: '100%',
      height: `calc(100% - ${chatInputHeight}px)`,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    },
    chatbox: {
      width: '100%',
      height: chatInputHeight,
      display: 'flex',
      gap: 4,
    },
    botbox: {
      width: '100%',
      display: 'flex',
      alignItems: bubbleAlign,
    },
    botbubble: {
      width: 'inherit',
      maxWidth: bubbleMaxWidth,
      height: '40px',
      padding: '6px',
      background: botBackground,
      boxSizing:'border-box',
      color: textColor,
      boxShadow: botboxShadow,
      borderWidth : `calc(${botborderWeight}px)`,
      borderStyle: 'solid',
      borderColor: botborderColor,
      borderRadius: `calc(${botborderRadius}px)`,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      textAlign: 'start',
      lineHeight: 1
    },
    bottail: {
      width: 16,
      height: 12,
      background: botBackground,
      boxSizing:'border-box',
      borderWidth : `calc(${botborderWeight}px)`,
      borderStyle: 'solid',
      borderColor: botborderColor,      
      borderRight: 0,
      margin: 2,
      clipPath: 'polygon(100% 0, 100% 100%, 0 50%)'
    },
    userbox: {
      width: '100%',
      display: 'flex',
      alignItems: bubbleAlign,
      justifyContent: 'end',
    },
    userbubble: {
      width: '80px',
      height: '40px',
      padding: '0px 4px',
      background: userBackground,
      boxSizing:'border-box',
      boxShadow: userboxShadow,
      borderWidth : `calc(${userborderWeight}px)`,
      borderStyle: 'solid',
      borderColor: userborderColor,
      borderRadius: `calc(${userborderRadius}px)`,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    },
    usertail: {
      width: 16,
      height: 12,
      background: userBackground,
      boxSizing:'border-box',
      borderWidth : `calc(${userborderWeight}px)`,
      borderStyle: 'solid',
      borderColor: userborderColor,
      borderLeft: 0,
      margin: 2,
      clipPath: 'polygon(0 0, 0% 100%, 100% 50%)'
    },
    chatinput: {
      width: '100%',
      height: '100%',
      background: inputBackground,
      boxSizing:'border-box',
      color: 'rgba(102,102,102,1)',
      boxShadow: inputboxShadow,
      borderWidth : `calc(${inputborderWeight}px)`,
      borderStyle: 'solid',
      borderColor: inputborderColor,
      borderRadius: `calc(${inputborderRadius}px)`,
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    },
    userinput: {
      width: '100%',
      padding: 4, 
      textAlign: 'start',
      fontFamily: uiData.chatInputfont.fontName,
      fontSize: uiData.chatInputfont.fontSize, 
    },
    smallicon: {
      width: 32, height: 32,
      borderRadius: '50%'
    },
    largeicon: {
      width: 40, height: 40,
      borderRadius: '50%'
    }
    
  }));

  const classes = useStyles();

  return (
    <Box id="chatbotview" className={classes.uilayout} >
      <div id="chatbox-container" className={classes.container}>
        <div className={classes.botbox}>
          <img alt='bot' src={botAvatarSrc} className={classes.largeicon} style={{marginRight:8}}></img>
          {uiData.bubbleShowTail && <Box className={classes.bottail} style={{marginRight:'-2px'}}></Box> }
          <div className={classes.botbubble} style={{whiteSpace:'break-spaces', display:'grid'}}
               contentEditable="false" suppressContentEditableWarning>{uiData.onInitMessage}</div>          
        </div>
        <div className={classes.userbox}>
          <Box className={classes.userbubble}></Box>          
          {uiData.bubbleShowTail && <Box className={classes.usertail} style={{marginLeft:'-2px'}}></Box> }
          <img alt='user' src={userAvatarSrc} className={classes.largeicon} style={{marginLeft:8}}></img>
        </div>
      </div>
      <div id="chatbox" className={classes.chatbox}>
        <div className={classes.chatinput}>
          {(uiData.supportAttachments && uiData.attachmentIconPosition === "left") &&
            <img id="attachiconstart" alt='attach' src={attachIconSrc} className={classes.smallicon}></img>
          }
          <Typography id="userInput" className={classes.userinput}>{uiData.prompt}</Typography>
          {(uiData.supportAttachments && uiData.attachmentIconPosition === "right") &&
            <img id="attachiconend" alt='attach' src={attachIconSrc} className={classes.smallicon}></img>
          }
        </div>
			  <img id="sendbutton" alt='send' src={(uiData.supportVoiceInput) ? micIconSrc : sendIconSrc} className={classes.largeicon}></img>
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

function getImagePath(imageObj, _url, _pid) {
  let imagepath = "";

  if(imageObj['srcLocation'] === 'bundle') {
    if(imageObj['filename'] !== "" && imageObj['fileext'] !== "") {
      imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'] +"."+ imageObj['fileext'];
    }else {
      if(imageObj['filename'] !== "") {
        imagepath = _url + "download/image/" + _pid +"/" + imageObj['filename'];
      }else {
        imagepath = "";
      }
    }
  }
  else if(imageObj['srcLocation'] === 'url') {    
    imagepath = imageObj['imageName'];
    setURLImage_FileAndExt(imageObj);
  }    
  else if(imageObj['srcLocation'] === 'remoteFile')
    imagepath = imageObj['url'] + imageObj['filename'];
  else
    imagepath = imageObj['filename'];

  return imagepath;
}

function setURLImage_FileAndExt(imageObj) {
  if(imageObj.hasOwnProperty('imageName')) {

    const strVal = imageObj['imageName'];
    if(strVal.length > 0){
      const refStartIndex = strVal.indexOf("[");
      const refEndIndex = strVal.indexOf("]");
      if(refStartIndex > -1) {
        if(refEndIndex > -1 && refEndIndex > refStartIndex) {
          imageObj['url'] = imageObj['filename'] = imageObj['fileext'] = "";
        }
      }else {
        imageObj['url'] = strVal.substring(0, strVal.lastIndexOf("/"));
        let strImageName = strVal.substring(strVal.lastIndexOf("/") + 1);
        if(strImageName.indexOf(".") > -1) {
          imageObj['filename'] = strImageName.substring(strImageName.lastIndexOf("/") + 1, strImageName.lastIndexOf("."));
          imageObj['fileext'] = strImageName.substr(strImageName.lastIndexOf(".") + 1, strImageName.length);
        }else {
          imageObj['filename'] = strImageName.substring(strImageName.lastIndexOf("/") + 1, strImageName.length);
          imageObj['fileext'] = "";
        }
      }
    }else {
      imageObj['url'] = imageObj['filename'] = imageObj['fileext'] = "";
    }
  }else {
    if(imageObj['fileext'] !== "") {
      imageObj['imageName'] = imageObj['url'] +"/"+ imageObj['filename'] +"."+ imageObj['fileext'];
    }else {
      imageObj['imageName'] = imageObj['url'] +"/"+ imageObj['filename'];
    }
  }
}
