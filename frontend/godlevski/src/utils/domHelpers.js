export const makeEvent = function(name, bubbles=false, cancelable=false){
  
  if(typeof Event === 'function') return new Event(name, {bubbles, cancelable});
  const e = document.createEvent(name);
  e.initEvent(bubbles, cancelable);

  return e;
}

export const clearInput = function(el){
  el.value = '';

  if(el.type == 'file'){
    const changeEvent = makeEvent('change', true, true);
    el.dispatchEvent(changeEvent)
  }

  return el;
}

export const copyTextToClipboard = function(text, success=()=>{}, failure=()=>{}) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text, success, failure);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    success()
  }, function(err) {
    failure()
  });
}

function fallbackCopyTextToClipboard(text, success=()=>{}, failure=()=>{}) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    
    if(successful){
      success();
    } else {
      failure();
    };

  } catch (err) {
    failure();
  }

  document.body.removeChild(textArea);
}

