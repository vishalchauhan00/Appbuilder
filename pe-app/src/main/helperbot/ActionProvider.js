class ActionProvider {

    constructor(createChatBotMessage, setStateFunc) {
      this.createChatBotMessage = createChatBotMessage;
      this.setState = setStateFunc;
    }
    
    greet() {
      const greetingMessage = this.createChatBotMessage("Hi, Developer")
      this.updateChatbotState(greetingMessage)
    }

    handlePageHelpLinks = () => {
      const message = this.createChatBotMessage(
        "OK, I've got the following resources for you on Appexe 'Pages' :",
        {
          widget: "pageHelpLinks",
        }
      );

      this.updateChatbotState(message);
    };

    handleUIPartsHelpLinks = () => {
      const message = this.createChatBotMessage(
        "OK, I've got the following resources for you on 'UI-Parts' :",
        {
          widget: "uipartHelpLinks",
        }
      );

      this.updateChatbotState(message);
    };

    handleActionsHelpLinks = () => {
      const message = this.createChatBotMessage(
        "OK, I've got the following resources for you on 'Actions' :",
        {
          widget: "actionHelpLinks",
        }
      );

      this.updateChatbotState(message);
    };

    handleEmbedFuncHelpLinks = () => {
      const message = this.createChatBotMessage(
        "OK, I've got the following resources for you on 'Embedded Functions' :",
        {
          widget: "embedfuncHelpLinks",
        }
      );

      this.updateChatbotState(message);
    };

    handleGlobalVarHelpLinks = () => {
      const message = this.createChatBotMessage(
        "OK, I've got the following resources for you on 'Global Variables' :",
        {
          widget: "globalvarHelpLinks",
        }
      );

      this.updateChatbotState(message);
    };







    
    updateChatbotState(message) {
   
      // NOTE: This function is set in the constructor, and is passed in      
      // from the top level Chatbot component. The setState function here     
      // actually manipulates the top level state of the Chatbot, so it's     
      // important that we make sure that we preserve the previous state.   
      
      this.setState(prevState => ({
          ...prevState, messages: [...prevState.messages, message]
      }))
    }
  }
  
  export default ActionProvider