import React from "react";

import {ToggleMenu} from "../Menu/Menu.jsx";
import SvgIcon from "../SvgIcon/SvgIcon.jsx";

import styles from "./Navigation.module.css";

export const CornerButton = ({edge="right", dir="forwards", className, ...args}) => {
  return (
    <div 
      className={styles.cornerButton+" "+styles["corner-"+edge]+" "+styles[dir]+" "+(className||"")}
      {...args}>
      <SvgIcon name="corner" />
    </div>
    )
}