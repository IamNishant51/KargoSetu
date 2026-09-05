# KargoSetu - Developer Tour (What Does What?)

Welcome to the team! If you are new to the codebase, don't worry. This guide explains exactly what every major folder and file does in plain, easy-to-understand English.

---

## 1. The Frontend (frontend/ folder)
This is everything the user sees and interacts with in their browser. It is built using Next.js and React.

### Main Pages
* **`app/page.tsx`**: The **Landing Page**. The comprehensive, high-converting homepage featuring the hero section, live Baltic ticker, interactive sandbox, and SIH 26006 problem specifications.
* **`app/layout.tsx`**: The **App Wrapper**. This file sets up application metadata, fonts, and global client providers.
* **`app/dashboard/page.tsx`**: The **Command Center**. When you click "Launch Dashboard", this is the page that loads. **New Update:** The static mock UI has been completely wired up using TanStack React Query to display real-time live calculations from the backend!

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
This is the invisible "engine" running on the server. It handles all the heavy math and AI predictions. **New Update:** It has been completely migrated to a hyper-optimized **Python** stack using **FastAPI**!

### The Brain
* **`main.py`**: The **Server Entry Point**. Think of this as a traffic cop. It uses FastAPI for ultra-fast routing. When running in production, it is managed by **Gunicorn** with Uvicorn workers to handle heavy concurrent traffic without breaking a sweat. We also utilize **ORJSON** here for the fastest possible JSON response serialization.
* **`api/` folder**: Contains specific API endpoints modularized by feature (`health`, `requisitions`, `forecast`) to keep the codebase maintainable.
* **`requirements.txt`**: A simple list of the tools the backend needs to run (like FastAPI, Prisma, and ONNX Runtime).
### The Services (`services/` folder)
* **`maritimeMath.py`**: The **Calculator**. This file handles the physical physics of ships. It calculates "Squat" and "Sinkage" to ensure a ship won't scrape the ocean floor. It dynamically fetches critical port constraints directly from the PostgreSQL database.
* **`mlPredictor.py`**: The **Crystal Ball**. This is our Artificial Intelligence (AI) file. **New Update:** We migrated off TensorFlow.js! We now export our Python LSTM models to **ONNX** format. The predictor uses **ONNX Runtime** for bare-metal C++ inference speeds, drastically reducing prediction latency and memory overhead.
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
* **Frontend:** Use React Server Components by default. Use `"use client"` only when necessary. **New Update:** We are leveraging Next.js 15 with the **React Compiler**, which automatically memoizes components—you do not need to manually write `useMemo` or `useCallback` anymore! We strictly enforce **ESLint** and **WCAG Accessibility** standards to keep the UI bug-free and inclusive.
* **Backend:** Keep the FastAPI routes thin. Do the heavy math in the `services/` folder. Use **Pydantic** for strict input validation on every single API route. Utilize **ORJSON** for serialization to maintain high throughput.
* **ML & DB:** Run **ONNX Runtime** in asynchronous threads (`asyncio.to_thread()`) to prevent I/O blocking during inference. Use Prisma for all database queries to prevent SQL injection.
* **DevOps & Security:** Never expose `.env` variables to the frontend. The entire application is deployed using **multi-stage Docker builds** to ensure minimal image sizes and a secure, hardened runtime environment. The backend must use strict CORS policies and Rate Limiting.
---

### A Note for Developers and AI Agents:
If you create a new file or make a massive change to what a file does, **you must update this document**. Keep it simple, and keep it human-readable!
