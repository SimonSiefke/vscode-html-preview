import {createRunner} from '../run';

const fileName = 'with-external-assets.test.js';
export const run = createRunner({fileName, dirname: __dirname});
