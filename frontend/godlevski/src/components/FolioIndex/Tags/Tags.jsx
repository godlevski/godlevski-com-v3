import React, {Fragment} from "react";
import styles from "./Tags.module.css";

const Tags = ({className, data: tags, children}) => <>
  <ul 
    className={styles.tags +' '+className}
    style={{
      
    }}>

    {tags.map((section, s) => <Fragment key={s}>
      {section.map( (tag, i) => 
        (i==0)
        ?
        <li key={i} className={styles.label}><span>{section[0]}</span></li>
        :
        <li key={i}><span>{tag}</span></li>
        )}
      </Fragment> 
    )}

    {children}
  </ul>
</>

export default Tags;