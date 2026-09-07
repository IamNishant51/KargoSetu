##  2. SIH26006 (Ministry of Steel)
### **Title:** Intelligent Freight Forecasting & Vessel Chartering Model for Overseas Bulk Cargo to East Coast of India

####  The Super Simple Analogy:
> **"It's like Uber / MakeMyTrip for Giant Cargo Ships carrying Coal & Iron Ore!"**

####  What is the problem?
Indian Steel giants (like SAIL, RINL, NTPC) import millions of tonnes of coal and iron ore from Australia and Indonesia to East Coast Indian ports (Paradip, Vizag, Haldia).
Ship rental rates (vessel chartering) change every single day like stock prices or flight tickets. If a logistics manager books a ship on the wrong day, or rents a massive ship that is too deep for a shallow port like Haldia, the company loses **crores of rupees** in waiting fees (demurrage).

####  How our app solves it (What we build):
1. **Predict Ship Rates:** AI forecasts ship rental prices for the next 30 to 90 days.
2. **Best Booking Window:** Tells managers: *"Don't book today! Rates will drop by 15% next week—wait 8 days to book."*
3. **Smart Ship Selection:** Matches cargo size and port water depth (e.g., recommending a *Panamax* ship for Paradip port vs. a *Handysize* ship for shallow Haldia port).

####  Why explain this to your Mentor/Team?
* **Why Team Will Love It:** **Very Low Competition!** Most student teams avoid maritime logistics because they think it's too hard. But we can fetch all the data for free in 2 lines of Python using `yfinance` (`BDRY` ETF)!
* **Why Mentor Will Love It:** Shows massive real-world monetary savings ($200,000+ per ship delivery) for steel PSUs.

---

## Backend Run Instructions (Python/FastAPI)

To run the recently migrated Python FastAPI backend locally:

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Generate the Prisma Python client (this must be done before starting the server):
   ```bash
   prisma generate
   ```
4. Start the ASGI Uvicorn server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 7860 --reload
   ```

*The backend API will be live at `http://localhost:7860`.*


---

### Potential Judge Questions

Based on the provided documentation, here are 10 thoughtful and probing questions I would ask the team as a technical judge:

1. **Proxy Data Validity:** You mentioned using the `BDRY` ETF via `yfinance` as a "free" way to fetch data. Since this ETF represents a generalized global basket of dry bulk freight futures, how are you mathematically extrapolating route-specific (e.g., Australia/Indonesia to East Coast India) and vessel-specific rates from a broad global index?
2. **Model Confidence & Risk Management:** Forecasting financial/freight markets 30 to 90 days out is notoriously difficult and volatile. What specific machine learning models are you using, and do you provide confidence intervals to logistics managers so they know the risk level of "waiting 8 days to book"?
3. **Vessel Class Discrepancies:** The `BDRY` ETF tracks Capesize, Panamax, and Supramax futures. However, your documentation explicitly mentions recommending *Handysize* ships for shallow ports like Haldia. How is your AI forecasting rates for vessel classes that are not directly represented in your primary data source?
4. **Handling Demurrage Dynamics:** Your problem statement notes the loss of crores in demurrage (waiting fees). Does your "Smart Ship Selection" algorithm dynamically factor in real-time port congestion and unloading speeds, or is it strictly matching the static vessel draft to the port depth?
5. **Operational Deadlines vs. Savings:** Your "Best Booking Window" advises managers to delay bookings to save money. How does your algorithm balance the predicted freight savings against the rigid supply chain deadlines required to keep a massive steel plant (like SAIL or RINL) operational without running out of coal or iron ore?
6. **Backend Data Ingestion:** I see you are using a Python FastAPI backend. How is the real-time or daily data ingestion pipeline structured? Are you utilizing background tasks (e.g., Celery or FastAPI's BackgroundTasks) to periodically pull and process the `yfinance` data without blocking client requests?
7. **Database Architecture:** You are using Prisma as your ORM. How is your database schema structured to handle the complex, many-to-many relationships between historical time-series data, varying port specifications (like water depth), and specific cargo volume requirements?
8. **Geopolitical and External Variables:** Shipping rates are highly susceptible to sudden global events, weather (like cyclones in the Bay of Bengal), and geopolitical tensions. Does your forecasting model rely purely on historical univariate price data, or are you engineering features to account for external market shocks?
9. **Origin-Destination Specifics:** Importing coal from Australia versus Indonesia involves vastly different transit times, distances, and freight economics. How does your model parameterize the specific origin country when calculating the forecasting and chartering window for the East Coast of India?
10. **Enterprise Integration:** Indian steel PSUs typically rely on secure, legacy ERP systems. How have you designed your FastAPI architecture and API endpoints to ensure secure, seamless integration into their existing procurement and logistics workflows?
