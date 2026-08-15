import Knot from "../classes/Knot/Knot";

import axios from "axios";

import settings from "../backend.settings.js";

const tagsIndexKnot = new Knot();

tagsIndexKnot.getTags = async function(){
  const {serverBase, tagsIndexPath} = settings;

  try {
    const res = await axios.get(serverBase + tagsIndexPath);

    if(res.status == 200){
      tagsIndexKnot.setState(res.data.data);
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

export default tagsIndexKnot;