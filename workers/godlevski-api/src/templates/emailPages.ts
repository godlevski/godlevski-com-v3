// ported from v2.1 server/templates/*.html — the pages a visitor sees after
// clicking the verification link in the email (GET requests)

const pageShell = (body: string): string => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>godlevski.com</title>
  </head>
  <body>
  <style>
    html, body { width: 100%; height: 100%; padding: 0; margin: 0; }
    body { position: relative; }
    .message {
      display: inline-block;
      width: 600px; height: 300px; max-width: 90%;
      position: absolute; left: 0; right: 0; bottom: 0; top: 0;
      margin: auto;
    }
  </style>
  <div class="message">${body}</div>
  </body>
</html>`;

export const emailConfirmedPage = pageShell(`
    <h1>Thank you for confirming your email, request source page form will be updated within a few seconds. You may close this window</h1>
    <h3>10 seconds are up in <span id="countdown"></span></h3>
    <script type="text/javascript">
      const el = document.getElementById("countdown");
      let remaining = 10;
      const interval = setInterval(function(){
        remaining = (remaining - 0.1).toFixed(2);
        if(remaining<0) { remaining=0; clearInterval(interval) }
        el.innerHTML = remaining
      }, 100);
    </script>`);

export const confirmationFailedPage = pageShell(`
    <h1>Confirmation failed. Please submit a new request. You may close this page</h1>`);
