import React from "react";
import styles from "./Header.module.css";

import navStyles from "../Navigation/Navigation.module.css";

import {Menu, ToggleMenu} from "../Menu/Menu.jsx";

import * as NavigationEls from "../Navigation/Navigation.jsx";


export default ({children, mode}) => {

  return <div className={styles.headerContainer+' '+styles['mode-'+mode]}>{children}</div>

}

export function Schlogo({className='', mode, ...args}){
  return <div className={styles.headerItem+" "+styles.schlogo+" mode-"+mode} {...args}>
      <h1><a href="http://godlevski.com" onClick={e => e.preventDefault()}>dmitriy<span>@</span>godlevski<span>.com</span></a></h1>
      <h2>+1.929.324.7680</h2>
    </div>
}

export function AboutNavigation({className='', mode, children, condenced=false, open, ...args}){
  
  return <Menu className={styles.headerItem+" "+styles.middleMenu+" mode-"+mode} condenced={condenced} open={open} {...args}>
    <label>Profile</label>
    {children}
  </Menu>
}

export const AboutFolioSwitch = ({className='', position=0, ...args}) => {

  return (
    <ToggleMenu className={styles.leftMenu+" "+styles.headerItem+" "+styles.modeSwitch} position={position} {...args}>
      <a href="/about" onClick={e => e.preventDefault()}>Folio</a>
      <a href="/folio" onClick={e => e.preventDefault()}>About</a>
    </ToggleMenu>
  );
}
