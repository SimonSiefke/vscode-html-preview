import './Highlight'

let $highlight
function addHighlight(element) {
  $highlight = document.createElement('highlight-dom-element')
  $highlight.element = element
  document.body.append($highlight)
}

function clearHighlight() {
  if ($highlight) {
    document.body.removeChild($highlight)
    $highlight = null
  }
}

function isLeftClick(event: MouseEvent) {
  return event.button === 0
}

window.addEventListener('click', event => {
  if ($highlight && $highlight.element === event.target) {
    return
  }
  if (!isLeftClick(event)) {
    clearHighlight()
    return
  }
  clearHighlight()
  addHighlight(event.target)
})

addHighlight(document.querySelector('button'))
