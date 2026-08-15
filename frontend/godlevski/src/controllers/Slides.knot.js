import Knot from "../classes/Knot/Knot";

import axios from "axios";

import settings from "../backend.settings.js";

const slidesKnot = new Knot();

slidesKnot.getSlides = async function(){
  const {serverBase, slidesPath} = settings;

  try {
    const res = await axios.get(serverBase+slidesPath);

    if(res.status == 200){
      slidesKnot.setState(res.data.data);
      return {status:200, message:'success'}
    }
    else {
      return {status:500, message:'Error.'}
    }
  }
  catch (err){
    
    return {status:500, message:'Network error.'}
  } 
}

export default slidesKnot;