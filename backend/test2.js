const yf = require('yahoo-finance2').default;
let instance;
try { instance = yf(); console.log(Object.keys(instance)); } catch(e) {}
try { instance = new yf(); console.log(Object.keys(instance)); } catch(e) {}
