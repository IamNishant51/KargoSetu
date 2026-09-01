# 🚢 KargoSetu - Developer Tour (What Does What?)

Welcome to the team! If you are new to the codebase, don't worry. This guide explains exactly what every major folder and file does in plain, easy-to-understand English.

---

## 💻 1. The Frontend (`frontend/` folder)
This is everything the user sees and interacts with in their browser. It is built using Next.js and React.

### Main Pages
* **`app/page.tsx`**: The **Landing Page**. This is the cool, marketing-style homepage you see when you first visit the site.
* **`app/layout.tsx`**: The **App Wrapper**. This file holds the top navigation bar (with the KargoSetu logo) and the footer. It wraps around every single page automatically.
* **`app/dashboard/page.tsx`**: The **Command Center**. When you click "Launch Dashboard", this is the page that loads.

### UI Components (`components/` folder)
These are the reusable LEGO blocks used to build the dashboard.
* **`ExecutiveDashboard.tsx`**: The main layout grid that holds all the other dashboard components together.
* **`ConstraintSolverCard.tsx`**: The input box where users type in cargo weight and select ports to see if a ship will fit.
* **`ForecastPriceChart.tsx`**: The line graph that draws the AI's future shipping cost predictions.
* **`TradeRouteMap.tsx`**: The visual map that draws lines connecting global ports to India.
* **`IdleFleetManager.tsx`** & **`MarketShockSlider.tsx`**: Smaller interactive widgets on the dashboard.
* **`ui/` folder**: Tiny, basic UI parts like `button.tsx`, `card.tsx`, and `badge.tsx` (provided by Shadcn UI).

---

## ⚙️ 2. The Backend (`backend/` folder)
This is the invisible "engine" running on the server. It does all the heavy math and AI prediction. It is built in pure JavaScript using Express.js.

### The Brain
* **`index.js`**: The **Server Entry Point**. Think of this as a traffic cop. It listens for requests from the frontend (like "evaluate this cargo" or "get the forecast") and sends back the answers.
* **`package.json`**: A simple list of the tools the backend needs to run (like Express and TensorFlow).

### The Services (`services/` folder)
* **`maritimeMath.js`**: The **Calculator**. This file handles the physical physics of ships. It calculates "Squat" (how much a ship sinks when moving fast) and "Sinkage" (how a ship floats differently in fresh vs. salt water) to ensure a ship won't scrape the ocean floor.
* **`mlPredictor.js`**: The **Crystal Ball**. This is our Artificial Intelligence (AI) file. It downloads live stock market data (`yahoo-finance2`), feeds it into a neural network (`TensorFlow.js`), and guesses what shipping prices will be in 90 days.

---

## 📚 3. The Documentation (`Docs/` folder)
These files are strictly for reading. They contain the official rules and planning for the Hackathon.
* **`01_PRD_User_Personas.md`**: Explains *who* we are building this for (e.g., General Managers, Logistics Officers).
* **`04_Backend_Architecture.md`**: Contains the hard math formulas used in `maritimeMath.js`.
* **`05_Machine_Learning.md`**: Explains the logic behind how the AI predicts prices.
* **`08_System_Architecture_Diagrams.md`**: Contains flowchart code (Mermaid) to visually map out how the app works.

---

### 💡 A Note for Developers and AI Agents:
If you create a new file or make a massive change to what a file does, **you must update this document**. Keep it simple, and keep it human-readable!
