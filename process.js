const fs = require('fs');
const util = require('util');
const log_file = fs.createWriteStream(__dirname + '/debug.log', {flags: 'w'});

setInterval(() => {
	log_file.write(
		JSON.stringify(
			{
				time: 2222,
				previousDom: '<h1>a</h1>',
				nextDom: '<h1>b</h1>',
				contentChanges: [
					{
						rangeLength: 0,
						text: 'b',
						rangeOffset: 4
					}
				]
			},
			null,
			2
		) + '\n'
	);
}, 1000);
