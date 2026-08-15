import React, {useState, useEffect, useRef} from "react";
import {useLocation, Navigate, Link} from "react-router-dom";
import axios from "axios";
import settings from "./settings";
import styles from "./View/styles.module.css";

export const auth = {
  status: false
}

export default function Auth(){
  const location = useLocation();
  const forwardto = (location.state&&location.state.from.pathname) || null;
  console.log('location is, forwardto', location, forwardto);
  const [status, setStatus] = useState();
  const signinPath = settings.serverBasePath+settings.authPath;

  async function checkSignIn(){
    console.log('signin in');
    try {
      const res = await axios.get(signinPath, { withCredentials: true });
      console.log('sign in response', res);      
      auth.status = true;
      setStatus('You are signed in.');
    }
    catch (error){
      console.error('not signed in', error)
      setStatus('you are not signed in');
    }
    
  }

  function getAuthedDate(){
    const match = /(googleauthed=(\d+))?/g.exec(document.cookie);
    return match[3] ? new Date(match[3]*1) : null;
  }

  const interval = useRef();

  function loginWindow(){

    const authlink = settings.serverBasePath + settings.googleAuth;
    const prevAuthed = getAuthedDate();

    const login = window.open(authlink, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    
    clearInterval(interval.current); // clear previous interval

    interval.current = setInterval(function checkCookie(){
      const curAuthed = getAuthedDate();

      console.log('checking cookie')

      if(curAuthed != prevAuthed){
        console.warn('user authed!')
        clearInterval(interval.current);
      } 
    }, 200)

    console.log('admin window requested');
  }

  function logoutWindow(){
    const logoutlink = settings.serverBasePath + settings.logoutPath;
    const logout = window.open(logoutlink, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
  }

  // kill interval on out
  useEffect(function(){
    //return () => clearInterval(interval.current)
  },[])

  useEffect(checkSignIn, []);

  return ( <>
    <div className={styles.signinContainer}>
    {status || auth.status // check credentials first
      ? 
        !auth.status
        ?
          <>
          <div>{status}</div>
          <button className={styles.button} onClick={loginWindow}>GOOGLE SIGNIN</button>
          </>
        :
        forwardto
        ?
        <Navigate to={forwardto} />
        :
          <>
          <div>You are logged in</div>
          <Link to="slides">go to slides</Link>
          <button className={styles.button} onClick={logoutWindow}>logout</button>
          </>  
      : null
    }
  </div>
  </>
  );
}

export function AdminRoute({ children }){
  const location = useLocation();

  return (
    auth.status 
    ? children
    : <Navigate to="/admin" state={{ from: location }} />
  )
}
