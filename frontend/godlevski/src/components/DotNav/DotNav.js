import styles from "./DotNav.module.css";

export default ({
  count, 
  onClick=()=>{},
  className="",
  current=null
}) =>( 
  <ul className={className+' '+styles.dotNav}>
    { ([...(new Array(count))])
        .map( (empty, i) => <li
                key={i}
                className={i==current ? styles.active : null}
                onClick={() => onClick(i)}></li>
            )}
  </ul>
);
