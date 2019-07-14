import {MurmurHash3} from './murmurhash3_gc';

const seed = Math.floor(Math.random() * 65535);

/**
 * Hashes a string.
 * @param {string} string - the input string
 * @return {string} the hashed text
 */
export function hash(string) {
	return MurmurHash3.hashString(string, string.length, seed);
}
