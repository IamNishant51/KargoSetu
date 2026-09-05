delete Heavy ML Predictor with deep learning and live financial data downloads that just produces a toy 3-line graph and falls back to random noise. A simple math/heuristic function returning deterministic bounds. [backend/app/services/ml_predictor.py]
delete Unused dependencies included solely for the over-engineered ML predictor. Remove tensorflow, yfinance, pandas, scikit-learn, numpy from requirements. [backend/requirements.txt]
delete Dead code component `ForecastPriceChart.tsx` and its unused state store `marketStore.ts`. Remove files. [frontend/src/components/ForecastPriceChart.tsx, frontend/src/store/marketStore.ts]
delete Unfinished empty API router and a frontend ticker component that calls it, which only ever returns 404s. Remove files. [backend/app/api/routers/market.py, frontend/src/components/landing/MarketTicker.tsx]
shrink Context provider used for a single boolean state. Lift `useState` to parent `DashboardLayout` and pass as props. [frontend/src/app/dashboard/components/SidebarContext.tsx]
native `axios` HTTP client used for basic GET/POST/DELETE requests. Native Next.js `fetch` API. [frontend/package.json]
delete Unused state management library `zustand` added for a single variable in dead code. Remove from package.json. [frontend/package.json]
delete Empty, completely unused core modules. Remove files. [backend/app/core/config.py, backend/app/core/exceptions.py]

Net lines saved: 489 lines
Net deps saved: 7 dependencies
