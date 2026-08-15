import React from "react";

import styles from "./FolioIndex.module.css";

import Labels from "./Labels/Labels.jsx";
import Tags from "./Tags/Tags.jsx";
import Icons from "./Icons/Icons.jsx";

import ClipPathCenter from "../ClipPathCenter/ClipPathCenter.jsx";

import Icon from "../SvgIcon/SvgIcon";

/*
    data structure as follows:
    tags: [
      <section>[
        "",<section name>
        "",..<item>
      ],
    ],
    lables: [
      "",..<label>
    ],
    icons: [
      <label col>[
        [""<link>, 0<slide number (optional)>],..<icon>
      ]
    ]
  */
export default ({
  children, 
  mode, 

  tags=[], 
  labels=[], 
  icons=[],
  projectsIds=[]

}) => {
  
  return (
    <>
      {/* scroll box */}
      {/* <ClipPathCenter
        cssClipPath="polygon( 0 240px, ${cx-240}px 240px, ${cx}px 0, 100% 0, 100% 100%, 0 100% )"
        className={styles.indexPane}> */}

        {/* markings */}

        

        <div className={styles.indexPane+" nozindex"}>
          
          <Labels className={styles.markingTop} data={labels} projectsIds={projectsIds} />
          
          <Tags className={styles.markingLeft} data={tags}>
            
            <li className={styles.tagsFade}>  
              <Icon name="phone-turn" scheme="blue" />
            </li>

          </Tags>
          <Icons className={styles.iconsPane} data={icons} />

        </div>



        {/* icons */}
        
        {children}

      {/* </ClipPathCenter> */}
    </>
    
  );
}