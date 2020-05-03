import {minimizeEdits} from './minimizeEdits';

test('empty', () => {
	expect(minimizeEdits('', [])).toStrictEqual([]);
});

test('replace at start', () => {
	expect(
		minimizeEdits('hello world', [
			{
				rangeOffset: 0,
				rangeLength: 5,
				text: 'hello'
			}
		])
	).toStrictEqual([]);
});

test('replace at end', () => {
	expect(
		minimizeEdits('hello world', [
			{
				rangeOffset: 6,
				rangeLength: 5,
				text: 'world'
			}
		])
	).toStrictEqual([]);
});

test('partial replace', () => {
	expect(
		minimizeEdits('hello', [
			{
				rangeOffset: 0,
				rangeLength: 5,
				text: 'hi'
			}
		])
	).toStrictEqual([
		{
			rangeOffset: 1,
			rangeLength: 4,
			text: 'i'
		}
	]);
});

test('multiple edits', () => {
	expect(
		minimizeEdits('hello world', [
			{
				rangeOffset: 0,
				rangeLength: 5,
				text: 'hello'
			},
			{
				rangeOffset: 6,
				rangeLength: 5,
				text: 'world'
			}
		])
	).toStrictEqual([]);
});

test('bug 1', () => {
	expect(
		minimizeEdits('<h1>a</h1>', [
			{
				rangeLength: 1,
				rangeOffset: 4,
				text: 'b'
			}
		])
	).toStrictEqual([
		{
			rangeLength: 1,
			rangeOffset: 4,
			text: 'b'
		}
	]);
});
