const YahooFinance = require('yahoo-finance2').default;
async function test() {
    try {
        const instance = new YahooFinance();
        const res = await instance.quote(['BDRY', '^GSPC']);
        console.log("instance.quote worked!", res.length);
    } catch(e) {
        console.error("instance.quote failed:", e.message);
    }
}
test();
