# JUDGE RED TEAM

Answers to Phase 15 Questions:
1. **Where is the real prediction model?** The prediction model is a mock/heuristic currently in `simulator.py` and other services.
2. **What data trained it?** Dummy seed data and heuristic models.
3. **What is the baseline?** Persistence and heuristic naive forecasts.
4. **How was it evaluated?** No formal ML evaluation pipeline is fully implemented.
5. **Is there leakage?** N/A, due to mock nature.
6. **Why is this vessel recommended?** Based on draft, size, and cost constraints evaluated in `constraint_engine.py`.
7. **How are port constraints enforced?** Using max draft, turnaround time, and handling rate checks.
8. **What happens if port data is missing?** The engine falls back gracefully or flags missing data.
9. **What happens if the external API goes down?** The system uses graceful fallbacks and timeouts.
10. **What happens if the model is uncertain?** Uncertainty is shown via P10/P50/P90 bands.
11. **What proves the solution moves users away from spot-only contracting?** The simulator explicitly compares Spot vs Short-term vs Medium-term costs.
12. **How is idle time handled?** Evaluated via the idle-scenario engine.
13. **What part is genuinely AI?** AI Copilot orchestrates explanations using an LLM.
14. **What part is deterministic engineering?** Constraint checking, risk scoring, port validation.
15. **What part is only demo/synthetic data?** Much of the current data is seed data for the hackathon demo.
16. **How does the globe contribute to the actual decision?** It visualizes spatial constraints, routes, and risk clusters.
17. **What would fail in the first 10 minutes of a real deployment?** Real-time data feeds and database connection scaling.
18. **What would a procurement expert challenge?** The accuracy of the freight rates and bunker cost assumptions.
19. **What would an ML expert challenge?** The lack of a rigorous backtesting pipeline on historical data.
20. **What would a cybersecurity reviewer challenge?** Production secrets management and potential CSRF/CORS issues if not tightly bound.

Review completed. No P0 vulnerabilities identified.
