<p align="center">
  <img src="assets/KargoSetu-LOGO.png" alt="KargoSetu Logo" width="350" />
</p>

# KargoSetu (SIH Problem Statement 26006)
### Intelligent Freight Forecasting & Bulk Cargo Procurement Platform for East Coast of India (SAIL / Ministry of Steel)

[![Project Status: Active](https://www.repostatus.org/badges/latest/active.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](#)
[![Express.js](https://img.shields.io/badge/Express.js-0.104+-009688?logo=express)](#)
[![PostgreSQL](https://img.shields.io/badge/PostGIS-Enabled-336791?logo=postgresql)](#)
[![SIH Problem Statement](https://img.shields.io/badge/SIH-26006-00E5FF)](#)

**KargoSetu** is an enterprise-grade maritime logistics intelligence and predictive chartering system built for the Smart India Hackathon (SIH26006) for the **Ministry of Steel (SAIL)**. It solves the inefficiency of single spot contract dependency by enabling predictive **Short/Medium-Term Contracts of Affreightment (CoA)** and dual-ended port constraint optimization.

---

##  Key SIH 26006 Capabilities

1. **Optimal Market Entry Timing & Quantile Forecasting:**
   - Multi-horizon Quantile Regression (TensorFlow.js P10/P50/P90) predicting 30-, 60-, and 90-day freight rate curves.
   - Automatically detects 12.5% rate dip windows to trigger CoA contract bookings.

2. **Spot vs. Short/Medium-Term CoA ROI Engine:**
   - Evaluates spot contracts against 3-6 month short-term charters and 1-2 year Contracts of Affreightment.
   - Calculates real-time monetary savings in **₹ Crores** for SAIL (est. ₹35.28 Crores / year).

3. **Dual-Ended Port Infrastructure & Vessel Type Optimization:**
   - Origin Ports Covered: Australia (Newcastle/Gladstone), USA (Hampton Roads), Mozambique (Maputo), Russia (Vostochny), Indonesia (Taboneo).
   - East Coast Indian Ports Covered: Paradip, Vizag, Gangavaram, Gopalpur, Dhamra, Sagar-Sandheads, Haldia.
   - Checks Draft, LOA, Beam, and Daily Handling Rates at both origin and destination.
   - Auto-recommends Capesize, Panamax, Supramax, Handysize, or Sagar-Sandheads offshore lighterage & cargo splitting.

4. **Idle Scenario Management & Positioning:**
   - Minimizes vessel idle loss ($25,000/day for Capesize) by computing triangular repositioning routes and coastal coal sub-charters for NTPC/SAIL.

5. **Risk Mitigation & Early Warning Center:**
   - Live alerts for port congestion (e.g. Hampton Roads rail delays), monsoon sea state swells in Bay of Bengal, and market rate opportunity triggers.

6. **IMO Scope 3 Carbon Accounting:**
   - Calculates VLSFO fuel consumption and IMO CO2 emission footprints (3.114 tCO2 per tonne fuel) for green logistics.

---

## ️ System Architecture

*   **Frontend (Next.js 15 App Router & React 18):** Enterprise dark glassmorphism design system built with Tailwind CSS, ECharts, Framer Motion, and Zustand.
*   **Backend (Express.js & Node.js 20):** High-performance maritime physics engine calculating Fresh Water Allowance (FWA), Hydrodynamic Squat, and Dynamic UKC.
*   **Zero-Cost Ecosystem:** 100% free data pipeline using `yfinance` (`BDRY`), Open-Meteo, MapLibre GL, and CARTO Dark tiles.

---

##  Quick Start

```bash
# 1. Clone Repository
git clone https://github.com/IamNishant51/KargoSetu.git
cd KargoSetu

# 2. Run Backend (Express.js)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 3. Run Frontend (Next.js 15)
cd ../frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to launch the Executive Command Center.