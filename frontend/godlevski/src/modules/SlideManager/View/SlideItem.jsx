import React from "react";

import styles from "./styles.module.css";

export default ({
  client="",
  project="",
  date="",
  tags=[],
  onClick=function(){},
  children
}) => {

  console.log('there is slide')

  return <div
    onClick={onClick}
    className={styles.slideItem}>
    <div>{client}</div>
    <div>{project}</div>
    <div>{date}</div>
    <div>{tags.map(({tagname}) => tagname).join(',')}</div>
    {children}
  </div>
}
