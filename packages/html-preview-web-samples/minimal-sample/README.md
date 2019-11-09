# Minimal sample

> This sample shows how to use the html preview within an iframe.

## Quickstart

```sh
npm run dev
```

There is a local part and a remote part. The local part runs inside the browser window and the remote part runs inside the browser window inside an iframe.

The local part and the remote part communicate via the `postMessage` and `onmessage` api the browser window and the iframe contentWindow.
