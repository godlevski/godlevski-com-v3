import React, {useEffect, useState, useRef} from "react";

function toCapitalCase(string){
  return (string+"").replace(/^(.).*/g,'$1').toUpperCase()+(string+"").replace(/^.(.*)/g,'$1')
}

function useValidator(formRef={current:{}}, validations={}, fulfillment={}){

  const validated = useRef({});
  const api = useRef({
    validated: false,
    messages: {},
    getMessages: function(){
      const allMessages = [];

      Object.values(api.current.messages).forEach( bulk => {
        if(Array.isArray(bulk)){ 
          allMessages.push(...bulk); 
        } else {
          allMessages.push(bulk);
        } 
      })

      return allMessages;
    },
    clear: function(){
      api.current.messages = {};
      Object.keys(validated.current).forEach( name => {
        validated.current[name] = '';
      })
    },
    getValues: function(){
      // !! no need for validations names, since its for validation of input, not fullfilment ...Object.keys(validations)
      const names = ([...Object.keys(formRef.current), ...Object.keys(fulfillment)])
      const values = {};

      names.forEach(name => {
        const el = (formRef.current[name] && formRef.current[name].current) || undefined;
        const value = el ? el.value : undefined

        values[name] = value
      })

      return values;
    }

  });

  const [checked, setCheked] = useState(new Date());

  useEffect(function HookOnOutCheck(){
    const softValidated = {};

    Object.entries(formRef.current).forEach(([name, ref]) => {
      
      const el = ref.current;
      
      el.addEventListener('blur', () => {
        ValidateField(name, el.value);
        setCheked(new Date());
      })
      
    })
      
    }, []);

  function ValidateField(name, value){
    //console.log('value', value);
    const valid = typeof validations[name] == 'function' ? validations[name](value) : true;
    const fullfilled = typeof fulfillment[name] == 'function' ? fulfillment[name](value) : true;

    const isValid = valid&&!(valid instanceof Error);
    const isFullfilled = fullfilled&&!(fullfilled instanceof Error);

    //console.log('value, ', el, value, fulfillment[name], validations[name]);

    let classes = '';
    const messages = [];
    const fieldName = toCapitalCase(name);

    messages.name = name;

    if(!isValid){
      classes += " bad";
      const message = ((valid && valid.message) || toCapitalCase(name) + ' is invalid');
      messages.push( '(!) '+message.replace(/\$\{(name)\}/gi, fieldName) );
    }
    if(!isFullfilled){
      classes += " unfulfilled";
      const message = (fullfilled && fullfilled.message) || fieldName + ' is unfullfilled';

      messages.push( '(*) '+message.replace(/\$\{(name)\}/gi, fieldName) );
    }
    

    if(isValid&&isFullfilled) classes += " accepted";

    validated.current[name] = classes;
    api.current.messages[name] = messages;

    return isValid&&isFullfilled
  }

  function ValidateForm(){

    api.current.validated = true;

    // checking that all fields present/visible is valid and all fullfilment requirments are met 
    // !! no need since its for validation of input, not fullfilment ...Object.keys(validations)
    ([...Object.keys(formRef.current), ...Object.keys(fulfillment)]).forEach((name) => {

      const el = (formRef.current[name] && formRef.current[name].current) || undefined
      const value = el ? el.value : '';

      if(!ValidateField(name, value)) api.current.validated = false;
    });

    setCheked(new Date());

    return api.current.validated
  }

  api.current.validate = ValidateForm;

  return [validated.current, api.current];
}

export const restrictors = {
  min: function(number, error){ 
    return (value) => (((value+'').length >= number)||(error||new Error('${name} has to be a minimum of '+number))) 
  },
  minWords: function(number, error){
    return (value) => 
      (new RegExp(`^([^\\s]{1,}(\\s|$){1,}){${number},}$`,'g'))
        .exec(value.trim().replace(/\./g,'').replace(/\s{1,}/g,' '))

      ||

      (error||new Error('${name} has to be a minimum of '+number+' words'));
  },
  required: function(error){
    return (value) => !(!value)||(error||new Error('${name} is required'));
  }
}

export const validations = {
  email: (value) => /^\s*(\w|\w-|\w\.)(\w|-\w|\.\w){0,}@(\w|\w-|\w\.)(\w|-\w|\.\w){0,}\.\w{1,}\s*$/gi.exec(value+'')
}

export default useValidator;