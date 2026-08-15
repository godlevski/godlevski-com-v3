import React, {useEffect, useRef} from "react";

import styles from "./StatusModal.module.css";

export default ({
  message,
  timestamp,
  children
}) => {
  const messageRef = useRef();
  const timeout = useRef();

  const messageToShow = children||message;

  function showMessage(){
    if(!messageToShow) return;

    const clearClass = (messageRef.current.getAttribute('class')+'').replace(styles.show, '').trim().replace(/\s{1,}/g, ' ');
    const newClass = clearClass + ' ' + styles.show; 
    
    clearTimeout(timeout.current);
    messageRef.current.setAttribute('class', clearClass);
    timeout.current = setTimeout(
      function(){
        messageRef.current.setAttribute('class', newClass);
      }, 10);

    //console.log('there is a new message');
  }

  useEffect(showMessage, [message, children, timestamp]);
  useEffect(showMessage, []);

  return <div ref={messageRef} className={styles.modalContainer+' '+(!messageToShow ? styles.empty : '')}>{messageToShow}</div>
}