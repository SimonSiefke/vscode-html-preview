export const measurePerformance = fn => (...args) => {
	const start = performance.now();
	fn(...args);
	const end = performance.now();
	console.log('Call to doSomething took ' + (end - start) + ' milliseconds.');
};
