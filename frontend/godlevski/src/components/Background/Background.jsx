import React from "react";
import styles from "./Background.module.css";

import { useSpring, animated } from "@react-spring/web";

const currents = {
  bgColor: "#dadada"
}

export default ({
                  // mode,
                  // transition,
                  mode,
                  ocx = 240,
                  ocy = 240
                }) => {
    
    const bgColor = mode === "folio"
                      ? "#000f28"
                      : "#dadada"

    
    const bgColorSpring = useSpring({
      from: {backgroundColor: currents.bgColor},
      to: {backgroundColor: bgColor}
    })

    currents.bgColor = bgColor;
                
    return (
    <>
      {/* background div */}
      {/* <animated.div
          className={styles.bg+' '+styles.fixedPane}
          style={{backgroundColor:bgColor}} /> */}

         {/* backgroundColor:bgColor,*/}

      {/* divide bg to 4 areas with separate z-indexes based on 0, 90, 45 pin division */}
      
      <animated.div className={styles.bgPane+' '+styles.topLeftPanel} style={{...bgColorSpring}} />
      <animated.div className={styles.bgPane+' '+styles.topCorner} style={{...bgColorSpring}} />
      <animated.div className={styles.bgPane+' '+styles.topPanel} style={{...bgColorSpring}} />
      <animated.div className={styles.bgPane+' '+styles.leftPanel} style={{...bgColorSpring}} />
      <animated.div className={styles.bgPane+' '+styles.bodyPane} style={{...bgColorSpring}} />
    
    </>
    )
  }

const topLeftPanel = (ocx, ocy) => ({
  width: `50%`,
  height: `${ocy}px`,

  top: `0`,
  right: `50%`,
  marginRight: `${ocx}px`,

  
});

const topCorner = (ocx, ocy) => ({
  clipPath: `polygon(0% 0%, ${ocx}px 0%, 0% ${ocy}px)`,

  width: `${ocx}px`,
  height: `${ocy}px`,

  top: `0`,
  right: `50%`,
  backgroundColor: 'green'

});

const topPanel = (ocx, ocy) => ({
  clipPath: `polygon(0% ${ocy}px, ${ocx}px 0%, 100% 0%, 100% ${ocy}px)`,
  
  height: `${ocy}px`,

  left:`50%`,
  marginLeft: `${ocx*-1}px`,
  
  right: `0`,
  top: `0`,
  backgroundColor: 'blue'
  
});

const leftPanel = (ocx, ocy) => ({
  top: `${ocy}px`,
  right: `${ocx}px`,
  marginRight: `50%`,

  left:  `0`,
  bottom: `0`,
  backgroundColor: 'yellow'

});

const bodyPane = (ocx, ocy) => ({
  top: `${ocy}px`,
  left: `50%`,
  marginLeft: `${ocx*-1}px`,

  right: `0`,
  bottom: `0`,
  backgroundColor: 'cyan'
});