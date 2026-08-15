import React from "react";
import styles from "./Labels.module.css";

import {Link} from "react-router-dom";

const Labels = ({className, data: labels, projectsIds=[], children}) => <>
  <ul className={styles.labels +' '+ className}>
    {labels.map( (label, i) => 
      <li key={i}><Link to={"/folio/slides#"+projectsIds[i]}>{label}</Link></li>
    )}

    {/*{labels.length < 11
      ?
      [...(new Array(11-labels.length))].map( empty => <li className={styles.empty}>.qwertyuiop[].</li>)
      : null
    }*/}

    {children}
  </ul>

</>

export default Labels;