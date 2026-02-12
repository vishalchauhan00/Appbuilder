import React from 'react';
import { createStore } from "redux";
import { Provider } from "react-redux";
import './App.css';

import appReducer from './main/reducer/appReducer';
import AppBuilder from './main/AppBuilder';

function App() {
  
  const store = createStore(appReducer);
  //store.dispatch({ type: "RESET" });

  return (
    <Provider store={store}>
      <div className="App">
        <AppBuilder />      
      </div>
    </Provider>
    
  );
}

export default App;
