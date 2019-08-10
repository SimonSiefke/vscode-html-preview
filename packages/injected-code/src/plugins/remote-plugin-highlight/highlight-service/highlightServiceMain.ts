// import * as _ from 'lodash';

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
	let $currentElement: HTMLElement | null = $element;
	let offsetLeft = 0;
	let offsetTop = 0;

	// Probably the easiest way to get elements position without including transform
	do {
		offsetLeft += $currentElement.offsetLeft;
		offsetTop += $currentElement.offsetTop;
		$currentElement = $currentElement.offsetParent as HTMLElement;
	} while ($currentElement);

	return {
		left: `${offsetLeft}px`,
		top: `${offsetTop}px`
	};
}

export function getHighlightAnimationStyle(
	originalStyle: CSSStyleDeclaration
): Partial<CSSStyleDeclaration> {
	return {
		animationName: originalStyle.animationName,
		animationDuration: originalStyle.animationDuration,
		animationIterationCount: originalStyle.animationIterationCount,
		animationTimingFunction: originalStyle.animationTimingFunction,
		animationPlayState: originalStyle.animationPlayState
	};
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
		'--padding-left': originalStyle.paddingLeft
	};
}

function dashCase(s) {
	return s.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`);
}

/**
 * Apply an object of styles to an HTML element
 */
export function applyStyle($element: HTMLElement, styleObject: Partial<CSSStyleDeclaration>) {
	for (const [key, value] of Object.entries(styleObject)) {
		$element.style.setProperty(dashCase(key), value);
	}
}

// run `npm run update-highlight-css` to update this code
const baseStyle =
	':host{display:block;--padding-horizontal:calc(var(--padding-left) + var(--padding-right));--padding-vertical:calc(var(--padding-top) + var(--padding-bottom));--margin-horizontal:calc(var(--margin-left) + var(--margin-right));--margin-vertical:calc(var(--margin-top) + var(--margin-bottom));pointer-events:none;width:calc(var(--width) + var(--padding-horizontal));height:calc(var(--height) + var(--padding-vertical));z-index:2000000}.margin,.padding,:host{position:absolute}.content{background:var(--color-content);width:var(--width);height:var(--height);-webkit-transform:translate(var(--padding-left),var(--padding-top));transform:translate(var(--padding-left),var(--padding-top))}.padding{--top:var(--padding-top);--right:var(--padding-right);--bottom:var(--padding-bottom);--left:var(--padding-left);--full-width:calc(var(--width) + var(--padding-horizontal));--full-height:calc(var(--height) + var(--padding-vertical));background:var(--color-padding)}.margin,.padding{-webkit-clip-path:polygon(0 0,0 100%,var(--left) 100%,var(--left) var(--top),calc(var(--full-width) - var(--right)) var(--top),calc(var(--full-width) - var(--right)) calc(var(--full-height) - var(--bottom)),var(--left) calc(var(--full-height) - var(--bottom)),var(--left) 100%,100% 100%,100% 0);clip-path:polygon(0 0,0 100%,var(--left) 100%,var(--left) var(--top),calc(var(--full-width) - var(--right)) var(--top),calc(var(--full-width) - var(--right)) calc(var(--full-height) - var(--bottom)),var(--left) calc(var(--full-height) - var(--bottom)),var(--left) 100%,100% 100%,100% 0);width:var(--full-width);height:var(--full-height)}.margin{--top:var(--margin-top);--right:var(--margin-right);--bottom:var(--margin-bottom);--left:var(--margin-left);--full-width:calc(var(--width) + var(--margin-horizontal) + var(--padding-horizontal));--full-height:calc(var(--height) + var(--margin-vertical) + var(--padding-vertical));background:var(--color-margin);-webkit-transform:translate(calc(-1*var(--margin-left)),calc(-1*var(--margin-top)));transform:translate(calc(-1*var(--margin-left)),calc(-1*var(--margin-top)))}';

const customStyle = {
	'--color-padding': 'rgba(147, 196, 125, 0.55)',
	'--color-margin': 'rgba(246, 178, 107, 0.66)',
	'--color-content': 'rgba(111, 168, 220, 0.66)'
};

function createElement(className: string) {
	const element = document.createElement('div');
	element.className = className;
	return element;
}

class HighlightDomElement extends HTMLElement {
	private _element: HTMLElement | undefined

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
		super();
		this.update = this.update.bind(this);
		// Create a shadow root for scoped styles
		this.attachShadow({mode: 'open'});
		// append the base styles
		this.$style.textContent = baseStyle;
		this.shadowRoot!.append(this.$style);
		// append the margin highlight element
		this.shadowRoot!.append(this.$margin);
		// append the padding highlight element
		this.shadowRoot!.append(this.$padding);
		// append the content highlight element
		this.shadowRoot!.append(this.$content);
	}

	get element() {
		return this._element;
	}

	set element(value: HTMLElement | undefined) {
		this._element = value;
	}

	private update() {
		this._computedStyle = window.getComputedStyle(this.element!);

		const newHighlightStyle = getHighlightStyle(
			this.element!,
			this._boundingRect,
			this._computedStyle
		);

		// if (!_.isEqual(this._highlightStyle, newHighlightStyle)) {
		this._highlightStyle = newHighlightStyle;
		applyStyle(this, this._highlightStyle);
		// }
	}

	// this is like a second constructor, the only difference is that we can change styles now
	connectedCallback() {
		if (!this.element) {
			throw new Error('cannot highlight non existing element');
		}

		applyStyle(this, customStyle);

		this._boundingRect = this.element.getBoundingClientRect();
		// Don't highlight elements with 0 width and height
		// if (this._boundingRect.width === 0 && this._boundingRect.height === 0) {
		//   return
		// }
		this.update();

		/**
		 * we cannot add the animation straight away because then it might not be in sync with the animation of the target element. We also don't want to use requestanimationframe because its not as smooth as animations.
		 */
		const addAnimation = () => {
			this._computedStyle = window.getComputedStyle(this.element!);
			applyStyle(this, getHighlightAnimationStyle(this._computedStyle));
			this.element!.removeEventListener('animationiteration', addAnimation);
		};

		if (this._computedStyle.animationPlayState === 'paused') {
			addAnimation();
		} else {
			let animationFrame: number;
			const update = () => {
				this.update();
				animationFrame = requestAnimationFrame(update);
			};

			this.element.addEventListener('animationiteration', () => {
				cancelAnimationFrame(animationFrame);
				addAnimation();
			});
			update();
		}
	}
}

// Register the custom element
window.customElements.define('highlight-dom-element', HighlightDomElement);

let $highlight: any;
let highlightTimeout: number;

export function addHighlight(element) {
	clearTimeout(highlightTimeout);
	if ($highlight) {
		if ($highlight === element) {
			return;
		}

		clearHighlight();
	}

	$highlight = document.createElement('highlight-dom-element');
	$highlight.element = element;
	document.body.append($highlight);
	highlightTimeout = setTimeout(() => {
		clearHighlight();
	}, 2300);
}

function clearHighlight() {
	if ($highlight) {
		document.body.removeChild($highlight);
		$highlight = undefined;
	}
}

function isLeftClick(event: MouseEvent) {
	return event.button === 0;
}

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