import React, {useEffect, useRef, useState} from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import BackgroundGroup from "../../components/BackgroundGroup/BackgroundGroup.jsx";
import Header, {Schlogo, AboutNavigation, AboutFolioSwitch} from "../../components/Header/Header.jsx";
import HeaderHover from "../../components/HeaderHover/HeaderHover.jsx";
import Chat from "../../components/Chat/Chat.jsx";
import StatusModal from "../../components/StatusModal/StatusModal";

// knot
import {useHot} from "../../classes/Knot/Knot";

import {
  modeKnot,
  submodeKnot,
  hoverKnot,
  messageKnot,
  windowSizeKnot
} from "../../controllers/Knots.js";


// export const modeKnot = new Knot('about'); // two basic modes or first level state
// export const submodeKnot = new Knot(null); // slides/noslides or second level state
// export const hoverKnot = new Knot(false);  // header hover
// export const messageKnot = new Knot(''); // general message

const navigationStates = {
  about: {
    current: '/', 
    state: null
  },
  folio: {
    current: '/folio', 
    state: null
  }
}

function LocationSwitcher(){
  const location = useLocation();
  const {pathname, search, hash, state} = location;
  const fullpath = pathname + search + hash;

  // MAIN MODES
  const prefix = /^\/(folio|about)/.exec(pathname);
  const mode = (prefix && prefix[1]) || 'about'; // defaults to about

  // SUBMODE
  const submodePrefix = /\/(slides)/.exec(pathname);
  const submode = (submodePrefix && submodePrefix[1]) || null;


  if(submodeKnot.state != submode){
    submodeKnot.setState(submode)
  }

  // preserve navigation params by mode
  navigationStates[mode].current = fullpath;
  navigationStates[mode].state = state;

  // dispatch mode to listeners if is different from current
  if(modeKnot.state != mode){
    modeKnot.setState(mode)
  }

  return <></>;
}

// Stating components
function BackgroundStated(){
  const [mode, setModePath] = useHot(modeKnot);
  const [submode] = useHot(submodeKnot);
  const [windowSize] = useHot(windowSizeKnot);

  const isCondenced = windowSize.width <= 960;

  return <BackgroundGroup mode={mode} submode={submode} state={mode == "folio" ? "horizontal" : "none" } condenced={isCondenced} />;
}

function AboutFolioSwitchStated({...args}){
  const [mode, setMode] = useHot(modeKnot);
  const navigate = useNavigate();

  function handleSwitch(){
    const newMode = mode == "folio" ? "about" : "folio";
    
    // navigate to latest preserved state of selected mode
    navigate(navigationStates[newMode].current, {
      state: navigationStates[newMode].state 
    });
    //setMode(newMode);
  }

  return <AboutFolioSwitch 
    position={mode == "about" ? 0 : 1} 
    onClick={handleSwitch} {...args} />
}

function HeaderStated(){
  const [mode, setMode] = useHot(modeKnot);
  const [submode] = useHot(submodeKnot);
  const [windowSize] = useHot(windowSizeKnot);
  const {pathname} = useLocation();

  //console.log('windowSize width', windowSize);

  const isCondenced = windowSize.width <= 960;
  const [open, setOpen] = useState(false);

  return (submode != 'slides'
    ?
  <Header mode={mode}>

    <AboutFolioSwitchStated />
    
    <AboutNavigation mode={mode} condenced={isCondenced} open={open} onClick={e=> isCondenced ? setOpen(!open) : null}>
      <Link to="/" className={pathname == "/" ? "active" : null}>Services Scope</Link>
      <Link to="/process" className={pathname == "/process" ? "active" : null}>Process</Link>
      <Link to="/inquire" className={pathname == "/inquire" ? "active" : null}>Inquire</Link>
    </AboutNavigation>

    <Schlogo mode={mode} onClick={() => hoverKnot.setState(true)}/>

  </Header>
    : null
  );
}

function HeaderHoverStated(){
  const [hover, setHover] = useHot(hoverKnot);
  const [mode, setMode] = useHot(modeKnot)

  return <>
    {mode != "folio" && hover 
      ? 
      <HeaderHover
        email="dmitriy@godlevski.com"
        subject="New%20Connection"
        body="Hey%20Dmitiry,%0A%0ALets%20connect!%20I%20am%20"
        number="+19293247680"
        vcfLink="/files/assorted/dgodlevski.vcf"
        copySuccess={(message) => messageKnot.setState(message) }
        copyError={(message) => messageKnot.setState(message)} 
        kill={() => setHover(false)} /> 
      : null}
  </>
}

function ChatStated(){
  const [mode, setMode] = useHot(modeKnot);
  const [submode] = useHot(submodeKnot);
  const [active, setActive] = useState();

  return <Chat active={active} setActive={setActive} mode={submode||mode}/>;
}

function StatusModalStated(){
  // cant use hot, since it wont run if message is the same
  //const [message, setMessage, listenerRef] = useHot(messageKnot);
  
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(function(){

    // add timestamp update listener to be run before the hot state update
    // const listener = messageKnot.listeners.addListenerBefore(listenerRef.current.id, function(){
    //   timestamp.current = new Date();

    //   console.log('listener staste changed fire', timestamp.current);
    // })

    const listener = messageKnot.listeners.addListener(function(){
      setTimestamp(new Date())
    })

    return listener.remove;

  }, []);

  return <StatusModal 
            message={messageKnot.state}
            timestamp={timestamp}
            />
}

// export back after stating them
export {
  LocationSwitcher,
  BackgroundStated as Background,
  AboutFolioSwitchStated as AboutFolioSwitch,
  HeaderStated as Header,
  HeaderHoverStated as HeaderHover,
  ChatStated as Chat,
  StatusModalStated as StatusModal
}