import * as fs from 'fs';
import * as path from 'path';
import {performance} from 'perf_hooks';
import {parseHtml} from '../parse';

const html5Spec = fs.readFileSync(path.join(__dirname, 'fixtures/html5-spec.html'), 'utf-8');

function run() {
	parseHtml(html5Spec);
}

const t0 = performance.now();
run();
const t1 = performance.now();
console.log('took ' + (t1 - t0) + ' milliseconds.');

const t2 = performance.now();
const t3 = performance.now();
console.log('took ' + (t3 - t2) + ' milliseconds.');
