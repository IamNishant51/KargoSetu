# KargoSetu - Developer Tour (What Does What?)

Welcome to the team! If you are new to the codebase, don't worry. This guide explains exactly what every major folder and file does in plain, easy-to-understand English.

---

## 1. The Frontend (frontend/ folder)
This is everything the user sees and interacts with in their browser. It is built using Next.js and React.

### Main Pages
* **`app/page.tsx`**: The **Landing Page**. The comprehensive, high-converting homepage featuring the hero section, live Baltic ticker, interactive sandbox, and SIH 26006 problem specifications.
* **`app/layout.tsx`**: The **App Wrapper**. This file sets up application metadata, fonts, and global client providers.
* **`app/dashboard/page.tsx`**: The **Command Center**. When you click "Launch Dashboard", this is the page that loads.

### Landing Page Components (`components/landing/` folder)
* **`Navbar.tsx`**: Sticky responsive navigation with desktop solutions dropdown and mobile drawer.
* **`HeroSection.tsx`**: Hero section with Indian tricolor arch ship artwork and floating live Market Snapshot card.
* **`MarketTicker.tsx`**: Real-time marquee ticker streaming live Baltic indices and East Coast port tide levels.
* **`SocialProofLogos.tsx`**: Authentic SVG vector marks for MAERSK, MSC, COSCO SHIPPING, CMA CGM, Hapag-Lloyd, and EVERGREEN.
* **`SolutionsSection.tsx`**: Three-card solutions grid for Market Intelligence, Charter & Freight, and Operations Hub.
* **`InteractiveSandbox.tsx`**: Interactive simulator featuring Port Constraint Solving, ML Volatility Shock testing, and SAIL PSU Financial ROI calculations. **New Update:** This component is now live-wired to the backend API via React Query, discarding static mock data to display real-time evaluations and forecasts!
* **`BentoFeatures.tsx`**: Four-pillar bento grid detailing Hydrodynamics, TensorFlow.js LSTM, Sandheads Lighterage, and Green Fleet ESG.
* **`PortCorridor.tsx`**: East Coast India bathymetry telemetry cards for Haldia, Paradip, Dhamra, and Sandheads.
* **`WorkflowSection.tsx`**: Four-step automated procurement process from requisition to demurrage-free berthing.
* **`TestimonialsSection.tsx`**: Persona-driven executive endorsements from SAIL, Haldia Dock Complex, and NMDC.
* **`FaqSection.tsx`**: Interactive accordion answering key questions on bathymetry, LSTM models, and ERP integration.
* **`CtaSection.tsx`**: Conversion call-to-action banner for launching the Executive Command Center.
* **`Footer.tsx`**: Complete enterprise footer with port corridors, SIH 26006 problem badge, and system status.
* **`DemoModal.tsx`**: Interactive 4-chapter guided walkthrough modal triggered by Watch Demo buttons.

### UI Components (`components/` folder)
These are the reusable LEGO blocks used to build the dashboard.
* **`ExecutiveDashboard.tsx`**: The main layout grid that holds all the other dashboard components together.
* **`ConstraintSolverCard.tsx`**: The input box where users type in cargo weight and select ports to see if a ship will fit.
* **`ForecastPriceChart.tsx`**: The line graph that draws the AI's future shipping cost predictions.
* **`TradeRouteMap.tsx`**: The visual map that draws lines connecting global ports to India.
* **`IdleFleetManager.tsx`** & **`MarketShockSlider.tsx`**: Smaller interactive widgets on the dashboard.
* **`ui/` folder**: Tiny, basic UI parts like button, card, and badge (provided by Shadcn UI).

---

## 2. The Backend (`backend/` folder)
This is the invisible "engine" running on the server. It does all the heavy math and AI prediction. It is built in pure JavaScript using Express.js.

### The Brain
* **`index.js`**: The **Server Entry Point**. Think of this as a traffic cop. It utilizes `helmet`, `morgan`, and global error handlers to secure and direct traffic to the modular router files.
* **`routes/` folder**: Contains specific API endpoints modularized by feature (`health.js`, `requisitions.js`, `forecast.js`) to keep the codebase maintainable.
* **`middleware/` folder**: Contains the global error handler (`errorHandler.js`) and rate limiters to protect the ML endpoints.
* **`package.json`**: A simple list of the tools the backend needs to run (like Express and TensorFlow).
### The Services (`services/` folder)
* **`maritimeMath.js`**: The **Calculator**. This file handles the physical physics of ships. It calculates "Squat" and "Sinkage" to ensure a ship won't scrape the ocean floor. **New Update:** It now fetches real-time dynamic tide/wave data directly from the **Open-Meteo Marine API** instead of using static numbers!
* **`mlPredictor.js`**: The **Crystal Ball**. This is our Artificial Intelligence (AI) file. It downloads live stock market data (`yahoo-finance2`), computes historical daily volatility, and feeds it into a neural network (`TensorFlow.js`). It includes a resilient fallback to generate statistically valid baseline data if Yahoo Finance rate-limits us.
---

### The Database (`prisma/` folder)
* **`schema.prisma`**: The **Blueprint**. We added Prisma ORM to talk to a PostgreSQL database! This file defines what our port data looks like (Charted Depth, Permissible Draft, etc.) and also tracks the `Vessel` fleet (Capesize, Panamax, Supramax, Handysize).
* **`seed.js`**: The **Data Filler**. A script used to load real-world bathymetry data for ports like Haldia, Paradip, and Dhamra, and fleet specs into the database. Note: The `/api/v1/requisitions/evaluate` endpoint now dynamically queries this database via Prisma, but automatically falls back to safe mock data if the database isn't connected so the dashboard keeps working!

## 3. The Documentation (`Docs/` folder)
These files are strictly for reading. They contain the official rules and planning for the Hackathon.
* **`01_PRD_User_Personas.md`**: Explains *who* we are building this for (e.g., General Managers, Logistics Officers).
* **`04_Backend_Architecture.md`**: Contains the hard math formulas used in `maritimeMath.js`.
* **`05_Machine_Learning.md`**: Explains the logic behind how the AI predicts prices.
* **`08_System_Architecture_Diagrams.md`**: Contains flowchart code (Mermaid) to visually map out how the app works.
* **`10_Comprehensive_Architecture_And_Security_Plan.md`**: The definitive **Master Plan**. It details exactly how the Frontend, Backend, Machine Learning, and Database connect securely. It outlines all best practices (Next.js App Router, TF.js memory management, and Enterprise Security). **Read this before writing any new code.**

---

## 4. Core Best Practices & Security
If you are writing code for KargoSetu, you MUST follow these rules (detailed fully in Doc 10):
* **Frontend:** Use React Server Components by default. Use `"use client"` only when necessary. We strictly use **Zustand** (e.g., `marketStore.ts`) for global state and **TanStack Query** (via `<Providers>`) for API calls.
* **Backend:** Keep the Express routes thin. Do the heavy math in the `services/` folder. Use **Zod** for strict input validation on every single API route.
* **ML & DB:** Wrap all TensorFlow.js operations in `tf.tidy()` to prevent memory leaks. Use Prisma for all database queries to prevent SQL injection.
* **Security:** Never expose `.env` variables to the frontend. The backend must use Helmet.js, strict CORS policies, and Rate Limiting to prevent CPU-exhaustion attacks on the AI engine.

---

### A Note for Developers and AI Agents:
If you create a new file or make a massive change to what a file does, **you must update this document**. Keep it simple, and keep it human-readable!
