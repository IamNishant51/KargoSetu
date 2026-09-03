const yf = require('yahoo-finance2').default;
async function test() {
    try {
        const res = await yf.quote(['BDRY', '^GSPC']);
        console.log("yf.quote worked!", res.length);
    } catch(e) {
        console.error("yf.quote failed:", e.message);
    }
}
test();
