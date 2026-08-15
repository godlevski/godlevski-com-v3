import React , {useRef, useState, useEffect} from "react";

import styles from "./Log.module.css";

const logAr = [];
console.log = function(...args){
  logAr.push(args);
}

export default () => {
  const log = useRef(logAr);
  const [timestamp, setTimestamp] = useState();

  useEffect(function(){
    console.log = function(...args){
      log.current.push(args);

      setTimestamp(new Date());
    }
  },[]); 

  return <div className={styles.log}>
    {log.current.map( (entry,i) => <p>{i} | {entry}</p> )}
  </div>
}
