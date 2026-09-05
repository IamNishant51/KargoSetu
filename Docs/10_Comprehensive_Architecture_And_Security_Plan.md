# MODULE 10: COMPREHENSIVE ARCHITECTURE & SECURITY PLAN

**Author:** Senior Fullstack Developer / Principal Enterprise Architect
**Context:** This document outlines the definitive plan, best practices, and security measures for integrating the Frontend, Backend, Machine Learning Engine, and Database for KargoSetu (SIH26006).

---

## 1. FRONTEND ARCHITECTURE & BEST PRACTICES
**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v4, Shadcn UI, Zustand, TanStack Query, React Hook Form.

### 1.1 Component Strategy
*   **Server Components by Default:** All Next.js components in the `app/` directory will be React Server Components (RSCs) to minimize the JavaScript bundle size and improve SEO/LCP.
*   **Client Boundaries:** Use `"use client"` strictly at the lowest possible level in the component tree. Only interactive elements (e.g., `MarketShockSlider.tsx`, `ConstraintSolverCard.tsx` forms, and ECharts) will be client components.
*   **Design Implementation (Pending Figma):** Once Figma designs are provided, we will map them directly to Shadcn UI components. We will use global CSS variables in `globals.css` (e.g., `--background`, `--primary`) to strictly enforce the nautical theme (`bg-navy-950`).

### 1.2 State Management & Data Fetching
*   **Global State (Zustand):** We will use Zustand for lightweight, cross-component state sharing (e.g., the global `marketShockFactor` affecting multiple charts simultaneously).
*   **Server State (TanStack Query):** All API calls to the Express backend will be wrapped in `@tanstack/react-query`. This provides automatic caching, background refetching, and graceful loading/error states without writing boilerplate `useEffect` hooks.
*   **Form Validation:** Use `react-hook-form` paired with `@hookform/resolvers/zod` to validate all user inputs on the client side before they ever hit the server.

---

## 2. BACKEND ARCHITECTURE & BEST PRACTICES
**Tech Stack:** Node.js, Express.js, Prisma ORM, PostgreSQL. (Pure JavaScript, No TypeScript).

### 2.1 API Design & Structure
*   **Separation of Concerns:** Route handlers (`index.js`) will only handle HTTP requests and responses. All heavy lifting must remain isolated in `services/maritimeMath.js` and `services/mlPredictor.js`.
*   **Graceful Degradation:** The backend must never crash if an external service fails. If PostgreSQL goes down, the API must seamlessly fallback to in-memory hardcoded port data (as currently implemented). If the Open-Meteo API times out, it must fallback to a static 1.5m tidal average.

### 2.2 Database Integration (Prisma + PostgreSQL)
*   **Connection Pooling:** Use Prisma's connection pooling to handle multiple concurrent requests without overwhelming the database connections.
*   **Data Seeding:** The `seed.js` script will be strictly maintained to ensure any developer can spin up the required port bathymetry data (Charted Depth, Permissible Draft) instantly.

---

## 3. MACHINE LEARNING INTEGRATION (TensorFlow.js)
Because TF.js is running in Node.js (via `@tensorflow/tfjs-node`), memory management is absolutely critical.

*   **Memory Leak Prevention:** All tensor operations inside `mlPredictor.js` MUST be wrapped in `tf.tidy()`. This ensures all intermediate tensors are destroyed automatically, preventing the Node.js server from running out of RAM (OOM errors) during repeated forecast requests.
*   **Model Caching:** The LSTM model must be compiled and trained upon server startup (or lazily on the first request) and cached in memory. We cannot afford the CPU overhead of re-training the model on every single API hit.
*   **Hardware Allocation:** The backend must be deployed to a service with sufficient RAM (e.g., Hugging Face Spaces with 16GB RAM) specifically to handle the C++ bindings of TF.js.

---

## 4. END-TO-END WORKFLOW (How Everything Connects)
1.  **User Action:** The user adjusts the "Market Shock" slider or submits the Cargo Requisition form on the Next.js frontend.
2.  **Client Validation:** Zod validates the input instantly.
3.  **API Request:** TanStack Query dispatches an optimized HTTP POST/GET request to the Express Backend.
4.  **Server Validation:** Express uses Zod to re-validate the payload (Double Validation).
5.  **Database Fetch:** Prisma fetches exact bathymetry and tide rules for the requested ports from PostgreSQL.
6.  **Engine Execution:**
    *   `maritimeMath.js` calculates physics constraints (FWA Sinkage, Squat, Dynamic UKC).
    *   `mlPredictor.js` applies the market shock multiplier to the cached TF.js model predictions.
7.  **Response:** A JSON payload is returned.
8.  **Render:** Next.js parses the JSON and smoothly updates the ECharts and UI components.

---

## 5. MILITARY-GRADE SECURITY MEASURES
We must treat the application as an enterprise logistics system.

### 5.1 Backend Security (Express)
*   **Helmet.js:** Install and configure `helmet` to automatically set secure HTTP headers (XSS protection, no-sniff, frameguard).
*   **Strict CORS:** Configure `cors()` to only allow requests from the exact Vercel frontend domain and `localhost`. Reject all other origins.
*   **Rate Limiting:** Implement `express-rate-limit` on the `/api/v1/forecast/rates` endpoint to prevent malicious actors from spamming the ML engine and causing a Denial of Service (DoS) via CPU exhaustion.
*   **Input Sanitization:** Every single payload must pass through strict `zod` schemas. Extraneous keys must be stripped, and types must be enforced.

### 5.2 Frontend Security (Next.js)
*   **Content Security Policy (CSP):** Define a strict CSP in `next.config.ts` to prevent Cross-Site Scripting (XSS) and unauthorized resource loading.
*   **No DangerouslySetInnerHTML:** Strictly forbid the use of `dangerouslySetInnerHTML` in React components to prevent XSS injection.

### 5.3 Infrastructure Security
*   **Environment Variables:** Database connection strings (`DATABASE_URL`), API keys, and JWT secrets must be stored in `.env` files. Ensure `.env` is listed in `.gitignore`. Never hardcode credentials.
*   **SQL Injection Prevention:** By using Prisma ORM for all database transactions, we automatically mitigate direct SQL injection attacks through parameterized queries.
