import Knot from "../classes/Knot/Knot";

import axios from "axios";

import settings from "../backend.settings.js";

const introDataKnot = new Knot();

introDataKnot.getIntro = async function(){
  const {serverBase, introDataPath} = settings;

  try {
    const res = await axios.get(serverBase + introDataPath);

    if(res.status == 200){
      introDataKnot.setState(res.data.data);
      return {status:200, message: "success"}
    }
    else {
      return {status:500, message: "Error."}
    }
  }
  catch {
    return {status:500, message: "Network error."}
  }
  
}

export default introDataKnot;