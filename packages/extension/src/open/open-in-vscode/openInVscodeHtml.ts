export const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
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
      body {
        margin: 0;
        padding: 0;
        background: white;
      }
      iframe {
        height: 90vh;
        width: 100%;
      }
      form {
        display: flex;
        border-bottom: 2px solid black;
      }
      input {
        all: unset;
        flex: 1;
        padding: 0.3rem;
        font-family: sans-serif;
        color: rgb(39, 39, 39);
      }
    </style>
  </head>
  <body>
    <form>
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
    </script>
  </body>
</html>
`