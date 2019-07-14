import {domdiff} from './HTMLDOMDiff';
import {build} from '../HTMLSimpleDomBuilder/HTMLSimpleDomBuilder';

// Const oldNode1 = build('<h1>hello world</h1>').dom; // ?
// const newNode1 = build('<h1>hello world</h1>').dom; // ?

// newNode1.tagId = 1;

// domdiff(oldNode1, newNode1); // ?

const oldNode1 = build(
	'<meta name="description" content="An interactive getting started guide for Brackets.">'
).dom; // ?
const newNode1 = build(
	'<meta name="description" content="An interactive, awesome getting started guide for Brackets.">'
).dom; // ?

newNode1.tagId = 1;

domdiff(oldNode1, newNode1); // ?
