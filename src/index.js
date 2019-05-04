const parser = require('../built/lang/main.js');

console.log('================');
console.log(' emerald script ');
console.log('================');

const result = parser.parse('hi');

console.log('result: ', result);
