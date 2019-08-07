export interface HighlightStyle extends Partial<CSSStyleDeclaration> {
  left: string | null
  top: string | null
  '--width': string | null
  '--height': string | null
  '--margin-top': string | null
  '--margin-right': string | null
  '--margin-bottom': string | null
  '--margin-left': string | null
  '--padding-top': string | null
  '--padding-right': string | null
  '--padding-bottom': string | null
  '--padding-left': string | null
}

function computeOffsetWithoutTransform($element: HTMLElement) {
  let $currentElement: HTMLElement | null = $element
  let offsetLeft = 0
  let offsetTop = 0

  // Probably the easiest way to get elements position without including transform
  do {
    offsetLeft += $currentElement.offsetLeft
    offsetTop += $currentElement.offsetTop
    $currentElement = $currentElement.offsetParent as HTMLElement
  } while ($currentElement)
  return {
    left: `${offsetLeft}px`,
    top: `${offsetTop}px`,
  }
}

export function getHighlightAnimationStyle(
  originalStyle: CSSStyleDeclaration
): Partial<CSSStyleDeclaration> {
  return {
    animationName: originalStyle.animationName,
    animationDuration: originalStyle.animationDuration,
    animationIterationCount: originalStyle.animationIterationCount,
    animationTimingFunction: originalStyle.animationTimingFunction,
    animationPlayState: originalStyle.animationPlayState,
  }
}

export function getHighlightStyle(
  $element: HTMLElement,
  boundingRect: ClientRect | DOMRect,
  originalStyle: CSSStyleDeclaration
): HighlightStyle {
  return {
    // left: `${boundingRect.left + window.scrollX}px`,
    // top: `${boundingRect.top + window.scrollY}px`,
    ...computeOffsetWithoutTransform($element),
    transform: originalStyle.transform,
    transformOrigin: originalStyle.transformOrigin,
    // animationName: originalStyle.animationName,
    // animationDuration: originalStyle.animationDuration,
    // animationTimingFunction: originalStyle.animationTimingFunction,
    // animationIterationCount: originalStyle.animationIterationCount,
    // animation: 'fly 2s linear',
    // animationn
    // 'animation-'
    '--width': originalStyle.width,
    '--height': originalStyle.height,
    '--margin-top': originalStyle.marginTop,
    '--margin-right': originalStyle.marginLeft,
    '--margin-bottom': originalStyle.marginBottom,
    '--margin-left': originalStyle.marginLeft,
    '--padding-top': originalStyle.paddingTop,
    '--padding-right': originalStyle.paddingRight,
    '--padding-bottom': originalStyle.paddingBottom,
    '--padding-left': originalStyle.paddingLeft,
  }
}

function dashCase(s) {
  return s.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`)
}

/**
 * Apply an object of styles to an HTML element
 */
export function applyStyle(
  $element: HTMLElement,
  styleObject: Partial<CSSStyleDeclaration>
) {
  for (const [key, value] of Object.entries(styleObject)) {
    $element.style.setProperty(dashCase(key), value)
  }
}
