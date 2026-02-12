import React from 'react';

import { createChatBotMessage } from 'react-chatbot-kit';

import LearningOptions from "./components/LearningOptions";
import LinkList from "./components/LinkList";

const config = { 
  botName: "",
  initialMessages: [
    createChatBotMessage("Hi Developer, I'm here to help. What you are looking for ?", {
    widget: "learningOptions",
  })],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#376B7E",      
    },
    chatButton: {
      backgroundColor: "#376B7E",
    },
  },
  customComponents: {
    // Replaces the default header
   header: () => <div style={{ height:16 }}></div>,
   // Replaces the default bot avatar
   botAvatar: (props) => <div {...props} ><img src="assets/mobicon.png" width="44px" height="44px" alt="botAvatar" /></div>,
   // Replaces the default bot chat message container
   /*botChatMessage: (props) => <MyCustomChatMessage {...props} />,
   // Replaces the default user icon
   userAvatar: (props) => <MyCustomAvatar {...props} />,
   // Replaces the default user chat message
   userChatMessage: (props) => <MyCustomUserChatMessage {...props} />*/
 },

  widgets: [
    {
        widgetName: "learningOptions",
        widgetFunc: (props) => <LearningOptions {...props} />,
    },
    {
      widgetName: "pageHelpLinks",
      widgetFunc: (props) => <LinkList {...props} />,
      props: {
        options: [
          {
            text: "Appexe Pages - ADF wiki",
            url:
              "https://redmine.mobilous.com/projects/wpuimedia005/wiki/ADF_Pages",
            id: 1,
          },
          {
            text: "Appexe Pages - Wiki",
            url:
              "https://dev.azure.com/MobilousAppExe/AppExe-Roadmap/_wiki/wikis/AppExe-Roadmap.wiki/51/Page",
            id: 2,
          },
        ],
      },
    },
    {
      widgetName: "uipartHelpLinks",
      widgetFunc: (props) => <LinkList {...props} />,
      props: {
        options: [
          {
            text: "Appexe UI-parts - Help file",
            url:
              "https://helpfiles.blob.core.windows.net/$web/en4/index.html?ui_parts2.htm",
            id: 1,
          },
          {
            text: "Appexe UI-parts - ADF wiki",
            url:
              "https://redmine.mobilous.com/projects/wpuimedia005/wiki/ADF_UI_Parts",
            id: 2,
          },
          {
            text: "Appexe UI-parts - Wiki",
            url:
              "https://dev.azure.com/MobilousAppExe/AppExe-Roadmap/_wiki/wikis/AppExe-Roadmap.wiki/48/UI-parts",
            id: 3,
          },
        ],
      },
    },
    {
      widgetName: "actionHelpLinks",
      widgetFunc: (props) => <LinkList {...props} />,
      props: {
        options: [
          {
            text: "Appexe Actions - Help file",
            url:
              "https://helpfiles.blob.core.windows.net/$web/en4/index.html?actions2.htm",
            id: 1,
          },
          {
            text: "Appexe Actions - ADF wiki",
            url:
              "https://redmine.mobilous.com/projects/wpuimedia005/wiki/ADF_Actions",
            id: 2,
          },
          {
            text: "Appexe Actions - Wiki",
            url:
              "https://dev.azure.com/MobilousAppExe/AppExe-Roadmap/_wiki/wikis/AppExe-Roadmap.wiki/49/Actions",
            id: 2,
          },
        ],
      },
    },
    {
      widgetName: "embedfuncHelpLinks",
      widgetFunc: (props) => <LinkList {...props} />,
      props: {
        options: [
          {
            text: "Appexe Embedded Functions",
            url:
              "https://redmine.mobilous.com/projects/wpuimedia005/wiki/Embedded_Functions",
            id: 1,
          }
        ],
      },
    },
    {
      widgetName: "globalvarHelpLinks",
      widgetFunc: (props) => <LinkList {...props} />,
      props: {
        options: [
          {
            text: "Appexe Global Variables",
            url:
              "https://redmine.mobilous.com/projects/wpuimedia005/wiki/Map_GPS_global_variables",
            id: 1,
          }
        ],
      },
    },
 ],
}

export default config