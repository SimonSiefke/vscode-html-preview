import {MurmurHash3} from './murmurhash3_gc';

const seed = 48434; // Random int between 0 and 65535

/**
 * Hashes a string.
 */
export function hash(string: string): string {
	return MurmurHash3.hashString(string, string.length, seed);
}
