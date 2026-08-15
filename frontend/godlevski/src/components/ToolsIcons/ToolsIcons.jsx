import React from "react";

import styles from "./ToolsIcons.module.css";

import iconsSvgJsx from "./ToolsIcons.defs.svg.jsx";
import svgJsxDefs from "../../utils/svgJsxDefs.jsx";

const DEFS = svgJsxDefs(iconsSvgJsx);

DEFS.settings.defNameSelector = "dataname";

const ToolsLib = {
  "ps": ["Adobe Photoshop","photoshop"],
  "ai": ["Adobe Illustrator","illustrator"],
  
  "s": ["Sublime Text", "sublime"]
}

const nameToAbbr = {};

Object.entries(ToolsLib).forEach(([abbr,name])=>{
  if(Array.isArray(name)){
    name.forEach(name => { nameToAbbr[name] = abbr })
  }
  else {
    nameToAbbr[name] = abbr
  }
});

export default ({ abbr:abbrInput="", name:nameInput, theme, ...args }) => {

  const abbr = abbrInput || nameToAbbr[nameInput];
  const name = nameInput || (Array.isArray(ToolsLib[abbr]) ? ToolsLib[abbr][0] : ToolsLib[abbr]);

  args.className =
    (args.className
         ? args.className 
         : "icon") + " icon"+" "+styles.icon+" icon-"+abbr+' '+styles.iconSvg;

  args.children = <title>{name}</title>;

  const svg = DEFS.getSymbolAsSvg(abbr, args);

  return svg 
    ? svg
    : <div className={styles[theme]+' '+styles.toolLabel+' icon'} title={name}>{abbr}</div>;
}