export const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <!-- TODO safer csp -->
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-src http://localhost:3000"
    >
    <style>
      /* restore default selection colors */
      ::selection {
        background-color: #3297df;
        color: white;
      }
      html,body{
        height:100%;
      }
      body {
        margin: 0;
        padding: 0;
        background: white;
        display: flex;
        flex-direction: column
      }
      iframe {
        flex: 1;
      }
      form {
        display: flex;
        border-bottom: 1px solid black;
        padding: 0.2rem 0.4rem;
        background: var(--vscode-editor-background)
      }
      input {
        all: unset;
        flex: 1;
        padding: 0.3rem;
        font-family: sans-serif;
        color: rgb(39, 39, 39);
        background: var(--vscode-input-background);
        color: var(--vscode-input-foreground);
        border: 1px solid currentColor;
        box-sizing: border-box;
        
      }
      input:focus{
        outline: none;
        border-color: var(--vscode-inputValidation-infoBorder);
      }
      form{
        display: none
      }
    </style>
  </head>
  <body>
    <form>
      <button id="forward" aria-label="forward">&lt;-</button>
      <button id="backward" aria-label="backward">-&gt;</button>
      <button id="refresh" aria-label="refresh">&#8635;</button>
      <input type="text" placeholder="Enter address" value="http://localhost:3000" />
    </form>
    <iframe src="http://localhost:3000" frameBorder="0"></iframe>
    <script>
      const $input = document.querySelector('input')
      const $form = document.querySelector('form')
      const $iframe = document.querySelector('iframe')
      $form.addEventListener('submit', event => {
        event.preventDefault()
        console.log($input.value)
        $iframe.src = $input.value
      })

      const $forward = document.getElementById('forward')
      const $backward = document.getElementById('backward')
      const $refresh = document.getElementById('refresh')
      $refresh.addEventListener('click', ()=>{
        
      })
    </script>
  </body>
</html>
`