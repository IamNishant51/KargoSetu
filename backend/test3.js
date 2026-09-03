const YahooFinance = require('yahoo-finance2').default;
console.log("YahooFinance keys:", Object.keys(YahooFinance));
const instance = new YahooFinance();
console.log("instance keys:", Object.keys(instance.__proto__));
