const os = require('os');

os.tmpdir(); // ?

eval('fs.readFileSync(path.join(__dirname, `process.js`))'); // ?
// TODO use this for caching
