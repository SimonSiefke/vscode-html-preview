import { createRunner } from '../run';

const fileName = 'with-image.test.js';
export const run = createRunner({fileName, dirname: __dirname});
