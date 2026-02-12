import React from "react";

import "./LearningOptions.css";

const LearningOptions = (props) => {
  const options = [
    {
      id: 1,
      text: "Page",
      handler: props.actionProvider.handlePageHelpLinks,      
    },
    {
      id: 2,
      text: "UI Parts",
      handler: props.actionProvider.handleUIPartsHelpLinks,
    },
    {
      id: 3,
      text: "Actions",
      handler: props.actionProvider.handleActionsHelpLinks,
    },
    {
      id: 4,
      text: "Embedded Functions",
      handler: props.actionProvider.handleEmbedFuncHelpLinks,
    },
    {
      id: 5,
      text: "Global Variables",
      handler: props.actionProvider.handleGlobalVarHelpLinks,
    },
  ];

  const optionsMarkup = options.map((option) => (
    <button
      className="learning-option-button"
      key={option.id}
      onClick={option.handler}
    >
      {option.text}
    </button>
  ));

  return <div className="learning-options-container">{optionsMarkup}</div>;
};

export default LearningOptions;