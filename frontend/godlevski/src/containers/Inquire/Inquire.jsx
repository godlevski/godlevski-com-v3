import React, {useRef, useEffect, useState, Fragment} from "react";

import axios from "axios";

import Input, {InputG} from "../../components/Input/Input.jsx";

import styles from "../../pages/Inquire/Inquire.module.css";

import useValidator, {validations, restrictors} from "../../utils/formValidator.hook.jsx";

import ExpandableContainer from "../../components/ExpandableContainer/ExpandableContainer";

import StatusModal from "../../components/StatusModal/StatusModal";

import Loading from "../../components/Loading/Loading";

import backendSettings from "../../backend.settings.js";

import {clearInput} from "../../utils/domHelpers";

export default () => {
  // generic page state to trigger update
  const [pageState, setPageState] = useState(new Date());
  
  // Structure
  const formRef = useRef();
  // mutable object to hang all ref hooks onto
  const formI = useRef({});
  const formII = useRef({});

  // Modal messages
  const networkMessage = useRef('');
  const networkMessageTimestamp = useRef(new Date());
  
  // setup validator for my form
  const [validatorI, validatorApiI] = useValidator(formI, {
    name: value => /^[a-zA-Z\s]*$/g.exec(value)||new Error('Name has to be word characters only'),
    email: validations.email,
  }, {
    name: restrictors.required()
  });

  const [validatorII, validatorApiII] = useValidator(formII, {
    email: validations.email,
    website: value => /^\s*([a-zA-Z0-9\/\:]{1,}\.[a-zA-Z0-9\/\:]{1,}([\,\s]|$){1,})*$/g.exec(value)||new Error('Website(s) field is incorrectly formated.')
  }, {
    description: restrictors.minWords(5)
  });

  const messages = [...validatorApiI.getMessages(),...validatorApiII.getMessages()];

  const [loading, setLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(undefined)
  
  // email verification
  // veirfy email

  // hook system to update page automatically
  const askTimeout = useRef();
  function askHook(hookId){
    const link = backendSettings.serverBase+backendSettings.emailHookPath+hookId;

    clearTimeout(askTimeout.current)

    axios
      .get(link)
      .then(function(response){
        alert('Email confirmed, thank you!');

        const data = response.data;

        setSuccessfullyVerified(typeof data.data == 'object' ? data.data : {});
      })
      .catch(function(error){
        //console.error('error is', error);
        if (error.response && error.response.status == 408){
          console.error('hook has expired need to send a new request');
          setEmailVerified('hook expired');
        }
        else {

          clearTimeout(askTimeout.current)
          askTimeout.current = setTimeout(() => askHook(hookId), backendSettings.emailHookUpdateRateMs);
        }
        
      })
  }

  const [token, setTokenState] = useState(retrieveToken());

  function setToken(token){
    document.cookie = "token="+token;
    setTokenState(token);
  }

  function retrieveToken(){
    const cookies = Object.fromEntries((document.cookie).split(';').map( entry => entry.trim().split('=') ));

    const {token} = cookies;

    return token;
  }

  function setSuccessfullyVerified({token}){
    clearTimeout(askTimeout.current);

    setToken(token);

    setEmailVerified(true);
    setLoading(false);
  }

  function setUnverified(){

    setEmailVerified(undefined);
    setLoading(false);

  }

  // verify by code
  async function verifyByCode(){
    const {email, code} = validatorApiI.getValues();
    const link = backendSettings.serverBase+backendSettings.emailCodeVerificationPath;

    try {
      const res = await axios.post(link, {email, code});

      if(res.status == 201){
        setSuccessfullyVerified(res.data.data);
      } else {
        throw new Error('not verified');
      }
    }
    catch {

      networkMessage.current = 'Code was not accepted, try again or resubmit request';
      networkMessageTimestamp.current = new Date();

      setLoading(new Date());

    }
    
  }

  // send in an email to user
  // normaly we receive a hook id in return and roll in askHook system 
  async function initiateVerificationRequest(){
    
    try {

      const formValid = validatorApiI.validate();

      if(!formValid){
        networkMessageTimestamp.current = new Date();
        networkMessage.current = 'Request have not been sent, please correct errors';
        return;
      }
      else {
        networkMessageTimestamp.current = new Date();
        networkMessage.current = 'Sending request';
      }

      const verificationLink = backendSettings.serverBase+backendSettings.emailVerificationPath;
      const payload = {
        email: formI.current.email.current.value,
        name: formI.current.name.current.value,
        token
      };

      let res
      try {
        res = await axios.post(verificationLink, payload);
      }
      catch (error){
        networkMessageTimestamp.current = new Date();
        networkMessage.current = 'Network Error, check your connection and try again';
        setPageState(new Date());
      }

      if(res.status == 201){
        networkMessageTimestamp.current = new Date();
        networkMessage.current = 'Email was recently confirmed, thank you! You proceed with your inquiry';
        setEmailVerified(true);
        return;
      }

      const {hook} = res.data.data;

      if(res.status > 299 ||  res.status < 200 || !hook) throw Error('Inncorect server response, request may have still been emailed, resubmit or use code')

      networkMessageTimestamp.current = new Date();
      networkMessage.current = 'Confirmation request sent, please check your email';
      setEmailVerified('request sent');
      setLoading(new Date());

      askHook(hook);
    }
    catch (error){

      networkMessageTimestamp.current = new Date();
      networkMessage.current = 'Error sending request';

      console.error('error verifing email', error);
    }

  }

  const [submitted, setSubmitted] = useState(false);

  async function submitInquiry(){
    // validate both forms
    const validated = validatorApiI.validate() && validatorApiII.validate();

    if(!validated){
      networkMessage.current = "Please correct errors in the form";
      networkMessageTimestamp.current = new Date();
      setPageState(new Date());
      return;
    }
    else {
      networkMessage.current = "Sending the request";
      networkMessageTimestamp.current = new Date();
      setPageState(new Date());
    }
    // create consolidated request
    const formData = new FormData(formRef.current);

    // post it to the server
    let res;

    try {
      res = await axios({
        url: backendSettings.serverBase+backendSettings.inquiryPath,
        method: "post",
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } catch (error){
      networkMessage.current = "Server Error, please try again";
      networkMessageTimestamp.current = new Date();
      
      console.error('Error sending inquiry:', error, error.response, error.response);

      if(error.response && error.response.status == 401){
        networkMessage.current = "Your email verification token has expired, please resubmit";
        networkMessageTimestamp.current = new Date();

        setTokenState('expired');
        setUnverified();
      }
      // any failure must NOT fall through to the success path
      setPageState(new Date());
      return;
    }

    // forward to success page on success
    networkMessage.current = "Inquiry submitted succesfully";
    networkMessageTimestamp.current = new Date();
    setPageState(new Date());

    //console.log('success!', res);
    setSubmitted(true);
  }

  function clearForm(ObjWRefs){
    Object.values(ObjWRefs).forEach( ({current}) => {
      if(!current || current.type == "button") return;
      clearInput(current)
    })
  }

  function anotherOne(){
    
    clearForm(formII.current);

    validatorApiII.clear();

    setSubmitted(false);
    setPageState(new Date())
  }

  // global.api = {
  //   formI,
  //   validatorApiI,
  //   retrieveToken, 
  //   token,
  //   formII,
  //   anotherOne
  // }

  function handleKeyDown(e){

    const {target} = e;

    if(target.tagName === 'INPUT' && target.type === 'button'){
      // prevent
      return;
    }

    //console.log('keydown', e, target);

    switch (e.key) {
      // case "Down": // IE/Edge specific value
      // case "ArrowDown":
      //   // Do something for "down arrow" key press.
      //   break;
      // case "Up": // IE/Edge specific value
      // case "ArrowUp":
      //   // Do something for "up arrow" key press.
      //   break;
      // case "Left": // IE/Edge specific value
      // case "ArrowLeft":
      //   // Do something for "left arrow" key press.
      //   break;
      // case "Right": // IE/Edge specific value
      // case "ArrowRight":
      //   // Do something for "right arrow" key press.
      //   break;
      case "Enter":
        // Do something for "enter" or "return" key press.
        if(!emailVerified){
          initiateVerificationRequest();
        }
        else if (emailVerified && emailVerified !== true){
          verifyByCode();
        }
        else if (emailVerified){
          submitInquiry();
        }

        break;
      case "Esc": // IE/Edge specific value
      case "Escape":
        // Do something for "esc" key press.
        target.blur()
        break;
      default:
        return; // Quit when this doesn't handle the key event.
    }

  }

  // RETURN
  return (<>
    <StatusModal timestamp={networkMessageTimestamp.current}>{networkMessage.current}</StatusModal>

    {loading
      ?
    <Loading className={styles.loading} />
      : null
    }

    {submitted
    ?
    <div className={styles.message}>
      <h3>Inquiry Submitted</h3>
      <p>Thank you for your inquiry. I'll do my best to respond asap. Depending on the nature of your request it may take up to 10, but most are answered within <b>1</b> business day.</p>
      
      <Input
        type="button"
        name="newInquiry"
        onClick={anotherOne}
        placeholder="Submit Another One" />

    </div>
    : null}

    <form
      onKeyDown={handleKeyDown}
      style={submitted ? {display:"none"} : null}
      ref={formRef}
      action="godlevski.com"
      method="POST"
      className={styles.form}>

      {emailVerified == undefined
      ?
      <p><span>Please, verify your email via link to submit an inquiry <b className={styles.highlight}>(this page will update automatically and your input will be preserved).</b></span></p>
      : null}

      {emailVerified == 'request sent'
      ?
      <p><span>Confirmation email was sent from dmitriy@godlevski.com; please <b className={styles.highlight}>follow the link in the email</b> and this <b className={styles.highlight}>page will update</b> automatically within {backendSettings.emailHookUpdateRateMs/1000} seconds, <b className={styles.highlight}>alternatively use code</b> verification</span></p>
      : null}


      {emailVerified == 'hook expired'
      ?
      <p><span>Confirmation email was sent a while ago, you may use a code from it or submit a new request to update this form</span></p>
      : null}

      {token == 'expired'
      ?
      <p><span><b className={styles.highlight+' '+styles.warn}>Your email verification has expired, please resubmit.</b></span></p>
      : null}


      <ExpandableContainer 
        theme="orange" 
        right
        clickable={messages.length}
        onlyarrow
        className={styles.messagesContainer+' '+(messages.length?styles['activeMessage']:'')}>
        
        {messages.length 
          ? 
        <><b>Correct following errors ({messages.length}):</b><br /></>
          : null
        }
        {  messages.map( (message,i) => (
        
        <Fragment key={i}>{message}<br /></Fragment>

          )
      
        )}
        
      </ExpandableContainer>

      <InputG
        className={validatorI['name']}
        form={formI.current}
        type="text"
        name="name"
        label="Name"
        placeholder="First Name & Last Name" />

      <InputG
        className={validatorI['email']+' '+styles.wBtn}
        form={formI.current}
        type="text"
        name="email"
        label="email"
        onChange={function(){
          // if email has already been verified, set is to initial position
          if(emailVerified == true){
            setUnverified();
          }
        }}
        placeholder="email@address.com">

        {emailVerified == undefined 
        ?
        <Input
          type="button"
          name="verifyEmail"
          onClick={initiateVerificationRequest}
          placeholder="Get Verification Code And Link" />
        : null}

      </InputG>

      <Input
          type="hidden"
          form={formI.current}
          name="token"
          value={token||''} />

      {emailVerified && emailVerified !== true // is not undefined or yet true
      ?
      <InputG
        type="number"
        name="code"
        form={formI.current}
        label={null}
        placeholder="000000">

        <Input
          type="hidden"
          form={formI.current}
          name="resend"
          value={true} />

        <Input
          type="button"
          name="verifyCode"
          onClick={verifyByCode}
          placeholder="Verify Code" />

        <Input
          type="button"
          name="reverify email"
          onClick={initiateVerificationRequest}
          placeholder="Resend Link" />

      </InputG>
      : null }

      <InputG
        disabled={emailVerified!=true}
        className={validatorII['company']}
        form={formII.current}
        type="text"
        name="company"
        label="Company"
        placeholder="Name you are accomplishing your business under" />

      <InputG
        disabled={emailVerified!=true}
        className={validatorII['website']}
        form={formII.current}
        type="text"
        name="website"
        label="Website(s)"
        placeholder="website.com, website.org some.other.site" />

      <InputG
        disabled={emailVerified!=true}
        className={validatorII['description']}
        form={formII.current}
        type="textarea"
        name="description"
        label="Summary"
        placeholder="Summary of your inquiry. ** longer descriptions may be attached via files below" />

      <InputG
        disabled={emailVerified!=true}
        className={styles.dropBox}
        form={formII.current}
        type="filedrop"
        name="files"
        label=""
        areaPlaceholder="Drop Files Here"
        changeSelectionPlaceholder="Change Selection"
        placeholder="attach files" />

      <InputG
        disabled={emailVerified!=true}
        form={formII.current}
        type="button"
        name="submit"
        onClick={submitInquiry}
        placeholder="Submit Inquiry" />

      
    </form>

  </>)
}

