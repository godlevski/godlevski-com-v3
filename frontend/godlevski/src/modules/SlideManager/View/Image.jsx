import React, {useRef} from "react";

import styles from "./styles.module.css";

export default ({
  image = "",
  reference,
  onLoad=()=>{ console.log('image loaded') }
}) => {
  const blankRef = useRef();

  const ref = reference || blankRef; 

  return (
    image 
        ? <img ref={ref} className={styles.slideImage} src={image} onLoad={onLoad}/> : null
  )
};
