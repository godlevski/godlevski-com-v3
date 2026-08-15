import React from "react";
import styles from "./HeaderHover.module.css";

import SvgIcon from "../SvgIcon/SvgIcon.jsx";

import qr from "../resources/qr.png";

import {copyTextToClipboard} from "../../utils/domHelpers";

export default ({
  email="email",
  subject="",
  body="",
  number="tel:+19293247680",
  vcfLink="",
  copySuccess= (msg) => setTimeout(() => alert(msg), 2),
  copyError= (msg) => setTimeout(() => alert(msg), 2),
  kill=()=>{}
}) => {

  return (
    <div 
      onClick={kill}
      className={styles.fixedPane+" "+styles.headerHover}>
      
      <SvgIcon 
        name="roundclose" 
        className={styles.closeButton+" icon activeIcon"} />

      <div 
        onClick={e=>e.stopPropagation()}
        className={styles.buttonGroup+" "+styles.buttonGroupTop}>
        <span>COPY </span>
        <div 
          onClick={function(){
            copyTextToClipboard(email+"", () => copySuccess("Email copied"), () => copyError("Error copying email") )
          }}
          className={styles.button+" "+styles.buttonSlash+" activeIcon"}>EMAIL</div>
        <div 
          onClick={function(){
            copyTextToClipboard(number+"", () => copySuccess("Number copied"), () => copyError("Error copying number") )
          }}
          className={styles.button+" activeIcon"}>PHONE NUMBER</div>
      </div>

      <div 
        onClick={e=>e.stopPropagation()}
        className={styles.buttonGroup+" "+styles.buttonGroupBottom}>
        {/*
          https://mail.google.com/mail/?
            view=cm
            &fs=1
            &su=THIS%20IS%20TITLE
            &body=Dear,%0AWe Love you
            &to=email@email.com
        */}
        <a
          target="_blank" 
          href={"http://compose.mail.yahoo.com/?"
            + "subj=" + subject
            + "&body=" + body
            + "&to=" + email
          }
          className={styles.button+" "+styles.buttonSlash}>
          <SvgIcon name="yahoo" />
        </a>
        {/*
          http://compose.mail.yahoo.com/?
            subj=THIS%20IS%20TITLE
            &body=Dear,%0AWe Love you
            &to=email@email.com
        */}
        <a
          target="_blank" 
          href={"https://mail.google.com/mail/?view=cm&fs=1"
            + "&su=" + subject
            + "&body=" + body
            + "&to=" + email
          }
          className={styles.button}>
          <SvgIcon name="gmail" /> 
        </a>
        <a
          target="_blank"
          href={'tel:'+number}
          className={styles.button+" activeIcon"}>
          <SvgIcon name="call" className={" icon activeIcon"} />
        </a>
      </div>

      <div className={styles.qrFrame}>
        
        <SvgIcon 
          name="qr-bg"
          className={styles.frame} />
        <img src={qr} />
       
      </div>

      <a href={vcfLink} className={styles.button+" "+styles.qrButton+" activeIcon"}>
        <SvgIcon name="download" /> Add to Contacts
      </a>
         
    </div>
  );
}