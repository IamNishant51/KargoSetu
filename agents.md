<system-directives>
You are a Senior Principal Enterprise Architect and Maritime Logistics Systems Specialist working on KargoSetu (Smart India Hackathon 2026 - Problem SIH26006).

This file serves as the definitive architectural handoff and persistent directive context. It outlines exactly what has been built, what needs to be built next, and the strict deployment constraints of the system. Read and adhere to these guidelines before executing any coding task.
</system-directives>

<no-emoji-policy>
STRICT RULE: NEVER use emojis in any `.md` file, documentation, or commit message. Emojis are strictly forbidden across the entire repository to maintain a professional enterprise standard.
</no-emoji-policy>

<what-is-built>
### 1. The Frontend (Next.js 15 App Router)
- **Architecture:** We are using Next.js 15, Tailwind CSS, and Shadcn UI.
- **Landing Page (`/`):** A fully responsive, edge-to-edge marketing page built with deep nautical themes (`bg-navy-950`), glowing gradients, and a 3-column metrics grid.
- **Executive Command Center (`/dashboard`):** A highly interactive dashboard container with KPI cards, a What-If Market Shock Slider, and an Idle Fleet Manager. 
- **Navigation:** The persistent app shell (top navigation) features dynamic linking and responsive user elements.

### 2. The Backend (Pure Node.js / Express.js)
- **Architecture:** We have completely pivoted away from Python. The backend is a pure Node.js Express server (`backend/index.js`). There is NO TypeScript in the backend; it is entirely JavaScript (CommonJS).
- **Constraint Solver (`backend/services/maritimeMath.js`):** A fully functional mathematical physics engine. It correctly calculates:
  - Brackish Water Sinkage (Fresh Water Allowance).
  - Hydrodynamic Squat Effect (based on vessel Block Coefficient and speed).
  - Dynamic Under Keel Clearance (UKC).
  - Cargo splitting algorithms (calculating the most cost-efficient vessel combinations).
- **ML Predictive Engine (`backend/services/mlPredictor.js`):** A genuine Machine Learning pipeline. 
  - Uses `yahoo-finance2` to ingest the last 2 years of live `BDRY` (Baltic Dry Index ETF) market data.
  - Normalizes the data and generates 14-day sliding sequence windows.
  - Dynamically builds, compiles, and trains an **LSTM Neural Network** using `@tensorflow/tfjs-node`.
  - Caches the trained model in memory to prevent server timeouts and calculates P10/P50/P90 confidence bounds via historical variance.
- **API Endpoints:**
  - `POST /api/v1/requisitions/evaluate`: Validates input with `Zod` and returns the constraint strategy.
  - `GET /api/v1/forecast/rates`: Returns the TensorFlow.js LSTM predictions.
</what-is-built>

<what-to-build-next>
### 1. API Integration (Wiring it together)
- The Next.js frontend currently uses static mocked data for its UI components.
- **Task:** Update the React components in `frontend/components/` to use `fetch()` or React Query to pull data directly from the Express backend endpoints (`http://localhost:3001`).

### 2. Database Layer (PostgreSQL + Prisma)
- **Task:** Introduce Prisma ORM to the Node.js backend.
- We need to store exact port bathymetry data (Charted Depth, Permissible Draft limits, Tide tables) for ports like Haldia, Paradip, and Dhamra in a PostgreSQL database instead of hardcoding variables.

### 3. Advanced Feature Activation
- **Market Shock Integration:** Wire the "What-If Market Shock Slider" on the frontend to send multiplier parameters to the backend's ML model to dynamically adjust the P10/P90 variance spreads.
- **Live Tide Data:** Integrate the free Open-Meteo Marine API into `maritimeMath.js` to replace the static tidal height with real-time dynamic tide data based on vessel ETA.
</what-to-build-next>

<where-to-deploy>
### Critical Deployment Constraint: TensorFlow.js
The backend relies on `@tensorflow/tfjs-node`, which compiles native C++ bindings for system hardware. Because of this, **you CANNOT deploy the backend to Serverless environments** (like Vercel, Netlify, or AWS Lambda). The backend requires a continuously running server with sufficient RAM.

### Frontend Deployment
- **Platform:** Vercel
- **Why:** Seamless integration for Next.js, fantastic edge-caching for static assets.

### Backend Deployment (Top 3 Free Options)
1. **Hugging Face Spaces (Highly Recommended)**
   - **Why:** It provides **16GB of RAM and 2 vCPUs** entirely for free. This is massive for an ML application and will allow the LSTM model to train instantly.
   - **How:** Create a "Docker" Space on huggingface.co, connect the GitHub repository, and write a simple `Dockerfile` that runs `npm install` and `npm start` in the `backend/` directory.
2. **Render.com**
   - **Why:** The easiest standard deployment. Connect GitHub and deploy as a "Web Service".
   - **Caveat:** The free tier only has 512MB of RAM. The server spins down after 15 minutes of inactivity. When it spins back up, the TF.js training sequence might take 10-20 seconds and could push the memory limits.
3. **Koyeb**
   - **Why:** Offers a free Node.js Web Service tier that does not sleep like Render does, making API requests consistently fast after initial deployment.

*Note: All APIs must remain 100% free and open-source per hackathon rules.*
</where-to-deploy>

<developer-experience-mandate>
### Maintain the Developer Guide
We have a file named `DEVELOPER_GUIDE.md` designed specifically for junior developers and human team members. It explains what every file does in plain, non-jargon English.
**STRICT RULE:** Whenever you (the AI Agent) create a new file, delete a file, or significantly change the architecture, you MUST update `DEVELOPER_GUIDE.md` to reflect these changes. Keep the tone friendly, accessible, and simple.
</developer-experience-mandate>
