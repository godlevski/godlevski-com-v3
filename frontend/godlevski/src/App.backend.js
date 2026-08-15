import { Routes, Route } from "react-router-dom";

import './components/Styles/Styles.css';

// modules

import Auth, {AdminRoute} from "./modules/SlideManager/Auth";
import SlidesManger from "./modules/SlideManager/SlideManager";
import SlidesList from "./modules/SlideManager/SlidesList";

function Backend(){

  return(<>

      <Routes>
        {/* ADMIN */}
        <Route path="/slides" element={<AdminRoute><SlidesList /></AdminRoute>} />
        <Route path="/slides/:slideId" element={<AdminRoute><SlidesManger /></AdminRoute>} />
        <Route path="/slides/new/:copyFrom" element={<AdminRoute><SlidesManger /></AdminRoute>} />
        <Route path="/" element={<Auth />} />
      </Routes>

    </>
  )
}

export default Backend;