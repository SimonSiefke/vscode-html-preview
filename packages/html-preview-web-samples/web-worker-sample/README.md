# Web worker sample

> This sample shows how to use the html preview with a web worker.

## Quickstart

```sh
npm run dev
```

There is a local part, a remote part and a web worker part. The local part runs inside the browser window, the remote part runs inside the browser window inside an iframe and the worker part runs inside a web worker.

The local part and the remote part communicate via the `postMessage` and `onmessage` of iframes.
The local part and the web worker part communicate via the `postMessage` and `onmessage` of Web Workers.
