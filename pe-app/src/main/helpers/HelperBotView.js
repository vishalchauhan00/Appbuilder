import React from 'react';

import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';

import config from '../helperbot/config';
import ActionProvider from '../helperbot/ActionProvider';
import MessageParser from '../helperbot/MessageParser';


export default function HelperBotView(props) {

  return (    
   <div style={{padding:0}}>
        <Chatbot disableScrollToBottom
                config={config} actionProvider={ActionProvider} messageParser={MessageParser}/>
    </div>
  );

}
