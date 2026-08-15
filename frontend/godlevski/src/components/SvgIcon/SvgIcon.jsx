import React from "react";

import styles from "./SvgIcon.module.css";

import iconsSvgJsx from "./SvgIcons.defs.svg.jsx";
import svgJsxDefs from "../../utils/svgJsxDefs.jsx";

const DEFS = svgJsxDefs(iconsSvgJsx);

DEFS.settings.defNameSelector = "dataname"

export default ({ name, scheme, ...args }) => {

  args.className = args.className || '';
  args.className += ' icon';
  args.className += ' '+styles.icon;
  args.className += ' icon-'+name;
  args.className += ' '+styles['scheme-'+scheme];

  return DEFS.getSymbolAsSvg(name, args);
}