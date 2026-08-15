import React, {useRef, useState} from "react";

import styles from "./Input.module.css";
import UID from "../../utils/UID.js";

import {makeEvent} from "../../utils/domHelpers.js";

export const Input = ({
  disabled,

  value,
  label, 
  name, 
  placeholder, 
  form={}, 
  type, 
  children, 
  className:classNameInput, 
  id, 
  areaPlaceholder, 
  changeSelectionPlaceholder, 
  onChange,
  onClick,
  multiple, 
  defaultValue}) => {

  const el = useRef();
  const className = (disabled?styles['disabled']+' ':'')+(classNameInput||'');

  // hook it to passed form object
  form[name] = el;

  switch (type) {
    case 'file':
      return File({el, disabled, name, id, placeholder, className, areaPlaceholder, changeSelectionPlaceholder, onChange, multiple});
      break;
    case 'button':
      return Button({el, disabled, placeholder, className, onChange, onClick, type, value});
      break;
    case 'textarea':
      return TextArea({el, disabled, name, placeholder, className, onChange, defaultValue, value});
      break;
    case 'text':
    default:
      return Text({el, disabled, name, type, placeholder, className, onChange, defaultValue, value});
  }
}

export default Input;

export const InputG = ({
  disabled,

  id='a'+UID()+'b', 
  form={}, 
  name=UID(), 
  className:classNameInput, 
  type, 
  label, 
  children, 
  ...args}) => {

  let Comp, filetype;

  switch (type){
    case 'filedrop':
      filetype = 'file';
      Comp = Filedrop;
      break;
    default:
      filetype = type
      Comp = Def;
  }

  const className = (disabled?styles['disabled']+' ':'')+(classNameInput||'');

  return (
    <Comp
      inputid={id}
      form={form}
      name={name}
      className={className+' '+styles['input-'+type+'-container']+' '+styles.inputGroup}>
    
      {<label htmlFor={id}>{label}</label>}
      {Input({type: filetype, form, name, id, disabled, ...args})}
      {children}
    
    </Comp>
    )
}

// Input group types

const Def = ({children, ...args}) => <div {...args}>{children}</div>

const Filedrop = ({form, name, className, children, inputid, placeholder, ...args}) => {
  const container = useRef();

  let inoutcount = 0; // nothing entered, nothing left
  let timeout;

  function toggleClass(el, name, position){
    const classes = el.getAttribute('class');
    const target = position !== undefined 
      ? position 
      : (new RegExp(name)).exec(classes)
        // if found -> aim to remove
        ? false
        // if not found -> aim to add
        : true

    el.setAttribute( 'class', classes.replace(name, '').replace(/\s{2,}/, ' ') + (target ? ' '+name : ''))
  }

  function onDrop(e){
    //console.log('DROPED', e, form, name);
    e.stopPropagation();
    e.preventDefault();
    
    // set files
    const files = e.dataTransfer.files;
    const inputEl = form[name].current;

    inputEl.files = files;

    // fire an event
    const changeEvent = makeEvent('change', true, false);

    inputEl.dispatchEvent(changeEvent);

    //console.log( 'files droped el', inputEl, changeEvent )

  } 

  function onEnterLeave(e){
    // it might have left into a child element, in which case 'enter' on it will be fired before 'leave' on parent. think about it
    inoutcount = inoutcount + (e.type === 'dragenter' ? 1 : -1);
    // timeout prevents ultiple class changes when traveling though children elements
    clearTimeout(timeout)
    timeout = setTimeout( () => toggleClass(container.current, 'dragover', inoutcount), 10 );
  }

  return (
    <div 
      ref={container}
      className={(className||'')+' '+styles['input-filedrop-container']}
      onDragOver={ e => e.preventDefault() }
      onDragEnter={ onEnterLeave }
      onDragLeave={ onEnterLeave }
      onDrop={ (e)=> { onDrop(e); toggleClass(container.current, 'dragover', false)  }}
      {...args}>
      
      {children}
    
    </div>

    )
}

// Input types

const Text = ({
  disabled,
  el, 
  name, 
  type, 
  placeholder, 
  className, 
  defaultValue, 
  value=undefined, 
  onChange}) => 

  <input
    disabled={disabled}

    value={value}
    defaultValue={defaultValue} 
    ref={el} 
    type={type}

    onChange={onChange} 

    name={name} 
    placeholder={placeholder} 
    className={className+' '+styles.input}/>

const TextArea = ({
  disabled,

  value=undefined,
  el, 
  name, 
  placeholder, 
  className, 
  defaultValue}) => 
      
      <textarea
        value={value}
        disabled={disabled} 
        defaultValue={defaultValue} 
        ref={el} 
        rows="6" 
        type="textarea" 
        name={name} 
        placeholder={placeholder} 
        className={className+' '+styles.textarea} />

const Button = ({
  disabled,

  el, 
  placeholder, 
  className, 
  onClick=()=>{}, 
  type, 
  preventDefault=true,
  value
}) =>
      
      <input 
        disabled={disabled}

        ref={el} 
        type={type} 
        className={className+' '+styles.button} 
        value={value||placeholder}
        onClick={e=>{
          if(preventDefault) e.preventDefault();
          onClick(e);
        }} />
      
const File = ({
    disabled,

    name,
    el, 
    id=('a'+UID()), 
    className,
    placeholder="Attach Files",
    areaPlaceholder="Drop Files Here", 
    changeSelectionPlaceholder="Change Selection", 
    multiple=true,
    ...args}) => {
  
  const [files, setFiles] = useState([]);

  function onChange(e){
    //console.log('files changed', e, e.target.files)

    if(typeof args.onChange === 'function') args.onChange(e);

    if(e.isDefaultPrevented()) return;

    //console.log('files changed', e, e.target.files)
    const files = multiple ? [...e.target.files] : e.target.files[0] ? [e.target.files[0]] : [];

    //console.log('files', files, files.length)

    setFiles(files)
  }

  return (
    <div className={className+' '+styles.fileContainer+' input'}>
      
      <input disabled={disabled} name={name} ref={el} type="file" id={id} multiple={multiple}
        {...args}
        onChange={onChange}
        />

      {areaPlaceholder ? 
        <p className={styles.fileAreaPlaceHolder}>{areaPlaceholder}</p> : null}

      <label htmlFor={id} className={styles.fileHook}>{files.length ? changeSelectionPlaceholder: placeholder}</label><br />
      
      {[...Array(files.length)].map( (none, i) => 
          <React.Fragment key={(files[i].name+"").replace(/[^a-zA-Z0-9]/g,'')}>
          <span className={styles.fileName}>{files[i].name}</span>

          {(i < files.length-1 ? ', ' : '')}
          </React.Fragment>
        )}
    </div>
  )
}
      
      
