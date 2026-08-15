import React from "react";

import SvgIcon from "../SvgIcon/SvgIcon.jsx";

import styles from "./Menu.module.css";

export const ToggleMenu = ({ children, position, className, ...args }) => {
  return (
    <div className={styles.menu+" "+(className||'')+" "+styles.toggleMenu+" "+'position'+position} {...args}>
      <SvgIcon name="shortarrow" />
      {children[position]}
    </div>
  )
}

export const Menu = ({ children, className, condenced, open, ...args }) => {
  return (
    <div className={styles.menu+" "+(className||'')+(condenced ? ' '+styles.condenced : '')+(open ? ' '+styles.open : '')} {...args}>
      {children}
    </div>
  )
}

export default Menu;