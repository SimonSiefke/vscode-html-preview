/* eslint-disable no-labels */
/* eslint-disable valid-jsdoc */

/**
 * @type{{[key:string]:boolean}}
 */
const whitespaceMap = {
	' ': true,
	'\n': true,
	'\t': true,
	'\f': true,
	'\r': true
};

/**
 *
 * @param {string} char
 * @return {boolean}
 */
function isWhitespace(char) {
	return whitespaceMap[char];
}

/**
 *
 * @param {string} source
 * @param {number} position
 */
export function createMultiLineStream(source, position) {
	/**
	 * @type{{length:number}}
	 */
	const {length} = source;

	const functions = {
		get position() {
			return position;
		},
		eos() {
			return length <= position;
		},
		getSource() {
			return source;
		},
		/**
		 *
		 * @param {number} newPosition
		 */
		goTo(newPosition) {
			position = newPosition;
		},
		/**
		 *
		 * @param {number} n
		 */
		goBack(n) {
			position -= n;
		},
		/**
		 *
		 * @param {number} n
		 */
		advance(n) {
			position += n;
		},
		goToEnd() {
			position = source.length;
		},
		/**
		 *
		 * @param {string} firstChar
		 * @param {string} secondChar
		 */
		raceBackUntilChars(firstChar, secondChar) {
			position--;
			while (
				position >= 0 &&
				source[position] !== firstChar &&
				source[position] !== secondChar
			) {
				position--;
			}

			position++;
			if (position === 0) {
				return '';
			}

			return source[position - 1];
		},
		/**
		 *
		 * @param {string} char
		 */
		goBackToUntilChar(char) {
			while (position >= 0 && source[position] !== char) {
				position--;
			}

			position++;
		},
		/**
		 *
		 * @param {string} chars
		 */
		goBackToUntilChars(chars) {
			const reversedChars = chars
				.split('')
				.reverse()
				.join('');
			outer: while (position >= 0) {
				for (let i = 0; i < reversedChars.length; i++) {
					if (source[position - i] !== reversedChars[i]) {
						position--;
						continue outer;
					}
				}

				break;
			}

			position++;
		},
		/**
		 *
		 * @param  {...string} chars
		 */
		goBackToUntilEitherChar(...chars) {
			while (position >= 0 && !chars.includes(source[position])) {
				position--;
			}

			position++;
		},
		/**
		 *
		 * @param  {...string} chars
		 */
		advanceUntilEitherChar(...chars) {
			while (position < source.length && !chars.includes(source[position])) {
				position++;
			}
			// Position--
		},
		peekLeft(n = 0) {
			return source[position - n];
		},
		/**
		 *
		 * @param {string} chars
		 */
		currentlyEndsWith(chars) {
			for (let i = 0; i < chars.length; i++) {
				if (source[position - i - 1] !== chars[chars.length - 1 - i]) {
					return false;
				}
			}

			return true;
		},
		/**
		 *
		 * @param {RegExp} regex
		 */
		currentlyEndsWithRegex(regex) {
			return regex.test(source.slice(0, position));
		},
		previousChar() {
			return source[position];
		},
		/**
		 *
		 * @param {number} n
		 */
		previousChars(n) {
			return source.slice(position - n, position);
		},
		nextChar() {
			return source[position + 1];
		},
		/**
		 *
		 * @param {number} n
		 */
		nextChars(n) {
			return source.slice(position, position + n);
		},
		peekRight(n = 0) {
			return source[position + n] || '';
		},
		/**
		 *
		 * @param {string} ch
		 */
		advanceIfChar(ch) {
			if (ch === source[position]) {
				position++;
				return true;
			}

			return false;
		},
		/**
		 *
		 * @param {string} ch
		 */
		advanceIfChars(ch) {
			if (position + ch.length > source.length) {
				return false;
			}

			for (let i = 0; i < ch.length; i++) {
				if (source[position + i] !== ch[i]) {
					return false;
				}
			}

			functions.advance(ch.length);
			return true;
		},
		/**
		 *
		 * @param {RegExp} regex
		 */
		advanceIfRegExp(regex) {
			const str = source.substr(position);
			const match = str.match(regex);
			if (match && match.index !== undefined) {
				position = position + match.index + match[0].length;
				return match[0];
			}

			return undefined;
		},
		/**
		 *
		 * @param {RegExp} regex
		 */
		advanceUntilRegExp(regex) {
			const str = source.substr(position);
			const match = str.match(regex);
			if (match && match.index !== undefined) {
				position += match.index;
				return match[0];
			}

			functions.goToEnd();

			return undefined;
		},
		/**
		 *
		 * @param {string} ch
		 */
		advanceUntilChar(ch) {
			while (position < source.length) {
				if (source[position] === ch) {
					return true;
				}

				functions.advance(1);
			}

			return false;
		},
		/**
		 *
		 * @param {string} ch
		 */
		advanceUntilChars(ch) {
			while (position + ch.length <= source.length) {
				let i = 0;
				while (i < ch.length && source[position + i] === ch[i]) {
					i++;
				}

				if (i === ch.length) {
					return true;
				}

				functions.advance(1);
			}

			functions.goToEnd();
			return false;
		},
		skipWhitespace() {
			const initialPosition = position;
			while (position < length && isWhitespace(source[position])) {
				position++;
			}

			return position - initialPosition > 0;
		}
	};
	return functions;
}
