import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { BrowserRouter } from "react-router-dom";

import globals from "./globals.js";

// sets viewport dynamicly
import viewportValues from "./viewportValues";

import {isIos} from "./utils/userAgent";

//import reportWebVitals from './reportWebVitals';


const root = document.getElementById('root');

if(globals.development && !isIos){
  const html = document.getElementsByTagName('html')[0];
  html.setAttribute('class', 'dev');
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
  ,
  root
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
