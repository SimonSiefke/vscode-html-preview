import {MurmurHash3} from './murmurhash3_gc';

const seed = 48434; // Random int between 0 and 65535

/**
 * Hashes a string.
 * @param {string} string - the input string
 * @return {string} the hashed text
 */
export function hash(string) {
	return MurmurHash3.hashString(string, string.length, seed);
}
