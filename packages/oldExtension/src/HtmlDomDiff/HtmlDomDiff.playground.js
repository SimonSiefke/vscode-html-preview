import {domdiff} from './HTMLDOMDiff';
import {build} from '../HTMLSimpleDomBuilder/HTMLSimpleDomBuilder';

// Const oldNode1 = build('<h1>hello world</h1>').dom; // ?
// const newNode1 = build('<h1>hello world</h1>').dom; // ?

// newNode1.tagId = 1;

// domdiff(oldNode1, newNode1); // ?

const testCase = {
	previousDom: '<div><h1>x</h1></div>',
	nextDom: '<div><p>y</p><h1>x</h1></div>'
};
const oldNode1 = build(testCase.previousDom).dom; // ?
const newNode1 = build(testCase.nextDom).dom; // ?

newNode1.tagId = 1;

domdiff(oldNode1, newNode1); // ?
