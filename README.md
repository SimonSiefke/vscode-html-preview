[![travis build](https://img.shields.io/travis/com/SimonSiefke/vscode-html-preview.svg?style=flat-square)](https://travis-ci.com/SimonSiefke/vscode-html-preview) [![Version](https://vsmarketplacebadge.apphb.com/version/SimonSiefke.html-preview.svg)](https://marketplace.visualstudio.com/items?itemName=SimonSiefke.html-preview) [![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com/)

# Html Preview for VSCode

<!-- TODO demo gif -->

## Features

- Live editing of html files (currently there are still some bugs)
- Highlighting of html elements inside the browser

## Commands

- Html Preview: Open
- Html Preview: Stop

## Settings

| Property              | Description                                                         | Default     |
| --------------------- | ------------------------------------------------------------------- | ----------- |
| htmlPreview.browser   | The browser to open the preview with                                | `"default"` |
| htmlPreview.highlight | Highlight elements in the browser when they are selected in VSCode. | `true`      |

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

<!-- TODO always bundle injected code, inline sourcemap?, inline code? -->

<!-- TODO stop probably not necessary because we can just disconnect when there are no more open sockets (meaning the user has closed the browser and probably wants to close the preview anyway, also he can just reopen the preview) -->

<!-- TODO when opening preview, open new files to the left -->
