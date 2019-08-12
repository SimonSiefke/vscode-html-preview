import * as fs from 'fs';
import * as path from 'path';
import {performance} from 'perf_hooks';
import {genDom} from '../genDom';

const html5Spec = fs.readFileSync(path.join(__dirname, 'fixtures/html5-spec.html'), 'utf-8');

function run() {
	genDom(html5Spec);
}

const t0 = performance.now();
run();
const t1 = performance.now();
console.log('took ' + (t1 - t0) + ' milliseconds.');
