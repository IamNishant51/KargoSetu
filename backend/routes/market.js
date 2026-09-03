const express = require('express');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const router = express.Router();

const SYMBOLS = {
    'BDRY': 'Baltic Dry Index',
    '^GSPC': 'S&P 500',
    'CL=F': 'Crude Oil'
};

router.get('/ticker', async (req, res, next) => {
    try {
        const symbolsList = Object.keys(SYMBOLS);
        const results = await yahooFinance.quote(symbolsList);
        
        const responseData = results.map(quote => {
            const value = quote.regularMarketPrice || 0;
            const previousClose = quote.regularMarketPreviousClose || value;
            
            let deltaNum = 0;
            if (previousClose > 0) {
                deltaNum = ((value - previousClose) / previousClose) * 100;
            }
            
            const isPositive = deltaNum >= 0;
            const deltaStr = (isPositive ? '+' : '') + deltaNum.toFixed(2) + '%';
            
            return {
                symbol: quote.symbol,
                name: SYMBOLS[quote.symbol] || quote.shortName || quote.symbol,
                value: value.toFixed(2),
                delta: deltaStr,
                isPositive,
                isSpecial: quote.symbol === 'BDRY'
            };
        });
        
        res.json(responseData);
    } catch (error) {
        next(error);
    }
});

module.exports = router;