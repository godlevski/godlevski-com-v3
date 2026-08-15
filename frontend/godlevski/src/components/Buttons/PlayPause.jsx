import Icon from "../SvgIcon/SvgIcon";

import {CubicBezierPath} from "../../classes/CubicBezier/CubicBezier";

import styles from "./PlayPause.module.css";

function PlayPause({
  className='',
  playing=false,
  timer=1,

  height=30,
  width=30,
  ...args
}){

  const circle = new CubicBezierPath();
  
  const r = width/2;
  const archPathCircle = `M ${r}, ${0} a ${r},${r} 0 1,1 0,${r * 2} a ${r},${r} 0 1,1 0,${-r * 2} Z`;

  circle.pushPathString(archPathCircle);

  circle.captureCurvesLength();
  const targetLength = circle.totalCapturedLength * timer;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      overflow="visible"
      viewBox={`0 0 ${width} ${height}`}
      {...args}>

      <path className={"timerCircle "+styles.timerCircle} d={circle.getPathLineStringAtLength(targetLength)} strokeWidth="5" />

      {playing 
      ? <Icon name="pause" />
      : <Icon name="play" />}

    </svg>
  );

}

export default PlayPause;