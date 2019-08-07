/* eslint-disable no-underscore-dangle, no-restricted-syntax, import/named */
// eslint-disable-next-line import/extensions, import/no-webpack-loader-syntax, import/no-unresolved
import baseStyle from 'raw-loader!./baseStyle.css';
import * as _ from 'lodash';
import {getHighlightStyle, applyStyle, HighlightStyle, getHighlightAnimationStyle} from './util';

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

		if (!_.isEqual(this._highlightStyle, newHighlightStyle)) {
			this._highlightStyle = newHighlightStyle;
			applyStyle(this, this._highlightStyle);
		}
	}

	connectedCallback() {
		if (!this.element) {
			throw new Error('cannot highlight non existing element');
		}

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
