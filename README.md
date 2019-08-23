[![travis build](https://img.shields.io/travis/com/SimonSiefke/vscode-html-preview.svg?style=flat-square)](https://travis-ci.com/SimonSiefke/vscode-html-preview) [![Version](https://vsmarketplacebadge.apphb.com/version/SimonSiefke.html-preview.svg)](https://marketplace.visualstudio.com/items?itemName=SimonSiefke.html-preview) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

# Html Preview for VSCode

<!-- TODO demo gif -->

## Features

- Live editing of HTML and CSS (currently there are still some bugs)
- Highlighting of html elements inside the browser (there are still a lot of bugs)

## TODO

- reload page when external resources (e.g. images, javascript) change

## Commands

| Command                            | Keybinding   |
| ---------------------------------- | ------------ |
| Html Preview: Open                 | `ctrl+alt+p` |
| Html Preview: Close Preview Server | none         |

## Settings

| Property              | Description                                                         | Default |
| --------------------- | ------------------------------------------------------------------- | ------- |
| htmlPreview.highlight | Highlight elements in the browser when they are selected in VSCode. | `false` |

<!-- TODO bug: type <h1>a</h1>, select a , type b, $node is undefined -->

<!-- TODO use child process for efficiency -->
<!-- TODO implicit head body tbody tags -->

<!-- autoreload extension: nodemon --watch **/dist/** --exec node scripts/update-extension.js -->

<!-- TODO: bug
input:
<html>

<head>
  <title>Document</title>
  <style></style>
</head>

<body>

</body>

</html>


after <style> type enter enter up tab
error: prefixSum or nodeMap is invalid because node is not found
 -->

<!-- TODO support insertion of element via javascript, preview insertions can be done by referencing beforeid and afterid -->

<!-- TODO debug why live preview isn't working on chrome on mobile android -->
<!-- TODO automatically open browser -->

<!-- TODO live js via chrome devtools api / firefox devtools api similar to lighttable/brackets with chrome -->

<!-- TODO http caching -->

<!-- TODO stop probably not necessary because we can just disconnect when there are no more open sockets (meaning the user has closed the browser and probably wants to close the preview anyway, also he can just reopen the preview) -->

<!-- TODO when opening preview, open new files to the left -->

<!-- TODO shtml -->
<!-- TODO htm -->
<!-- TODO proxy? -->
<!-- TODO cors -->
<!-- TODO elment moves https://trello.com/c/yMmDFqdq/928-live-html-support-moves -->
<!-- TODO better highlight position matching -->
<!-- TODO create vscode.workspace.createfilesystemwatcher -->
<!-- TODO pretty urls when opening, e.g. localhost:3000 instead of localhost:3000/index.html -->
<!-- TODO figure out whats best when another application is blocking the port (killing it or using another port) -->
<!-- TODO live css -->
<!-- TODO dispose listeners in live preview -->
<!-- TODO test when index.html is created or deleted, same for related files -->
<!-- TODO maybe use webworker when there is actually a lot of processing on the client -->
<!-- TODO test when css is deleted/created -->
<!-- TODO multiple files at the same time, only reload index.html and not about.html when index.html is changed -->
<!-- TODO like brackets: when no html file is opened, find the closest html file and open it -->
<!-- support for multiple changes -->
<!-- TODO html preview inside vscode (webview or browserpreview extension or both)-->
