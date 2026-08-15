import React, {useState} from "react";

import styles from "./Chat.module.css";
import SvgIcon from "../SvgIcon/SvgIcon.jsx";

export default ({active, setActive=()=>{}, mode='folio'}) => {
  
  const color = 
    (mode === 'folio' || mode === 'blue')
    ? 'blue'
    :
    (mode === 'slides' || mode === 'white')
    ? 'white'
    :
    // default
    'black';

  const direction = mode === 'folio' ? 'forward' : 'backward';

  return (

    <div 
      
      className={styles.contactContainer+' '+(active ? styles.active : '')+' '+styles['scheme-'+color]+' '+styles['mode-'+mode]+' '+styles['direction-'+direction]}>

      <div 
        onClick={()=> setActive(!active)}
        className={styles.mainButton}>
        <SvgIcon name="social-contact-circle" className={styles.bg}/>
        <SvgIcon name="shortarrow" className={styles.shortarrow} />
        <SvgIcon name="dialog" className={styles.dialog} />
      </div>

      <a 
        onClick={()=> setActive(!active)}
        href="http://m.me/d.godlevski" target="_blank" className={styles.contactButton}>
        <SvgIcon name="messenger" className={styles['prefilled']} />
      </a>

      <a 
        onClick={()=> setActive(!active)}
        href="https://wa.me/19293247680" target="_blank" className={styles.contactButton}>
        <SvgIcon name="whatsup" className={styles['prefilled']} />
      </a>

      <a 
        onClick={()=> setActive(!active)}
        href="https://t.me/godlevski" target="_blank" className={styles.contactButton}>
        <SvgIcon name="telegram" className={styles['prefilled']} />
      </a>

    </div>

    )
}
  
  