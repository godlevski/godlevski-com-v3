import React from "react";
import styles from "./BackgroundGroup.module.css";

import Stardust from "../../components/Stardust/Stardust.jsx";
import Grid from "../../components/Grid/Grid.jsx";
import Pin from "../../components/Pin/Pin.jsx";
import { animated } from "@react-spring/web";

import Background from "../Background/Background.jsx"

// TO DO 
// get rid of state

export default ({
                  state="horizontal",
                  condenced=false,
                  transition,
                  mode="about",
                  submode=null
                }) => {
    
    const bgColor = mode === "folio"
                      ? "#000f28"
                      : "#dadada"
                
    return (
    <>
      

      <Background mode={mode} ocx={240} ocy={240} />

      <style>{"body{background-color:"+ bgColor +" !important}"}</style>

      {/* Dust, Pin, Grid */}
      <div className={styles.dustPinGrid+' '+styles.fixedPane}>
        <Grid
          className={styles.children}
          width="960px"
          style={{margin: '0 auto'}}
          rect={
            mode === "folio" && state==="horizontal"
            ?
            {
              x:-5000 - 440,
              y:0
            }
            :
            mode === "folio" && state==="vertical"
            ?
            {
              x:-5000 - 440 - 320,
              y:0
            }
            :
            {
              x:-5000,
              y:-80
            }
          }
          
          strokeColor={
            mode === "folio"
            ?
            "#727272"
            :
            "#727272"
          }
          />

        <Stardust
            className={styles.children} 
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMin slice" />

        <Pin
            className={styles.children}
            style={{
              position:'absolute', 
              left:'50%',
              marginLeft: (
                mode === "folio" && state==="horizontal"
                ?
                '-240px'
                :
                mode === "folio" && state==="vertical"
                ?
                '-560px'
                :
                mode === "about" && condenced
                ?
                '80px'
                :
                '200px'
              ),
              top: (
                mode === "folio"
                ?
                '240px'
                :
                '160px'
              ),
            }}

            animateTo={
              state === "horizontal"
              ?
                {
                  x: 90,
                  y: 0,
                  z: -45
                }
              :
              state === "vertical"
              ?
                {
                  x: 0,
                  y: 90,
                  z: 135
                }
              :
                {
                  x: 0,
                  y: 0,
                  z: 0
                }
            }

            expanded={
              mode === "folio" && submode != "slides"
              ?
              true : false
            }

            color={
              mode === "folio"
                ?
                '#0f5fed'
                :
                '#000000'
            }

            breaksZ={
              state === "horizontal"
              ?
              [[-200, 0]]
              :
              []
              }
            />
      </div>
    </>
  )
}