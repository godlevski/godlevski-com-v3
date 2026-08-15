import React, {useState, useRef, useEffect, Suspense} from "react";

// Stylesheets

import './components/Styles/Styles.css';
import "./components/Layout/Layout.css";

// routing
import { Routes, Route, Link, useLocation, useNavigate, Outlet, useHistory } from "react-router-dom";

// components
//import Background from "./containers/Background/Background.jsx";

import FolioIndex from "./containers/FolioIndex/FolioIndex.jsx";

import {Body} from "./components/Layout/Layout.jsx";

import Intro from "./containers/Intro/Intro";

// pages
import Inquire from "./containers/Inquire/Inquire.jsx";

import Process from "./pages/Process/Process.jsx";

import Slides from "./containers/Slides/Slides.jsx";


// Stated Components
// interstated flat elements 
import {

  LocationSwitcher, 
  Background, 
  AboutFolioSwitch, 
  Header, 
  HeaderHover, 
  Chat, 
  StatusModal

} from "./containers/StatedComponents/StatedComponents";

function FrontEnd(){
  //console.log('app run');

  //const bgMode

  //console.log('location is', location);

  return (<>

 

  <LocationSwitcher />

  <Background />
  
  <Routes>
    
    <Route path="/" element={ <Body /> }>
      <Route index element={ <Intro /> } />
      <Route path="inquire" element={ <Inquire /> } />
      <Route path="process" element={ <Process /> } />
    </Route>

    <Route path="/folio" element={ <><Outlet /></> }>
      <Route index element={ <FolioIndex /> } />
      <Route path="slides" element={<Slides />} />
      
    </Route>
    
  </Routes>

  {/* STATED ELEMENTS */}
  
  <Header />
  <HeaderHover />

  <Chat />
  <StatusModal />

</>)
}

export default FrontEnd;