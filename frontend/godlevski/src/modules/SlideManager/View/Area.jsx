import React, {useRef, useEffect} from "react";

import {getCroped64} from "../../../utils/img.js";

import Input, {InputG} from "../../../components/Input/Input";

import styles from "./styles.module.css";

export default ({
  preview={sxp:0, syp:0, exp:0, eyp:0}, 
  imageSrc='', 
  form={},
  tagname="",
  i=0,
  _id="",
  children
}) => {
  // !! since we are expecting base64 as a src, this is not async, useState and useEffect otherwise
  const image = useRef();
  const img = useRef(new Image());

  img.current.setAttribute('crossorigin', 'anonymous');

  useEffect(function(){
    img.current.onload = function(){
      const croped64 = getCroped64(img.current, preview.sxp, preview.syp, preview.exp, preview.eyp, 40, 40);

      image.current.setAttribute('src', croped64)
    }

    img.current.src = imageSrc;

  },[imageSrc, preview])

  return (<div className={styles.dataArea}>
    <img ref={image} src="" />
    <Input
      className={styles.input} 
      name={`tags[${i}][tagname]`}
      defaultValue={tagname}
      placeholder="#tagname" />
    <input type="hidden" name={`tags[${i}][_id]`} value={preview._id} />
    <input type="hidden" name={`tags[${i}][sxp]`} value={preview.sxp ? (preview.sxp*1).toFixed(2) : ''} />
    <input type="hidden" name={`tags[${i}][syp]`} value={preview.syp ? (preview.syp*1).toFixed(2) : ''} />
    <input type="hidden" name={`tags[${i}][exp]`} value={preview.exp ? (preview.exp*1).toFixed(2) : ''} />
    <input type="hidden" name={`tags[${i}][eyp]`} value={preview.eyp ? (preview.eyp*1).toFixed(2) : ''} />
    {children}
  </div>)

};