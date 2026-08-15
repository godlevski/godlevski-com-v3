import React from "react";

import styles from "./Icons.module.css";

import { Link } from "react-router-dom";

const presets = {
  width: 16,
  height: 16,
  //lineHeight: '24px',
  marginBottom: 8,
  marginRight: 32,
}

const Icons = ({className, data: icons, slideIds=[]}) => 

    <div className={styles["iconsPane"] +' '+ className}>
      {icons.map( (group, c) => 
        <div key={c} className="iconsGroup">
          {group.map( (icon, r) => {
            const style = {
              top: r*(presets.height+presets.marginBottom),
              left: c*(presets.width+presets.marginRight),
            }

            return icon[0] 
            ? <Link
                key={c+'.'+r}
                className={styles.iconContainer}
                style={style}
                to={'/folio/slides#'+ icon[1]}>
                <img src={icon[0]+'&w=16&h=16'} />
                
              </Link>
            : <span
                key={c+'.'+r} 
                className={styles.iconContainer}
                style={style} />

          }
             
          )}
        </div>
      )}
    </div>

export default Icons;