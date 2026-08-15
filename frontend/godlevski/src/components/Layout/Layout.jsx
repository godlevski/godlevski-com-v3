import React from "react";

import styles from "./Layout.module.css";

import {Outlet} from "react-router-dom";

export const Body = ({children}) => 
  <div className={styles.layout}>
    {children}
    <Outlet />
  </div>
  
export default Body;