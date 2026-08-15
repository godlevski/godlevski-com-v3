import React, { useRef, useState, Suspense } from "react";

// Fonts
// Fonts
import "./App.fonts-preload.js";
import './components/Styles/Fonts.css';

//import Log from "./Log";

import { Routes, Route } from "react-router-dom";

import Loading from "./components/Loading/Loading";

const FrontEnd = React.lazy(() => import("./App.frontend.js"));
const BackEnd = React.lazy(() => import("./App.backend.js"));

// surpress warnings
// const warnings = [];
// console.warn('Warnings Are:', warnings);
// console.warn = function(...args){
//   warnings.push(args);
// }

console.log('node env ', process.env.NODE_ENV);

export default function App(){


  return (<>
    
    {/*<Log />*/}

    <Routes>

      <Route path="admin/*" element={<Suspense fallback={<Loading scheme="blue" />}><BackEnd /></Suspense>} />
      <Route path="*" element={<Suspense fallback={<Loading scheme="blue" />}><FrontEnd /></Suspense>} />
      
    </Routes>

    </>
    )
}

// /folio
// /folio/slides#slideName

// /about(/?services)
// /about/process
// /about/inquire


// <Routes>
    
//     <Route path="folio" element={<FolioIndex />} />
//     <Route path="folio/slides/:slideId" element={<Slides />} />
    
//     {/*<FolioIndex />*/}
//     {/*<Slides />*/}

//     <Route path="about" element={<Body />}>
      
//       <Route path="inquire" element={<Inquire />} />
//       <Route path="process" element={<Process />} />

//     </Route>

//     <Route path="admin/slides" element={<AdminRoute><SlidesList /></AdminRoute>} />
//     <Route path="admin/slides/:slideId" element={<AdminRoute><SlidesManger /></AdminRoute>} />
//     <Route path="admin/slides/new" element={<AdminRoute><SlidesManger /></AdminRoute>} />
//     <Route path="admin" element={<Auth />} />

//   </Routes>
  
