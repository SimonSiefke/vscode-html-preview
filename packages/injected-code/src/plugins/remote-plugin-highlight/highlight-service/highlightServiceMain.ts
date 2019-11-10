// import * as _ from 'lodash';

export interface HighlightStyle extends Partial<CSSStyleDeclaration> {
  left: string | undefined
  top: string | undefined
  '--width': string | undefined
  '--height': string | undefined
  '--margin-top': string | undefined
  '--margin-right': string | undefined
  '--margin-bottom': string | undefined
  '--margin-left': string | undefined
  '--padding-top': string | undefined
  '--padding-right': string | undefined
  '--padding-bottom': string | undefined
  '--padding-left': string | undefined
}

function computeOffsetWithoutTransform(
  $element: HTMLElement,
  originalStyle: CSSStyleDeclaration,
  borderBox: boolean
) {
  let $currentElement: HTMLElement | null = $element
  let offsetLeft = 0
  let offsetTop = 0

  // Probably the easiest way to get elements position without including transform
  do {
    offsetLeft += $currentElement.offsetLeft
    offsetTop += $currentElement.offsetTop
    $currentElement = $currentElement.offsetParent as HTMLElement
  } while ($currentElement)

  if ($element === document.body) {
    // TODO check if this works with transform
    const boundingRect = document.body.getBoundingClientRect()
    offsetTop = boundingRect.top
    offsetLeft = boundingRect.left
  }
  // if ($element === document.body) {
  // offsetLeft += parseInt(originalStyle.marginLeft || '0', 10)
  // offsetTop += parseInt(originalStyle.marginTop || '0', 10)
  // }

  if (borderBox) {
    offsetLeft -= parseInt(originalStyle.marginLeft || '0', 10)
    offsetTop -= parseInt(originalStyle.marginTop || '0', 10)
  }

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
  originalStyle: CSSStyleDeclaration,
  borderBox: boolean
): HighlightStyle {
  return {
    // left: `${boundingRect.left + window.scrollX}px`,
    // top: `${boundingRect.top + window.scrollY}px`,
    ...computeOffsetWithoutTransform($element, originalStyle, borderBox),
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
    '--margin-right': originalStyle.marginRight,
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
  styleObject: Partial<
    CSSStyleDeclaration & {
      '--color-margin': string
      '--color-padding': string
      '--color-content': string
    }
  >
) {
  for (const [key, value] of Object.entries(styleObject)) {
    $element.style.setProperty(dashCase(key), value)
  }
}

// run `npm run update-highlight-css` to update this code
const baseStyle =
  '.margin,.padding,:host{position:absolute}:host{display:block;--padding-horizontal:calc(var(--padding-left) + var(--padding-right));--padding-vertical:calc(var(--padding-top) + var(--padding-bottom));--margin-horizontal:calc(var(--margin-left) + var(--margin-right));--margin-vertical:calc(var(--margin-top) + var(--margin-bottom));pointer-events:none;width:calc(var(--width) + var(--padding-horizontal));height:calc(var(--height) + var(--padding-vertical));z-index:2000000}.content{background:var(--color-content);width:var(--width);height:var(--height);-webkit-transform:translate(var(--padding-left),var(--padding-top));transform:translate(var(--padding-left),var(--padding-top))}.padding{--top:var(--padding-top);--right:var(--padding-right);--bottom:var(--padding-bottom);--left:var(--padding-left);--full-width:calc(var(--width) + var(--padding-horizontal));--full-height:calc(var(--height) + var(--padding-vertical));background:var(--color-padding)}.margin,.padding{-webkit-clip-path:polygon(0 0,0 100%,var(--left) 100%,var(--left) var(--top),calc(var(--full-width) - var(--right)) var(--top),calc(var(--full-width) - var(--right)) calc(var(--full-height) - var(--bottom)),var(--left) calc(var(--full-height) - var(--bottom)),var(--left) 100%,100% 100%,100% 0);clip-path:polygon(0 0,0 100%,var(--left) 100%,var(--left) var(--top),calc(var(--full-width) - var(--right)) var(--top),calc(var(--full-width) - var(--right)) calc(var(--full-height) - var(--bottom)),var(--left) calc(var(--full-height) - var(--bottom)),var(--left) 100%,100% 100%,100% 0);width:var(--full-width);height:var(--full-height)}.margin{--top:var(--margin-top);--right:var(--margin-right);--bottom:var(--margin-bottom);--left:var(--margin-left);--full-width:calc(var(--width) + var(--margin-horizontal) + var(--padding-horizontal));--full-height:calc(var(--height) + var(--margin-vertical) + var(--padding-vertical));background:var(--color-margin);-webkit-transform:translate(calc(-1*var(--margin-left)),calc(-1*var(--margin-top)));transform:translate(calc(-1*var(--margin-left)),calc(-1*var(--margin-top)))}:host(.border-box){width:calc(var(--width) + var(--margin-horizontal));height:calc(var(--height) + var(--margin-vertical))}:host(.border-box) .margin{--full-width:calc(var(--width) + var(--margin-horizontal));--full-height:calc(var(--height) + var(--margin-vertical));-webkit-transform:none;transform:none}:host(.border-box) .padding{--full-width:var(--width);--full-height:var(--height);-webkit-transform:translate(var(--margin-left),var(--margin-top));transform:translate(var(--margin-left),var(--margin-top))}:host(.border-box) .content{width:calc(var(--width) - var(--padding-horizontal));height:calc(var(--height) - var(--padding-vertical));-webkit-transform:translate(calc(var(--padding-left) + var(--margin-left)),calc(var(--padding-top) + var(--margin-top)));transform:translate(calc(var(--padding-left) + var(--margin-left)),calc(var(--padding-top) + var(--margin-top)))}'

// TODO animation
// animateStartValue: {
//   "background-color": "rgba(0, 162, 255, 0.5)",
//   "opacity": 0
// },
// animateEndValue: {
//   "background-color": "rgba(0, 162, 255, 0)",
//   "opacity": 0.6
// },

// const customStyle = {
//   '--color-padding': 'rgba(147, 196, 125, 0.55)',
//   '--color-margin': 'rgba(246, 178, 107, 0.66)',
//   '--color-content': 'rgba(111, 168, 220, 0.66)',
// }

function createElement(className: string) {
  const element = document.createElement('div')
  element.className = className
  return element
}

class HighlightDomElement extends HTMLElement {
  private _$element: HTMLElement | undefined

  private _highlightStyle!: Partial<HighlightStyle>

  private _boundingRect!: ClientRect | DOMRect

  private _computedStyle!: CSSStyleDeclaration

  private readonly $style = document.createElement('style')

  /**
   * The HTML Element for highlighting padding
   */
  private readonly $padding: HTMLDivElement = createElement('padding')

  /**
   * The HTML Element for highlighting margin
   */
  private readonly $margin: HTMLDivElement = createElement('margin')

  /**
   * The HTML Element for highlighting content
   */
  private readonly $content: HTMLDivElement = createElement('content')

  /**
   * The HTML Element for showing a tooltip with the name of the element as well as classes and the id of the element
   */
  private readonly $tooltip: HTMLDivElement = createElement('tooltip')

  constructor() {
    super()
    this.update = this.update.bind(this)
    // Create a shadow root for scoped styles
    this.attachShadow({ mode: 'open' })
    // append the base styles
    this.$style.textContent = baseStyle
    this.shadowRoot!.append(this.$style)
    // append the margin highlight element
    this.shadowRoot!.append(this.$margin)
    // append the padding highlight element
    this.shadowRoot!.append(this.$padding)
    // append the content highlight element
    this.shadowRoot!.append(this.$content)
  }

  get element() {
    return this._$element
  }

  set element(value: HTMLElement | undefined) {
    this._$element = value
  }

  update() {
    this._computedStyle = window.getComputedStyle(this.element!)
    const borderBox = this._computedStyle.boxSizing === 'border-box'

    const newHighlightStyle = getHighlightStyle(
      this.element!,
      this._boundingRect,
      this._computedStyle,
      borderBox
    )

    if (borderBox && !this.classList.contains('border-box')) {
      this.classList.add('border-box')
    } else if (!borderBox && this.classList.contains('border-box')) {
      this.classList.remove('border-box')
    }

    // if (!_.isEqual(this._highlightStyle, newHighlightStyle)) {
    this._highlightStyle = newHighlightStyle
    applyStyle(this, this._highlightStyle)
    // }
  }

  // this is like a second constructor, the only difference is that we can change styles now
  connectedCallback() {
    if (!this.element) {
      throw new Error('cannot highlight non existing element')
    }

    applyStyle(this, {
      // '--color-padding': 'rgba(212,121,11,0.4)',
      '--color-padding': 'transparent',
      '--color-margin': 'rgba(21, 165, 255, 0.58)',
      // '--color-content': 'rgba(0,212,11,0.4)',
      '--color-content': 'transparent',
      transitionProperty: 'opacity, background-color',
      transitionDuration: '300ms, 2.3s',
      backgroundColor: 'rgba(0, 162, 255, 0.5)',
      opacity: '0',
    })

    setTimeout(() => {
      applyStyle(this, {
        backgroundColor: 'rgba(0, 162, 255, 0)',
        opacity: '0.6',
      })
    }, 20)

    this._boundingRect = this.element.getBoundingClientRect()
    // Don't highlight elements with 0 width and height
    // if (this._boundingRect.width === 0 && this._boundingRect.height === 0) {
    //   return
    // }
    this.update()

    /**
     * we cannot add the animation straight away because then it might not be in sync with the animation of the target element. We also don't want to use requestanimationframe because its not as smooth as animations.
     */
    const addAnimation = () => {
      this._computedStyle = window.getComputedStyle(this.element!)
      applyStyle(this, getHighlightAnimationStyle(this._computedStyle))
      this.element!.removeEventListener('animationiteration', addAnimation)
    }

    if (
      this._computedStyle.animationName !== 'none' &&
      this._computedStyle.animationPlayState === 'paused'
    ) {
      addAnimation()
    } else if (this._computedStyle.animationName !== 'none') {
      let animationFrame: number
      const updateWithAnimationFrame = () => {
        this.update()
        animationFrame = requestAnimationFrame(updateWithAnimationFrame)
      }

      this.element.addEventListener('animationiteration', () => {
        cancelAnimationFrame(animationFrame)
        addAnimation()
      })
      updateWithAnimationFrame()
    }
  }
}

// Register the custom element
window.customElements.define('highlight-dom-element', HighlightDomElement)

let highlights: Array<{ $element: HTMLElement; $highlight: HighlightDomElement }> = []

export const addHighlights = ($elements: HTMLElement[]) => {
  let different = false
  if (highlights.length !== $elements.length) {
    different = true
  } else {
    for (let i = 0; i < highlights.length; i++) {
      if (highlights[i].$element !== $elements[i]) {
        different = true
        break
      }
    }
  }
  if (!different) {
    return
  }
  clearHighlights()

  for (const $element of $elements) {
    const $highlight = document.createElement('highlight-dom-element') as any
    $highlight.element = $element
    highlights.push({ $highlight, $element })
    document.body.append($highlight)
  }
}

export const updateHighlights = () => {
  console.log('hu')
  for (const highlight of highlights) {
    highlight.$highlight.update()
  }
}

// @ts-ignore
window.u = updateHighlights

const clearHighlights = () => {
  for (const highlight of highlights) {
    document.body.removeChild(highlight.$highlight)
  }
  highlights = []
}

// function isLeftClick(event: MouseEvent) {
//   return event.button === 0
// }

// window.addEventListener('click', event => {
// 	if ($highlight && $highlight.element === event.target) {
// 		return;
// 	}

// 	if (!isLeftClick(event)) {
// 		clearHighlight();
// 		return;
// 	}

// 	clearHighlight();
// 	addHighlight(event.target);
// });
