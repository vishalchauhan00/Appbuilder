class MessageParser {
    constructor(actionProvider) {
      this.actionProvider = actionProvider;
    }
  
    parse(message) {
      const lowerCaseMessage = message.toLowerCase()
      
      if (lowerCaseMessage.includes("hello")) {
        this.actionProvider.greet();
      }

      if (lowerCaseMessage.includes("Page")) {
        this.actionProvider.handlePageHelpLinks();
      }
      if (lowerCaseMessage.includes("UI")) {
        this.actionProvider.handleUIPartsHelpLinks();
      }
      if (lowerCaseMessage.includes("Action")) {
        this.actionProvider.handleActionsHelpLinks();
      }
      if (lowerCaseMessage.includes("Function")) {
        this.actionProvider.handleEmbedFuncHelpLinks();
      }
      if (lowerCaseMessage.includes("Global")) {
        this.actionProvider.handleGlobalVarHelpLinks();
      }

    }
  }
  
  export default MessageParser