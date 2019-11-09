# Web worker sample

> This sample shows how to use the html preview with a web worker.

## Quickstart

```sh
npm run dev
```

There is a local part, a remote part and a web worker part. The local part runs inside the browser window, the remote part runs inside the browser window inside an iframe and the worker part runs inside a web worker.

The local part and the remote part communicate via the `postMessage` and `onmessage` api the browser window and the iframe contentWindow.
The local part and the web worker part communicate via the `postMessage` and `onmessage` of Web Workers.

When the input of the textarea changes, the local part asks the worker part to compute the diffs (which can be a resource intensive computation). The diffs are then sent from the worker back to the local part and the local part sends them to the remote part.

Here is an example:

1. The textarea value is `'<h1>hello |</h1>'`
1. The user types `'w'`
1. The textarea emits input event which is transformed into an edit list `[{ rangeLength: 0, rangeOffset: 10, text: 'w' }]`
1. The edit list is sent to the worker
1. The worker computes the diffs `[{ command: 'textReplace', payload: { id: 2, text: 'hello world' }}]`
1. The diffs are sent back to the main thread
1. The diffs are sent from the main thread to the iframe
1. The code inside the iframe executes the commands (e.g. `const $node = api.nodeMap[payload.id]; $node.data = payload.text;`)
1. The iframe shows the updated html `<h1>hello w</h1>`
